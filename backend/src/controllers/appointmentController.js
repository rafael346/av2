const { body } = require('express-validator');
const Appointment = require('../models/Appointment');
const { getWeatherForDate } = require('../services/weatherService');

// Check for scheduling conflicts (same doctor, overlapping time slot)
const hasConflict = async (doctor, date, durationMinutes, excludeId) => {
  const start = new Date(date);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const query = {
    doctor,
    status: { $nin: ['cancelado'] },
    _id: { $ne: excludeId },
    $or: [
      {
        date: { $gte: start, $lt: end },
      },
      {
        $expr: {
          $and: [
            { $lt: ['$date', end] },
            {
              $gt: [
                { $add: ['$date', { $multiply: ['$durationMinutes', 60000] }] },
                start,
              ],
            },
          ],
        },
      },
    ],
  };

  const conflict = await Appointment.findOne(query);
  return !!conflict;
};

// POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const { doctor, specialty, date, durationMinutes, notes, address } = req.body;

    const conflict = await hasConflict(doctor, date, durationMinutes || 30);
    if (conflict) {
      return res.status(409).json({ message: 'Horário indisponível para este médico.' });
    }

    // Fetch weather for alert
    let weatherAlert = { hasRain: false, description: '', checkedAt: new Date() };
    try {
      const city = address?.cidade || 'São Paulo';
      weatherAlert = await getWeatherForDate(city, new Date(date));
    } catch (_) {
      // Weather alert is non-blocking
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      specialty,
      date,
      durationMinutes: durationMinutes || 30,
      notes,
      address,
      weatherAlert,
      createdBy: req.user._id,
    });

    await appointment.populate('patient', 'name email phone');
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const filter = {};

    // Patients only see their own appointments
    if (req.user.role === 'paciente') {
      filter.patient = req.user._id;
    }

    // Optional filters from query params
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const day = new Date(req.query.date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient', 'name email phone');
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada.' });

    if (req.user.role === 'paciente' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
};

// PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada.' });

    if (req.user.role === 'paciente' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const { doctor, specialty, date, durationMinutes, notes, status, address } = req.body;

    const newDoctor = doctor || appointment.doctor;
    const newDate = date || appointment.date;
    const newDuration = durationMinutes || appointment.durationMinutes;

    if (date || doctor) {
      const conflict = await hasConflict(newDoctor, newDate, newDuration, appointment._id);
      if (conflict) {
        return res.status(409).json({ message: 'Horário indisponível para este médico.' });
      }
    }

    if (doctor) appointment.doctor = doctor;
    if (specialty) appointment.specialty = specialty;
    if (date) appointment.date = date;
    if (durationMinutes) appointment.durationMinutes = durationMinutes;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;
    if (address) appointment.address = address;

    // Re-check weather if date changed
    if (date) {
      try {
        const city = (address || appointment.address)?.cidade || 'São Paulo';
        appointment.weatherAlert = await getWeatherForDate(city, new Date(date));
      } catch (_) { }
    }

    await appointment.save();
    await appointment.populate('patient', 'name email phone');
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada.' });

    if (req.user.role === 'paciente' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    appointment.status = 'cancelado';
    await appointment.save();
    res.json({ message: 'Consulta cancelada com sucesso.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/available-slots
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctor, date } = req.query;
    if (!doctor || !date) {
      return res.status(400).json({ message: 'Informe médico e data.' });
    }

    const day = new Date(date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const booked = await Appointment.find({
      doctor,
      date: { $gte: day, $lt: nextDay },
      status: { $nin: ['cancelado'] },
    }).select('date durationMinutes');

    // Generate slots from 08:00 to 17:30, every 30 min
    const slots = [];
    for (let h = 8; h < 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slot = new Date(day);
        slot.setHours(h, m, 0, 0);
        const slotEnd = new Date(slot.getTime() + 30 * 60000);

        const isBooked = booked.some((b) => {
          const bStart = new Date(b.date);
          const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
          return slot < bEnd && slotEnd > bStart;
        });

        slots.push({ time: slot, available: !isBooked });
      }
    }

    res.json({ slots });
  } catch (err) {
    next(err);
  }
};

const appointmentValidators = [
  body('doctor').trim().notEmpty().withMessage('Médico é obrigatório'),
  body('specialty').trim().notEmpty().withMessage('Especialidade é obrigatória'),
  body('date').isISO8601().withMessage('Data inválida'),
];

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  appointmentValidators,
};
