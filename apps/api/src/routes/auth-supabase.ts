import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase, handleSupabaseError } from '../db/supabase';
import { logger } from '../utils/logger';
import { generateId } from '../utils/auth';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(['APPLICANT', 'CLIENT']).default('APPLICANT'),
      phone: z.string().optional(),
      location: z.string().optional(),
    });

    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const userId = generateId('user');
    const userData = {
      id: userId,
      email: validatedData.email,
      passwordHash: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      phone: validatedData.phone,
      location: validatedData.location,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(userData)
      .select('id, email, firstName, lastName, role, createdAt')
      .single();

    handleSupabaseError(error);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    logger.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, passwordHash, firstName, lastName, role, isVerified')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ lastLoginAt: new Date() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, firstName, lastName, role, phone, location, avatar, isVerified, createdAt')
      .eq('id', decoded.userId)
      .single();

    handleSupabaseError(error);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRouter };