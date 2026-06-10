const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// Business hours config
const BUSINESS_HOURS = { start: 9, end: 19 }; // 9 AM – 7 PM
const SLOT_INTERVAL = 60; // minutes

// Helper: generate all slots for a given duration
const generateSlots = (durationMinutes) => {
  const slots = [];
  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      const endMinutes = h * 60 + m + durationMinutes;
      if (endMinutes <= BUSINESS_HOURS.end * 60) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
  }
  return slots;
};

// @route  GET /api/appointments/slots?serviceId=&date=
// @access Private
const getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date)
      return res.status(400).json({ message: 'serviceId and date are required' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const allSlots = generateSlots(service.duration);

    // Find already booked (non-cancelled) slots for this service on this date
    const booked = await Appointment.find({
      service: serviceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSet = new Set(booked.map((a) => a.timeSlot));
    const available = allSlots.filter((s) => !bookedSet.has(s));

    res.json({ date, slots: available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/appointments
// @access Private
const createAppointment = async (req, res) => {
  try {
    const { serviceId, date, timeSlot, notes } = req.body;
    if (!serviceId || !date || !timeSlot)
      return res.status(400).json({ message: 'serviceId, date and timeSlot are required' });

    const service = await Service.findById(serviceId);
    if (!service || !service.isAvailable)
      return res.status(404).json({ message: 'Service not available' });

    // Check slot is still free
    const conflict = await Appointment.findOne({
      service: serviceId,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict)
      return res.status(409).json({ message: 'This time slot is already booked. Please pick another.' });

    const appointment = await Appointment.create({
      user: req.user._id,
      service: serviceId,
      date,
      timeSlot,
      notes,
      pricePaid: service.price,
    });

    const populated = await appointment.populate(['service', 'user']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/appointments/my
// @access Private
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('service')
      .sort({ date: -1, timeSlot: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/appointments/:id/cancel
// @access Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Allow user to cancel their own, admin can cancel any
    if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }

    if (appointment.status === 'cancelled')
      return res.status(400).json({ message: 'Appointment is already cancelled' });

    appointment.status = 'cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/appointments/admin/all
// @access Admin
const getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration')
      .sort({ date: -1, timeSlot: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/appointments/admin/:id/status
// @access Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user service');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};
