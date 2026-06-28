const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret-in-production';
const BUSINESS_HOURS = { start: 9, end: 19 };
const SLOT_INTERVAL = 60;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Service name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    duration: { type: Number, required: [true, 'Duration is required'], min: 15 },
    category: {
      type: String,
      enum: ['hair', 'skin', 'nails', 'spa', 'other'],
      default: 'other',
    },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: String, required: [true, 'Appointment date is required'] },
    timeSlot: { type: String, required: [true, 'Time slot is required'] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String, trim: true, default: '' },
    pricePaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

appointmentSchema.index({ service: 1, date: 1, timeSlot: 1, status: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
const Appointment =
  mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'Not authorised: no token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const generateSlots = (durationMinutes) => {
  const slots = [];

  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h += 1) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      const endMinutes = h * 60 + m + durationMinutes;
      if (endMinutes <= BUSINESS_HOURS.end * 60) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }

  return slots;
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Salon API is running' });
});

app.post(
  '/api/auth/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });
    return res.status(201).json({ ...publicUser(user), token: generateToken(user._id) });
  })
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ ...publicUser(user), token: generateToken(user._id) });
  })
);

app.get('/api/auth/me', protect, (req, res) => {
  res.json(publicUser(req.user));
});

app.get(
  '/api/services',
  asyncHandler(async (req, res) => {
    const services = await Service.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json(services);
  })
);

app.get(
  '/api/services/all',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  })
);

app.get(
  '/api/services/:id',
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  })
);

app.post(
  '/api/services',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { name, description, price, duration, category, image } = req.body;
    if (!name || !description || !price || !duration) {
      return res
        .status(400)
        .json({ message: 'Name, description, price and duration are required' });
    }

    const service = await Service.create({ name, description, price, duration, category, image });
    return res.status(201).json(service);
  })
);

app.put(
  '/api/services/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  })
);

app.delete(
  '/api/services/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json({ message: 'Service removed' });
  })
);

app.get(
  '/api/appointments/slots',
  protect,
  asyncHandler(async (req, res) => {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) {
      return res.status(400).json({ message: 'serviceId and date are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const booked = await Appointment.find({
      service: serviceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSet = new Set(booked.map((appointment) => appointment.timeSlot));
    const slots = generateSlots(service.duration).filter((slot) => !bookedSet.has(slot));

    return res.json({ date, slots });
  })
);

app.post(
  '/api/appointments',
  protect,
  asyncHandler(async (req, res) => {
    const { serviceId, date, timeSlot, notes } = req.body;
    if (!serviceId || !date || !timeSlot) {
      return res.status(400).json({ message: 'serviceId, date and timeSlot are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isAvailable) {
      return res.status(404).json({ message: 'Service not available' });
    }

    const conflict = await Appointment.findOne({
      service: serviceId,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: 'This time slot is already booked. Please pick another.' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      service: serviceId,
      date,
      timeSlot,
      notes,
      pricePaid: service.price,
    });

    const populated = await appointment.populate(['service', 'user']);
    return res.status(201).json(populated);
  })
);

app.get(
  '/api/appointments/my',
  protect,
  asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('service')
      .sort({ date: -1, timeSlot: -1 });
    res.json(appointments);
  })
);

app.put(
  '/api/appointments/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const ownsAppointment = appointment.user.toString() === req.user._id.toString();
    if (!ownsAppointment && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    return res.json(appointment);
  })
);

app.get(
  '/api/appointments/admin/all',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration')
      .sort({ date: -1, timeSlot: -1 });

    res.json(appointments);
  })
);

app.put(
  '/api/appointments/admin/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user service');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    return res.json(appointment);
  })
);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});

module.exports = app;
