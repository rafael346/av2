const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: String,
      required: [true, 'Nome do médico é obrigatório'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Especialidade é obrigatória'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Data e hora são obrigatórias'],
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['agendado', 'confirmado', 'cancelado', 'concluido'],
      default: 'agendado',
    },
    notes: {
      type: String,
      maxlength: [500, 'Observações não podem ter mais de 500 caracteres'],
    },
    weatherAlert: {
      hasRain: { type: Boolean, default: false },
      description: { type: String },
      checkedAt: { type: Date },
    },
    address: {
      cep: String,
      logradouro: String,
      bairro: String,
      cidade: String,
      estado: String,
      numero: String,
      complemento: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index to help with conflict detection
appointmentSchema.index({ doctor: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
