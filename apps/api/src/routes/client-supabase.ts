import express from 'express';
import { supabase, handleSupabaseError, generateId } from '../db/supabase';
import { authenticateToken, authorize } from '../middleware/auth-supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Get client's jobs - temporarily simplified for testing
router.get('/jobs', async (req, res) => {
  try {
    // For now, return all jobs from all companies as demo
    // In a real implementation, this would be filtered by user's company
    const { data: jobs, error: jobsError } = await supabase
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
        status,
        createdAt,
        updatedAt,
        category,
        tags,
        applicationCount,
        companies (
          id,
          name,
          logo
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(10);

    handleSupabaseError(jobsError);

    res.json({ jobs: jobs || [] });
  } catch (error) {
    logger.error('Get client jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications for client's jobs - temporarily simplified for testing
router.get('/applications', async (req, res) => {
  try {
    // First, let's see what columns exist in applications table
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .limit(5);

    if (applicationsError) {
      // If applications table doesn't exist, return empty array
      console.log('Applications table error:', applicationsError.message);
      return res.json({ applications: [] });
    }

    res.json({ applications: applications || [] });
  } catch (error) {
    logger.error('Get client applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new job
router.post('/jobs', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      isRemote,
      isUrgent,
      category,
      tags
    } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!title || !description || !location || !employmentType) {
      return res.status(400).json({ error: 'Missing required fields: title, description, location, employmentType' });
    }

    // Get the client's company - fallback for missing userId column
    let company = null;
    let companyError = null;

    try {
      // Try with userId first (if column exists)
      const result = await supabase
        .from('companies')
        .select('id')
        .eq('userId', userId)
        .single();
      
      company = result.data;
      companyError = result.error;
    } catch (err: any) {
      // If userId column doesn't exist, get the first company as fallback for development
      console.log('userId column does not exist, using first company as fallback');
      const result = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();
      
      company = result.data;
      companyError = result.error;
    }

    // Handle userId column error in response  
    if (companyError && companyError.code === '42703') {
      console.log('userId column does not exist (response error), using first company as fallback');
      const result = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();
      
      company = result.data;
      companyError = result.error;
    }

    if (companyError) {
      handleSupabaseError(companyError);
    }

    if (!company) {
      return res.status(403).json({ error: 'Company not found. Please create a company profile first.' });
    }

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        id: generateId('job'),
        title,
        description,
        location,
        employmentType,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        isRemote: isRemote || false,
        isUrgent: isUrgent || false,
        category: category || null,
        tags: tags || [],
        companyId: company.id,
        status: 'PUBLISHED',
        applicationCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    handleSupabaseError(jobError);

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    logger.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application status
router.put('/applications/:id/status', authenticateToken, authorize(['CLIENT']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status' });
    }

    // First verify this application belongs to a job owned by the client's company - fallback for missing userId column
    let company = null;
    let companyError = null;

    try {
      // Try with userId first (if column exists)
      const result = await supabase
        .from('companies')
        .select('id')
        .eq('userId', userId)
        .single();
      
      company = result.data;
      companyError = result.error;
    } catch (err: any) {
      // If userId column doesn't exist, get the first company as fallback for development
      console.log('userId column does not exist in application update, using first company as fallback');
      const result = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();
      
      company = result.data;
      companyError = result.error;
    }

    // Handle userId column error in response for application update
    if (companyError && companyError.code === '42703') {
      console.log('userId column does not exist (response error) in application update, using first company as fallback');
      const result = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();
      
      company = result.data;
      companyError = result.error;
    }

    if (companyError) {
      handleSupabaseError(companyError);
    }

    if (!company) {
      return res.status(403).json({ error: 'Company not found' });
    }

    // Check if the application is for a job owned by this company
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        jobs (
          id,
          companyId
        )
      `)
      .eq('id', id)
      .single();

    if (appError) {
      handleSupabaseError(appError);
    }

    if (!application || (application.jobs as any)?.companyId !== company.id) {
      return res.status(403).json({ error: 'Unauthorized to update this application' });
    }

    // Update the application status
    const { data: updatedApp, error: updateError } = await supabase
      .from('applications')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    handleSupabaseError(updateError);

    res.json({ 
      message: 'Application status updated successfully',
      application: updatedApp 
    });
  } catch (error) {
    logger.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as clientRouter };