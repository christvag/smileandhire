import express from 'express';
import { z } from 'zod';
import { prisma } from '@worky-happy/database';
import { authenticateToken, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

const createApplicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(10).max(1000).optional(),
});

// Apply for a job (APPLICANT only)
router.post('/', authenticateToken, authorize(['APPLICANT']), async (req, res) => {
  try {
    const validatedData = createApplicationSchema.parse(req.body);

    // Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Job is not available for applications' });
    }

    // Get applicant profile
    const applicant = await prisma.applicant.findUnique({
      where: { userId: req.user!.id }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant profile not found' });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId: validatedData.jobId,
          applicantId: applicant.id
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: validatedData.jobId,
        applicantId: applicant.id,
        userId: req.user!.id,
        coverLetter: validatedData.coverLetter,
        resumeUrl: applicant.resumeUrl,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`New application: ${req.user!.email} applied for ${job.title}`);

    res.status(201).json({ application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's applications (APPLICANT)
router.get('/my-applications', authenticateToken, authorize(['APPLICANT']), async (req, res) => {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { userId: req.user!.id }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant profile not found' });
    }

    const applications = await prisma.application.findMany({
      where: { applicantId: applicant.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    logger.error('Get my applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications for company's jobs (CLIENT)
router.get('/company-applications', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const { jobId, status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const company = await prisma.company.findUnique({
      where: { userId: req.user!.id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const where: any = {
      job: {
        companyId: company.id
      }
    };

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true
            }
          },
          applicant: {
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
              experiences: {
                take: 1,
                orderBy: { startDate: 'desc' }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        skip: offset,
        take: limitNum,
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Get company applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED']),
  notes: z.string().optional(),
});

// Update application status (CLIENT)
router.patch('/:id/status', authenticateToken, authorize(['CLIENT', 'ADMIN']), async (req, res) => {
  try {
    const validatedData = updateApplicationStatusSchema.parse(req.body);

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: {
            company: true
          }
        },
        applicant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user owns the company that posted the job
    if (req.user!.role === 'CLIENT' && application.job.company.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: validatedData.status,
        notes: validatedData.notes,
        reviewedAt: new Date(),
      },
      include: {
        job: {
          select: {
            title: true
          }
        },
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`Application status updated: ${application.id} -> ${validatedData.status}`);

    res.json({ application: updatedApplication });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    logger.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as applicationsRouter };