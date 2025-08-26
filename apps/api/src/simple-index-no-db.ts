import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    database: 'ready_for_integration',
  });
});

// Mock users database
const mockUsers = [
  {
    id: 'admin1',
    email: 'admin@worky.com',
    password: 'admin123',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'client1',
    email: 'client@company.com',
    password: 'client123',
    role: 'CLIENT',
    firstName: 'Company',
    lastName: 'Recruiter',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user1',
    email: 'user@example.com',
    password: 'user123',
    role: 'APPLICANT',
    firstName: 'Job',
    lastName: 'Seeker',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email and password (in real app, use bcrypt)
  const user = mockUsers.find(u => 
    u.email === email && 
    u.password === password && 
    u.role === role
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or role' });
  }

  // Generate mock JWT token (in real app, use jsonwebtoken)
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role, phone, company } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists with this email' });
  }

  // Create new user
  const newUser = {
    id: `user${mockUsers.length + 1}`,
    email,
    password, // In real app, hash with bcrypt
    role: role || 'APPLICANT',
    firstName,
    lastName,
    phone,
    company,
    isVerified: false,
    createdAt: new Date().toISOString()
  };

  mockUsers.push(newUser);

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isVerified: newUser.isVerified
    }
  });
});

// Mock API endpoints for testing
app.get('/api/users', (req, res) => {
  res.json({
    users: mockUsers.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      isVerified: u.isVerified,
      createdAt: u.createdAt
    })),
    count: mockUsers.length,
  });
});

app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [
      {
        id: 'job1',
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'FULL_TIME',
        salaryMin: 80000,
        salaryMax: 120000,
        description: 'Join our growing team as a Senior Full Stack Developer...',
        tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'job2',
        title: 'Virtual Assistant Manager',
        company: 'The VA Group',
        location: 'Philippines',
        type: 'FULL_TIME',
        salaryMin: 30000,
        salaryMax: 45000,
        description: 'Lead a team of virtual assistants...',
        tags: ['Management', 'Remote', 'Customer Service'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ],
    count: 2,
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: '🎉 Worky Happy API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Health check',
      'GET /api/users - List users (mock data)',
      'GET /api/jobs - List jobs (mock data)',
      'GET /api/test - This endpoint',
    ],
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: ['/health', '/api/test', '/api/users', '/api/jobs']
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.API_PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 API server running on port ${PORT}`);
  logger.info(`📖 Health check: http://localhost:${PORT}/health`);
  logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  logger.info(`👥 Users API: http://localhost:${PORT}/api/users`);
  logger.info(`💼 Jobs API: http://localhost:${PORT}/api/jobs`);
  logger.info('✅ Mock API ready - Database integration pending');
});