import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth-supabase';
import { jobsRouter } from './routes/jobs-supabase';
import { companiesRouter } from './routes/companies-supabase';
import { applicantRouter } from './routes/applicant-supabase';
import { profilesRouter } from './routes/profiles-supabase';
import { clientRouter } from './routes/client-supabase';
import { statsRouter } from './routes/stats-supabase';
import { migrationRouter } from './routes/migration';
import { migrationCompleteRouter } from './routes/migration-complete';
import { simpleMigrationRouter } from './routes/simple-migration';
import { usernameFixRouter } from './routes/username-fix';
import { testConnection } from './db/supabase';
import routeHandlers from "./routes";

// Load environment variables
dotenv.config({ path: '.env' });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005',
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3005',
  'https://worky-happy.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
});
app.use('/api', limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    mode: 'supabase'
  });
});

// API routes
app.use('/api', routeHandlers);
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/applicant', applicantRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/client', clientRouter);
app.use('/api/stats', statsRouter);
app.use('/api/migration', migrationRouter);
app.use('/api/migration-complete', migrationCompleteRouter);
app.use('/api/simple-migration', simpleMigrationRouter);
app.use('/api/username-fix', usernameFixRouter);

app.get("/", (request, response) => {
  response.send("Hello World");
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.API_PORT || 3006;

server.listen(PORT, async () => {
  logger.info(`🚀 API server running on port ${PORT} (Supabase mode)`);
  logger.info(`📖 Health check: http://localhost:${PORT}/health`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    logger.info('✅ Supabase connection successful');
  } else {
    logger.error('❌ Supabase connection failed');
  }
});