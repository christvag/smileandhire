import express from 'express';
import { z } from 'zod';
import { prisma } from '@worky-happy/database';
import { authenticateToken, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      location, 
      category, 
      employmentType, 
      salaryMin, 
      salaryMax, 
      isRemote,
      page = '1', 
      limit = '10' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'PUBLISHED',
      expiresAt: {
        gte: new Date()
      }
    };

    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { tags: { has: q as string } }
      ];
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (isRemote === 'true') {
      where.isRemote = true;
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin as string) };
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseInt(salaryMax as string) };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              rating: true,
              location: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: [
          { isUrgent: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limitNum,
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            rating: true,
            ratingCount: true,
            location: true,
            website: true,
            industry: true,
            size: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    await prisma.job.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ job });
  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const createJobSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(5000),
  requirements: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  location: z.string().min(2).max(100),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'REMOTE']),
  category: z.string(),
  tags: z.array(z.string()),
  isRemote: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});

// Create job (CLIENT only)
router.post('/', authenticateToken, authorize(['CLIENT', 'ADMIN']), async (req, res) => {
  try {
    const validatedData = createJobSchema.parse(req.body);

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { userId: req.user!.id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const job = await prisma.job.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        location: validatedData.location,
        employmentType: validatedData.employmentType,
        category: validatedData.category,
        tags: validatedData.tags,
        isRemote: validatedData.isRemote,
        isUrgent: validatedData.isUrgent,
        company: {
          connect: { id: company.id }
        },
        expiresAt: validatedData.expiresAt 
          ? new Date(validatedData.expiresAt)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    logger.info(`New job created: ${job.title} by company ${company.name}`);

    res.status(201).json({ job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as jobsRouter };