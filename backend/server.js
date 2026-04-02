import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import professionalRoutes from './src/routes/professionalRoutes.js';
import hardwareRoutes from './src/routes/hardwareRoutes.js';
import rentalRoutes from './src/routes/rentalRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    if (allowed.includes(origin) || isLocalDev) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/bookings', bookingRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Hardware Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;