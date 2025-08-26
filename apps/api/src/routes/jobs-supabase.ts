import express from 'express';
import { z } from 'zod';
import { supabase, handleSupabaseError, generateId } from '../db/supabase';
import { authenticateToken, authorize } from '../middleware/auth-supabase';
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

    let query = supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        isRemote,
        isUrgent,
        createdAt,
        tags,
        category,
        companies (
          id,
          name,
          logo,
          location
        )
      `, { count: 'exact' })
      .eq('status', 'PUBLISHED');

    // Apply filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (employmentType) {
      query = query.eq('employmentType', employmentType);
    }

    if (salaryMin) {
      query = query.gte('salaryMin', parseInt(salaryMin as string));
    }

    if (salaryMax) {
      query = query.lte('salaryMax', parseInt(salaryMax as string));
    }

    if (isRemote === 'true') {
      query = query.eq('isRemote', true);
    }

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limitNum - 1)
      .order('createdAt', { ascending: false });

    const { data: jobs, error, count } = await query;
    handleSupabaseError(error);

    res.json({
      jobs: jobs || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
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
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          description,
          location,
          website,
          industry
        )
      `)
      .eq('id', req.params.id)
      .single();

    handleSupabaseError(error);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    await supabase
      .from('jobs')
      .update({ viewCount: (job.viewCount || 0) + 1 })
      .eq('id', req.params.id);

    res.json({ job });
  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create job (authenticated, CLIENT role)
router.post('/', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const createJobSchema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(1),
      requirements: z.string().optional(),
      location: z.string().min(1),
      employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY']),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isRemote: z.boolean().optional(),
      companyId: z.string(),
      expiresAt: z.string().optional(),
    });

    const validatedData = createJobSchema.parse(req.body);

    // Generate job ID and slug
    const jobId = generateId('job');
    const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const jobData = {
      id: jobId,
      ...validatedData,
      slug,
      status: 'PUBLISHED',
      viewCount: 0,
      applicationCount: 0,
      isActive: true,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    handleSupabaseError(error);

    res.status(201).json({ job });
  } catch (error) {
    logger.error('Create job error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job (authenticated, CLIENT role)
router.put('/:id', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const updateJobSchema = z.object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().min(1).optional(),
      requirements: z.string().optional(),
      location: z.string().min(1).optional(),
      employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY']).optional(),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isRemote: z.boolean().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED']).optional(),
      expiresAt: z.string().optional(),
    });

    const validatedData = updateJobSchema.parse(req.body);

    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
      ...(validatedData.expiresAt && { expiresAt: new Date(validatedData.expiresAt) })
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    handleSupabaseError(error);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    logger.error('Update job error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete job (authenticated, CLIENT role)
router.delete('/:id', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id);

    handleSupabaseError(error);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as jobsRouter };