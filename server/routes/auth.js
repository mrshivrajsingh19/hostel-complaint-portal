const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readUsers, writeUsers } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, hostelBlock, roomNumber, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['student', 'warden'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or warden.' });
  }
  if (role === 'student' && (!hostelBlock || !roomNumber)) {
    return res.status(400).json({ error: 'Hostel block and room number are required for students.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const users = readUsers();
  const existingUser = users.find(u => u.email === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    hostelBlock: role === 'student' ? hostelBlock.trim() : null,
    roomNumber: role === 'student' ? roomNumber.trim() : null,
    phone: phone ? phone.trim() : null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _pw, ...userWithoutPassword } = newUser;
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ user: userWithoutPassword, token });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _pw, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _pw, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
