const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/slots', protect, getAvailableSlots);                            // private
router.post('/', protect, createAppointment);                                // private
router.get('/my', protect, getMyAppointments);                               // private
router.put('/:id/cancel', protect, cancelAppointment);                       // private
router.get('/admin/all', protect, adminOnly, getAllAppointments);             // admin
router.put('/admin/:id/status', protect, adminOnly, updateAppointmentStatus);// admin

module.exports = router;
