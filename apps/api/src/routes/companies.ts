import express from 'express';
// import { prisma } from '@worky-happy/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all companies (public)
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10', industry, location } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};

    if (industry) {
      where.industry = { contains: industry as string, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    // const [companies, total] = await Promise.all([
    //   prisma.company.findMany({
    //     where,
    //     select: {
    //       id: true,
    //       name: true,
    //       description: true,
    //       industry: true,
    //       size: true,
    //       location: true,
    //       logo: true,
    //       rating: true,
    //       ratingCount: true,
    //       _count: {
    //         select: {
    //           jobs: {
    //             where: {
    //               status: 'PUBLISHED'
    //             }
    //           }
    //         }
    //       }
    //     },
    //     orderBy: [
    //       { rating: 'desc' },
    //       { name: 'asc' }
    //     ],
    //     skip: offset,
    //     take: limitNum,
    //   }),
    //   prisma.company.count({ where })
    // ]);

    res.json({
      // companies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        // total,
        // pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by ID (public)
// router.get('/:id', async (req, res) => {
//   try {
//     const company = await prisma.company.findUnique({
//       where: { id: req.params.id },
//       include: {
//         jobs: {
//           where: {
//             status: 'PUBLISHED'
//           },
//           select: {
//             id: true,
//             title: true,
//             location: true,
//             employmentType: true,
//             salaryMin: true,
//             salaryMax: true,
//             isRemote: true,
//             isUrgent: true,
//             createdAt: true,
//             _count: {
//               select: {
//                 applications: true
//               }
//             }
//           },
//           orderBy: { createdAt: 'desc' },
//           take: 10
//         },
//         ratings: {
//           select: {
//             rating: true,
//             review: true,
//             category: true,
//             createdAt: true,
//             user: {
//               select: {
//                 firstName: true,
//                 lastName: true
//               }
//             }
//           },
//           where: {
//             review: {
//               not: null
//             }
//           },
//           orderBy: { createdAt: 'desc' },
//           take: 5
//         }
//       }
//     });

//     if (!company) {
//       return res.status(404).json({ error: 'Company not found' });
//     }

//     res.json({ company });
//   } catch (error) {
//     logger.error('Get company error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

export { router as companiesRouter };