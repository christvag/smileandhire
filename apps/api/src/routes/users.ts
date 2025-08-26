import express from 'express';
import { z } from 'zod';
import { prisma } from '@worky-happy/database';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

const updateApplicantSchema = z.object({
  headline: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  summary: z.string().max(1000).optional(),
  availability: z.string().max(100).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
});

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().optional(),
  foundedDate: z.string().datetime().optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
});

// Update user profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
      }
    });

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update applicant profile
router.patch('/applicant-profile', authenticateToken, async (req, res) => {
  try {
    const validatedData = updateApplicantSchema.parse(req.body);

    // Check if user has applicant profile
    const existingApplicant = await prisma.applicant.findUnique({
      where: { userId: req.user!.id }
    });

    let applicant;
    if (existingApplicant) {
      applicant = await prisma.applicant.update({
        where: { userId: req.user!.id },
        data: validatedData,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          skills: {
            include: {
              skill: true
            }
          },
          experiences: true,
          educations: true,
        }
      });
    } else {
      applicant = await prisma.applicant.create({
        data: {
          userId: req.user!.id,
          ...validatedData,
          completionPercentage: 50,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          skills: {
            include: {
              skill: true
            }
          },
          experiences: true,
          educations: true,
        }
      });
    }

    res.json({ applicant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Update applicant profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company profile
router.patch('/company-profile', authenticateToken, async (req, res) => {
  try {
    const validatedData = updateCompanySchema.parse(req.body);

    // Check if user has company profile
    const existingCompany = await prisma.company.findUnique({
      where: { userId: req.user!.id }
    });

    let company;
    if (existingCompany) {
      company = await prisma.company.update({
        where: { userId: req.user!.id },
        data: {
          ...validatedData,
          foundedDate: validatedData.foundedDate ? new Date(validatedData.foundedDate) : undefined,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } else {
      company = await prisma.company.create({
        data: {
          userId: req.user!.id,
          name: validatedData.name || 'My Company',
          ...validatedData,
          foundedDate: validatedData.foundedDate ? new Date(validatedData.foundedDate) : undefined,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    }

    res.json({ company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Update company profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applicant profile by ID (public)
router.get('/applicant/:id', async (req, res) => {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        experiences: {
          orderBy: { startDate: 'desc' }
        },
        educations: {
          orderBy: { startDate: 'desc' }
        },
      }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.json({ applicant });
  } catch (error) {
    logger.error('Get applicant profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as usersRouter };