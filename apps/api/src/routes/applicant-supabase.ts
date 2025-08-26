import express from 'express';
import { z } from 'zod';
import { supabase, handleSupabaseError } from '../db/supabase';
import { authenticateToken } from '../middleware/auth-supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Get applicant profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update applicant profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profileData = req.body;

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('userId', userId)
      .single();

    let result;
    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          userId,
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update skill sets
router.put('/skill-sets', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { skillSets } = req.body;

    // Get or create profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('userId', userId)
      .single();

    if (profile) {
      // Update existing profile with skill sets
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          skillSets: JSON.stringify(skillSets),
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, profile: data });
    } else {
      // Create new profile with skill sets
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          userId,
          skillSets: JSON.stringify(skillSets),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, profile: data });
    }
  } catch (error) {
    logger.error('Error updating skill sets:', error);
    res.status(500).json({ error: 'Failed to update skill sets' });
  }
});

// Get applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company:companies(
            id,
            name,
            logo
          )
        )
      `)
      .eq('applicantId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Format the response
    const formattedApplications = (applications || []).map(app => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job?.title || 'Unknown Job',
      companyName: app.job?.company?.name || 'Unknown Company',
      status: app.status,
      appliedAt: app.createdAt,
      coverLetter: app.coverLetter
    }));

    res.json({ applications: formattedApplications });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

export { router as applicantRouter };