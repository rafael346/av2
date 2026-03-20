const router = require('express').Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  appointmentValidators,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/slots', getAvailableSlots);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.post('/', appointmentValidators, validate, createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
