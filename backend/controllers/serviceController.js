const Service = require('../models/Service');

// @route  GET /api/services
// @access Public
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/services/all  (admin: includes unavailable)
// @access Admin
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/services/:id
// @access Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/services
// @access Admin
const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category, image } = req.body;
    if (!name || !description || !price || !duration)
      return res.status(400).json({ message: 'Name, description, price and duration are required' });

    const service = await Service.create({ name, description, price, duration, category, image });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/services/:id
// @access Admin
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/services/:id
// @access Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServices, getAllServices, getServiceById, createService, updateService, deleteService };
