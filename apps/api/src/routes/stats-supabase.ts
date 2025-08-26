import express from 'express';
import { supabase, handleSupabaseError } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Get platform statistics for homepage
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching platform statistics');

    // Get counts for users, jobs, and companies in parallel
    const [usersResult, jobsResult, companiesResult] = await Promise.all([
      supabase
        .from('users')
        .select('count', { count: 'exact', head: true }),
      supabase
        .from('jobs')
        .select('count', { count: 'exact', head: true })
        .eq('status', 'PUBLISHED'),
      supabase
        .from('companies')
        .select('count', { count: 'exact', head: true })
    ]);

    // Handle any errors
    handleSupabaseError(usersResult.error);
    handleSupabaseError(jobsResult.error);
    handleSupabaseError(companiesResult.error);

    const stats = {
      users: usersResult.count || 0,
      jobs: jobsResult.count || 0,
      companies: companiesResult.count || 0,
      applications: 0 // We can add this later if needed
    };

    logger.info(`Platform stats: ${JSON.stringify(stats)}`);

    res.json({ stats });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured jobs for homepage
router.get('/featured-jobs', async (req, res) => {
  try {
    logger.info('Fetching featured jobs');

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        salaryMin,
        salaryMax,
        location,
        employmentType,
        category,
        isRemote,
        isUrgent,
        createdAt,
        companyId,
        companies (
          id,
          name,
          logo,
          location
        )
      `)
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })
      .limit(6);

    handleSupabaseError(error);

    // Transform the data to flatten company information
    const featuredJobs = jobs?.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location: job.location,
      employmentType: job.employmentType,
      category: job.category,
      isRemote: job.isRemote,
      isUrgent: job.isUrgent,
      createdAt: job.createdAt,
      companyId: job.companyId,
      companyName: (job.companies as any)?.name,
      companyLogo: (job.companies as any)?.logo,
      companyLocation: (job.companies as any)?.location
    })) || [];

    logger.info(`Featured jobs fetched: ${featuredJobs.length} jobs`);

    res.json({ jobs: featuredJobs });
  } catch (error) {
    logger.error('Get featured jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as statsRouter };