import express from 'express';
import { prisma } from '@worky-happy/database';
import { authenticateToken, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get dashboard analytics (ADMIN only)
router.get('/analytics', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const [
      userStats,
      jobStats,
      applicationStats,
      recentUsers,
      recentJobs,
      pendingReports
    ] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      
      // Job statistics
      prisma.job.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Application statistics
      prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          isVerified: true,
          isBanned: true,
        }
      }),
      
      // Recent jobs
      prisma.job.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Pending reports
      prisma.report.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();
    const totalCompanies = await prisma.company.count();

    res.json({
      summary: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        pendingReports
      },
      userStats,
      jobStats,
      applicationStats,
      recentUsers,
      recentJobs
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reports (ADMIN only)
router.get('/reports', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isBanned: true,
              strikeCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum,
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report status and handle user punishment (ADMIN only)
router.patch('/reports/:id', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const { status, adminNotes, punishUser } = req.body;

    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        reportedUser: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNotes,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      }
    });

    // Handle user punishment if report is resolved and punishment is requested
    if (status === 'RESOLVED' && punishUser) {
      const newStrikeCount = report.reportedUser.strikeCount + 1;
      const shouldBan = newStrikeCount >= 4;

      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: {
          strikeCount: newStrikeCount,
          isBanned: shouldBan,
          banReason: shouldBan ? `Banned due to ${newStrikeCount} strikes from user reports` : undefined
        }
      });

      logger.info(`User punishment applied: ${report.reportedUser.email} - Strikes: ${newStrikeCount}, Banned: ${shouldBan}`);
    }

    res.json({ report: updatedReport });
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban/unban user (ADMIN only)
router.patch('/users/:id/ban', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isBanned,
        banReason: isBanned ? banReason : null,
      },
      select: {
        id: true,
        email: true,
        isBanned: true,
        banReason: true,
      }
    });

    logger.info(`User ban status updated: ${user.email} - Banned: ${isBanned}`);

    res.json({ user });
  } catch (error) {
    logger.error('Update user ban status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRouter };