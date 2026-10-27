const express = require('express');
const { readUsers } = require('../db');
const { authenticate, requireWarden } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — warden gets all students; student gets own profile
router.get('/', authenticate, requireWarden, (req, res) => {
  const users = readUsers();
  const students = users
    .filter(u => u.role === 'student')
    .map(({ password, ...u }) => u);
  res.json(students);
});

// GET /api/users/profile — get own profile
router.get('/profile', authenticate, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
