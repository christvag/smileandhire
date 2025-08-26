import express from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Test if username column exists and update users
router.post('/test-and-fix', async (req, res) => {
  try {
    logger.info('Testing username column and fixing users...');
    
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      return res.status(500).json({ 
        error: 'Failed to fetch users', 
        details: fetchError 
      });
    }
    
    const results = {
      totalUsers: users?.length || 0,
      usersWithUsername: 0,
      usersUpdated: 0,
      errors: [] as any[],
      users: [] as any[]
    };
    
    // Check each user
    for (const user of users || []) {
      const userInfo = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        currentUsername: user.username || null,
        newUsername: null as string | null,
        updated: false
      };
      
      // Check if user already has username
      if (user.username) {
        results.usersWithUsername++;
        userInfo.newUsername = user.username;
      } else {
        // Generate username based on the user's name or ID
        let username = '';
        
        if (user.id === 'thevagroup') {
          username = 'shane-riggs';
        } else if (user.id === 'test-client-1') {
          username = 'test-client';
        } else if (user.firstName && user.lastName) {
          username = `${user.firstName}-${user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        } else if (user.firstName) {
          username = user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        } else if (user.email) {
          username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
        } else {
          username = user.id;
        }
        
        // Try to update the user with username
        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', user.id);
        
        if (!updateError) {
          results.usersUpdated++;
          userInfo.newUsername = username;
          userInfo.updated = true;
          logger.info(`Updated user ${user.id} with username: ${username}`);
        } else {
          results.errors.push({
            userId: user.id,
            error: updateError.message
          });
          logger.warn(`Failed to update user ${user.id}:`, updateError);
        }
      }
      
      results.users.push(userInfo);
    }
    
    res.json({
      success: true,
      message: `Processed ${results.totalUsers} users`,
      results
    });
  } catch (error) {
    logger.error('Error in test-and-fix:', error);
    res.status(500).json({ error: 'Failed to process users' });
  }
});

// Force add username column via raw SQL (requires RPC function)
router.post('/add-column', async (req, res) => {
  try {
    logger.info('Attempting to add username column...');
    
    // Try different approaches
    const approaches = [];
    
    // Approach 1: Try to select username to see if it exists
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);
    
    if (!testError) {
      approaches.push({
        method: 'select_test',
        success: true,
        message: 'Username column appears to exist (select worked)'
      });
    } else {
      approaches.push({
        method: 'select_test',
        success: false,
        message: testError.message
      });
    }
    
    // Approach 2: Try to update with username
    const { error: updateError } = await supabase
      .from('users')
      .update({ username: 'test' })
      .eq('id', 'non-existent-id-for-testing');
    
    if (!updateError || updateError.code === 'PGRST116') { // PGRST116 = no rows found
      approaches.push({
        method: 'update_test',
        success: true,
        message: 'Username column appears to exist (update worked)'
      });
    } else {
      approaches.push({
        method: 'update_test',
        success: false,
        message: updateError.message
      });
    }
    
    res.json({
      message: 'Column tests completed',
      approaches,
      conclusion: approaches.some(a => a.success) 
        ? 'Username column likely exists or can be used'
        : 'Username column does not exist - run SQL migration in Supabase'
    });
  } catch (error) {
    logger.error('Error adding column:', error);
    res.status(500).json({ error: 'Failed to add column' });
  }
});

// Get current state of users and companies
router.get('/current-state', async (req, res) => {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });
    
    // Get all companies  
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (usersError || companiesError) {
      return res.status(500).json({ 
        error: 'Failed to fetch data',
        usersError,
        companiesError
      });
    }
    
    // Process the data
    const usersSummary = users?.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      role: u.role,
      username: u.username || '(not set)',
      hasCompany: u.role === 'CLIENT' ? companies?.some(c => 
        c.name === `${u.firstName} ${u.lastName}` ||
        c.name === u.firstName ||
        c.name === u.lastName
      ) : null
    }));
    
    const companiesSummary = companies?.map(c => ({
      id: c.id,
      name: c.name,
      username: c.username || '(not set)',
      userId: c.userId || '(not linked)',
      createdAt: c.createdAt
    }));
    
    res.json({
      users: {
        total: users?.length || 0,
        byRole: {
          CLIENT: users?.filter(u => u.role === 'CLIENT').length || 0,
          APPLICANT: users?.filter(u => u.role === 'APPLICANT').length || 0,
          ADMIN: users?.filter(u => u.role === 'ADMIN').length || 0
        },
        withUsername: users?.filter(u => u.username).length || 0,
        details: usersSummary
      },
      companies: {
        total: companies?.length || 0,
        withUsername: companies?.filter(c => c.username).length || 0,
        withUserId: companies?.filter(c => c.userId).length || 0,
        details: companiesSummary
      }
    });
  } catch (error) {
    logger.error('Error getting current state:', error);
    res.status(500).json({ error: 'Failed to get current state' });
  }
});

export { router as usernameFixRouter };