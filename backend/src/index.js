import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { uploadsDir } from './controllers/uploadController.js';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Connect to Database before starting the server
await connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local images to be loaded
}));

// CORS Configuration
const allowedOrigins = new Set([
  'https://weddinginvites.online',
  'https://www.weddinginvites.online',
  'https://wedinvitesv3.onrender.com',
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads from the same directory used by Multer storage
app.use('/uploads', express.static(uploadsDir));

// Routes
const [
  { default: authRoutes },
  { default: invitationRoutes },
  { default: publicRoutes },
  { default: uploadRoutes },
  { default: orderRoutes },
  { default: metaRoutes },
  { default: invitationAiRoutes },
] = await Promise.all([
  import('./routes/authRoutes.js'),
  import('./routes/invitationRoutes.js'),
  import('./routes/publicRoutes.js'),
  import('./routes/uploadRoutes.js'),
  import('./routes/orderRoutes.js'),
  import('./routes/metaRoutes.js'),
  import('./routes/invitationAiRoutes.js'),
]);

app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/', metaRoutes);
app.use('/api', invitationAiRoutes);

// Root (helpful landing for the service URL)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wedding Invites API',
    endpoints: {
      health: '/health',
      publicInvitations: '/api/public/invitations?page=1&limit=6',
      publicInvitationBySlug: '/api/public/invitations/:slug',
    },
  });
});

// Health check
app.get('/health', (req, res) => res.status(200).json({
  status: 'ok',
  dbConnected: !!global.DB_CONNECTED,
  mode: process.env.NODE_ENV || 'development',
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
