import express from 'express';
import { supabase, handleSupabaseError, generateId } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all companies (public)
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10', industry, location } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        industry,
        companySize,
        location,
        logo,
        isVerified,
        createdAt
      `, { count: 'exact' });

    // Apply filters
    if (industry) {
      query = query.ilike('industry', `%${industry}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limitNum - 1)
      .order('name', { ascending: true });

    const { data: companies, error, count } = await query;
    handleSupabaseError(error);

    res.json({
      companies: companies || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    logger.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company profile (authenticated) - MUST be before /:id route
router.get('/profile', async (req, res) => {
  try {
    // For now, just return the first company as demo
    // In a real app, this would be filtered by the authenticated user's company
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (error) {
      handleSupabaseError(error);
    }

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    res.json({ company: companies[0] });
  } catch (error) {
    logger.error('Get company profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by username (public) - for /happyclient/username pages
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Check if username column exists by trying to use it
    let company = null;
    let companyError = null;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('username', username)
        .single();
      
      company = data;
      companyError = error;
    } catch (err: any) {
      // If column doesn't exist (42703), fall back to using company name as username
      console.log('Username column does not exist, falling back to name matching');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', username.replace(/-/g, ' '))
        .single();
      
      company = data;
      companyError = error;
    }

    // Also handle errors that come as part of the response
    if (companyError && companyError.code === '42703') {
      console.log('Username column does not exist (response error), falling back to name matching');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', username.replace(/-/g, ' '))
        .single();
      
      company = data;
      companyError = error;
    }

    if (companyError && companyError.code !== 'PGRST116') {
      handleSupabaseError(companyError);
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get company jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        isRemote,
        isUrgent,
        createdAt,
        applicationCount,
        description,
        category,
        tags
      `)
      .eq('companyId', company.id)
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })
      .limit(10);

    handleSupabaseError(jobsError);

    // Combine data
    const companyWithJobs = {
      ...company,
      jobs: jobs || []
    };

    res.json({ company: companyWithJobs });
  } catch (error) {
    logger.error('Get company by username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by ID (public)
router.get('/:id', async (req, res) => {
  try {
    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    handleSupabaseError(companyError);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get company jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        isRemote,
        isUrgent,
        createdAt,
        applicationCount
      `)
      .eq('companyId', req.params.id)
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })
      .limit(10);

    handleSupabaseError(jobsError);

    // Combine data
    const companyWithJobs = {
      ...company,
      jobs: jobs || []
    };

    res.json({ company: companyWithJobs });
  } catch (error) {
    logger.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update company profile (authenticated)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      username,
      description,
      industry,
      companySize,
      location,
      website,
      logo
    } = req.body;

    // For now, we'll create without user authentication
    // In a real app, you'd get userId from authenticated token
    const companyData = {
      id: generateId('company'),
      name,
      description,
      industry,
      companySize,
      location,
      website,
      logo,
      subscriptionType: 'BASIC',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Try to create with username if provided, handle gracefully if column doesn't exist
    let company = null;
    let error = null;

    try {
      // Add username only if provided (for when column exists)
      if (username) {
        (companyData as any).username = username;
      }

      const result = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();
      
      company = result.data;
      error = result.error;
    } catch (err: any) {
      // If username column doesn't exist, retry without username
      if (err.message && err.message.includes('username')) {
        console.log('Username column does not exist, creating without username field');
        delete (companyData as any).username;
        
        const result = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single();
        
        company = result.data;
        error = result.error;
      } else {
        throw err;
      }
    }

    // Handle username column error in response
    if (error && error.message && error.message.includes('username')) {
      console.log('Username column does not exist (response error), creating without username field');
      delete (companyData as any).username;
      
      const result = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();
      
      company = result.data;
      error = result.error;
    }

    handleSupabaseError(error);

    res.status(201).json({ 
      message: 'Company profile created successfully',
      company 
    });
  } catch (error) {
    logger.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company profile (authenticated)
router.put('/profile', async (req, res) => {
  try {
    const {
      id,
      name,
      username,
      description,
      industry,
      companySize,
      location,
      website,
      logo
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const updateData = {
      name,
      description,
      industry,
      companySize,
      location,
      website,
      logo,
      updatedAt: new Date().toISOString()
    } as any;

    // Try to include username, but handle gracefully if column doesn't exist
    let company = null;
    let error = null;

    try {
      // First try with username if provided
      if (username) {
        updateData.username = username;
      }
      
      const result = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      company = result.data;
      error = result.error;
    } catch (err: any) {
      // If username column doesn't exist, retry without username
      if (err.message && err.message.includes('username')) {
        console.log('Username column does not exist, updating without username field');
        delete updateData.username;
        
        const result = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        company = result.data;
        error = result.error;
      } else {
        throw err;
      }
    }

    // Handle username column error in response
    if (error && error.message && error.message.includes('username')) {
      console.log('Username column does not exist (response error), updating without username field');
      delete updateData.username;
      
      const result = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      company = result.data;
      error = result.error;
    }

    handleSupabaseError(error);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ 
      message: 'Company profile updated successfully',
      company 
    });
  } catch (error) {
    logger.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as companiesRouter };