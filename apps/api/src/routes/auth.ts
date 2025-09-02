import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
// import { prisma } from '@worky-happy/database';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['APPLICANT', 'CLIENT']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Generate JWT tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Register
// router.post('/register', async (req, res) => {
//   try {
//     const validatedData = registerSchema.parse(req.body);
    
//     const existingUser = await prisma.user.findUnique({
//       where: { email: validatedData.email }
//     });

//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const passwordHash = await bcrypt.hash(validatedData.password, 10);

//     const user = await prisma.user.create({
//       data: {
//         email: validatedData.email,
//         passwordHash,
//         role: validatedData.role,
//         firstName: validatedData.firstName,
//         lastName: validatedData.lastName,
//         isVerified: true, // Auto-verify for development
//       },
//       select: {
//         id: true,
//         email: true,
//         role: true,
//         firstName: true,
//         lastName: true,
//       }
//     });

//     // Create associated profile based on role
//     if (validatedData.role === 'APPLICANT') {
//       await prisma.applicant.create({
//         data: {
//           userId: user.id,
//           completionPercentage: 20, // Basic info completed
//         }
//       });
//     }

//     const tokens = generateTokens(user.id, user.role);

//     logger.info(`New user registered: ${user.email}`);

//     res.status(201).json({
//       user,
//       ...tokens
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: 'Invalid input data', details: error.errors });
//     }
//     logger.error('Registration error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Login
// router.post('/login', async (req, res) => {
//   try {
//     const validatedData = loginSchema.parse(req.body);

//     const user = await prisma.user.findUnique({
//       where: { email: validatedData.email },
//       include: {
//         applicant: true,
//         company: true,
//       }
//     });

//     if (!user || !user.passwordHash) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);

//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     if (user.isBanned) {
//       return res.status(403).json({ error: 'Account has been banned', reason: user.banReason });
//     }

//     // Update last login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLogin: new Date() }
//     });

//     const tokens = generateTokens(user.id, user.role);

//     logger.info(`User logged in: ${user.email}`);

//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         applicant: user.applicant,
//         company: user.company,
//       },
//       ...tokens
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: 'Invalid input data', details: error.errors });
//     }
//     logger.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Get current user
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user!.id },
//       include: {
//         applicant: {
//           include: {
//             skills: {
//               include: {
//                 skill: true
//               }
//             },
//             experiences: true,
//             educations: true,
//           }
//         },
//       }
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ user });
//   } catch (error) {
//     logger.error('Get user error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Refresh token
// router.post('/refresh', async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(401).json({ error: 'Refresh token required' });
//     }

//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: { id: true, role: true, isBanned: true }
//     });

//     if (!user || user.isBanned) {
//       return res.status(401).json({ error: 'Invalid refresh token' });
//     }

//     const tokens = generateTokens(user.id, user.role);

//     res.json(tokens);
//   } catch (error) {
//     logger.error('Token refresh error:', error);
//     res.status(401).json({ error: 'Invalid refresh token' });
//   }
// });

// Logout (client-side token deletion)
router.post('/logout', authenticateToken, (req, res) => {
  logger.info(`User logged out: ${req.user!.email}`);
  res.json({ message: 'Logged out successfully' });
});

export { router as authRouter };