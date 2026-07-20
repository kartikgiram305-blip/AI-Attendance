require('dotenv').config();
require('express-async-errors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');

const app = express();
const port = process.env.PORT || 3000;

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled to allow external fonts/scripts for local dev
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public API
app.use('/api', authRoutes);

// Protected API
app.use('/api/classes', authMiddleware, classRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'landing.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Centralized Error Handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
