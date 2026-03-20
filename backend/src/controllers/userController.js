const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/users  (admin/secretario only)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ active: true }).select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Patients can only view their own profile
    if (req.user.role === 'paciente' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, cpf, address, password, role } = req.body;

    if (req.user.role === 'paciente' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (cpf) user.cpf = cpf;
    if (address) user.address = address;
    if (password) user.password = password; // pre-save hook will hash it
    if (role && req.user.role === 'admin') user.role = role;

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    user.active = false;
    await user.save();
    res.json({ message: 'Usuário desativado com sucesso.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
