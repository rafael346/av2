const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, cpf } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    // Only admins/secretarios can register non-paciente roles
    const assignedRole = req.user?.role === 'admin' ? (role || 'paciente') : 'paciente';

    const user = await User.create({ name, email, password, role: assignedRole, phone, cpf });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }),
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
];

const loginValidators = [
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

module.exports = { register, login, getMe, registerValidators, loginValidators };
