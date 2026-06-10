/**
 * seed.js — Run once to populate the database with sample data
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const Service = require('./models/Service');

const services = [
  {
    name: 'Classic Haircut',
    description: 'Precision cut tailored to your face shape. Includes wash, cut, and blow-dry by our expert stylists.',
    price: 35,
    duration: 60,
    category: 'hair',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  },
  {
    name: 'Hair Colour & Highlights',
    description: 'Full colour or partial highlights using premium ammonia-free dyes. Consultation included.',
    price: 85,
    duration: 120,
    category: 'hair',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
  },
  {
    name: 'Deep Conditioning Treatment',
    description: 'Intensive moisture therapy to restore shine and strength to damaged or dry hair.',
    price: 45,
    duration: 45,
    category: 'hair',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
  },
  {
    name: 'Signature Facial',
    description: 'Deep cleanse, exfoliation, and custom mask treatment suited to your skin type.',
    price: 65,
    duration: 60,
    category: 'skin',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
  },
  {
    name: 'Anti-Ageing Facial',
    description: 'Advanced treatment with hyaluronic acid and collagen boost for firmer, youthful skin.',
    price: 95,
    duration: 75,
    category: 'skin',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400',
  },
  {
    name: 'Classic Manicure',
    description: 'Nail shaping, cuticle care, hand massage and your choice of polish from our collection.',
    price: 30,
    duration: 45,
    category: 'nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
  },
  {
    name: 'Gel Manicure',
    description: 'Long-lasting gel colour with chip-resistant finish. Lasts up to 3 weeks.',
    price: 45,
    duration: 60,
    category: 'nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
  },
  {
    name: 'Full Pedicure',
    description: 'Foot soak, exfoliation, nail shaping, callus removal, massage and polish.',
    price: 50,
    duration: 60,
    category: 'nails',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400',
  },
  {
    name: 'Relaxation Massage',
    description: 'Full body Swedish massage to melt away tension and restore calm.',
    price: 75,
    duration: 60,
    category: 'spa',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
  },
  {
    name: 'Hot Stone Therapy',
    description: 'Warm basalt stones combined with massage techniques for deep muscle relief.',
    price: 95,
    duration: 90,
    category: 'spa',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
  },
  {
    name: 'Bridal Package',
    description: 'Complete bridal prep: hair styling, make-up, facial, manicure and pedicure.',
    price: 250,
    duration: 240,
    category: 'other',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    // Clear existing data
    await Service.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    // Insert services
    await Service.insertMany(services);
    console.log(`✅  Seeded ${services.length} services`);

    // Create admin user
    const admin = await User.create({
      name: 'Salon Admin',
      email: 'admin@salon.com',
      password: 'admin123456',
      role: 'admin',
    });
    console.log(`✅  Admin user created: ${admin.email} / admin123456`);

    mongoose.disconnect();
    console.log('🎉  Seeding complete!');
  } catch (err) {
    console.error('❌  Seed error:', err);
    process.exit(1);
  }
};

seed();
