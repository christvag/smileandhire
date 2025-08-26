import express from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Get profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Parse JSON fields if they're strings
    if (typeof profile.skills === 'string') {
      profile.skills = JSON.parse(profile.skills || '[]');
    }
    if (typeof profile.preferredJobTypes === 'string') {
      profile.preferredJobTypes = JSON.parse(profile.preferredJobTypes || '[]');
    }
    if (typeof profile.jobHistory === 'string') {
      profile.jobHistory = JSON.parse(profile.jobHistory || '[]');
    }
    if (typeof profile.skillSets === 'string') {
      profile.skillSets = JSON.parse(profile.skillSets || '[]');
    }
    if (typeof profile.professionTags === 'string') {
      profile.professionTags = JSON.parse(profile.professionTags || '[]');
    }

    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export { router as profilesRouter };