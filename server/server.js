import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import circulationRoutes from './routes/circulationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { dbStore } from './data/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database refresh on boot
dbStore.refreshTransactionStatuses();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Library Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`
  ======================================================
  📚 Smart Library Management System Backend Server 🚀
  ------------------------------------------------------
  📡 API Port: http://localhost:${PORT}
  🏥 Health Check: http://localhost:${PORT}/api/health
  ------------------------------------------------------
  🔑 Demo Credentials:
     👑 Admin/Librarian: admin@smartlib.edu / admin123
     🎓 Student:        aarav@student.edu / student123
     🎓 Student 2:      priya@student.edu / student123
  ======================================================
  `);
});
