require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Support both /api/path and /path
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/complaints', complaintRoutes);
app.use('/complaints', complaintRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hostel Complaint Portal API is active (All-in-one Vercel Serverless)',
    timestamp: new Date().toISOString()
  });
});

// Root check
app.get('/api', (req, res) => {
  res.json({ name: 'Hostel Complaint Portal API', version: '1.0.0' });
});

if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
