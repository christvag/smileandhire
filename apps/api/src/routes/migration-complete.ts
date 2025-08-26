import express from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Helper to generate username from name
function generateUsername(name: string, existingUsernames: Set<string>): string {
  // Create base username from name
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  // Ensure uniqueness
  let username = baseUsername;
  let counter = 1;
  while (existingUsernames.has(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  existingUsernames.add(username);
  return username;
}

// Step 1: Add username columns if they don't exist
router.post('/add-username-columns', async (req, res) => {
  try {
    logger.info('Adding username columns to tables...');
    
    // Add username column to users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `
    });
    
    if (usersError) {
      logger.warn('Could not add username column to users table:', usersError);
    }
    
    // Add username column to companies table
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS username TEXT;
        CREATE INDEX IF NOT EXISTS idx_companies_username ON companies(username);
      `
    });
    
    if (companiesError) {
      logger.warn('Could not add username column to companies table:', companiesError);
    }
    
    res.json({ 
      success: true, 
      message: 'Username columns added (if not existing)',
      errors: {
        users: usersError?.message,
        companies: companiesError?.message
      }
    });
  } catch (error) {
    logger.error('Error adding username columns:', error);
    res.status(500).json({ error: 'Failed to add username columns' });
  }
});

// Step 2: Generate usernames for all users
router.post('/generate-usernames', async (req, res) => {
  try {
    logger.info('Generating usernames for all users...');
    
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, firstName, lastName, email, username');
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Collect existing usernames
    const existingUsernames = new Set<string>();
    users?.forEach(u => {
      if (u.username) existingUsernames.add(u.username);
    });
    
    // Generate usernames for users without them
    let updatedCount = 0;
    for (const user of users || []) {
      if (!user.username) {
        const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email?.split('@')[0] || 'user';
        const username = generateUsername(fullName, existingUsernames);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', user.id);
        
        if (!updateError) {
          updatedCount++;
          logger.info(`Generated username for user ${user.id}: ${username}`);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Generated usernames for ${updatedCount} users`,
      totalUsers: users?.length || 0,
      updatedCount
    });
  } catch (error) {
    logger.error('Error generating usernames:', error);
    res.status(500).json({ error: 'Failed to generate usernames' });
  }
});

// Step 3: Transfer CLIENT users to companies table
router.post('/transfer-clients', async (req, res) => {
  try {
    logger.info('Transferring CLIENT users to companies table...');
    
    // Get all CLIENT users
    const { data: clientUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'CLIENT');
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Get existing companies to check for duplicates
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('userId, username');
    
    const existingUserIds = new Set(existingCompanies?.map(c => c.userId) || []);
    const existingUsernames = new Set(existingCompanies?.map(c => c.username).filter(Boolean) || []);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const user of clientUsers || []) {
      // Skip if company already exists for this user
      if (existingUserIds.has(user.id)) {
        skippedCount++;
        logger.info(`Skipping user ${user.id} - company already exists`);
        continue;
      }
      
      // Generate unique username for company
      const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'company';
      const username = user.username || generateUsername(fullName || user.email?.split('@')[0] || 'company', existingUsernames);
      
      // Create company record
      const companyData = {
        id: `company_${user.id.substring(user.id.lastIndexOf('_') + 1)}`,
        username: username,
        name: fullName || 'Unnamed Company',
        description: 'Company profile transferred from user account',
        industry: '',
        companySize: '',
        location: '',
        website: '',
        logo: user.avatar || '',
        subscriptionType: 'BASIC',
        isVerified: false,
        createdAt: user.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('companies')
        .insert(companyData);
      
      if (!insertError) {
        createdCount++;
        existingUsernames.add(username);
        logger.info(`Created company for user ${user.id} with username: ${username}`);
      } else {
        logger.error(`Failed to create company for user ${user.id}:`, insertError);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Transferred ${createdCount} CLIENT users to companies table`,
      totalClients: clientUsers?.length || 0,
      createdCount,
      skippedCount
    });
  } catch (error) {
    logger.error('Error transferring CLIENT users:', error);
    res.status(500).json({ error: 'Failed to transfer CLIENT users' });
  }
});

// Step 4: Update companies with usernames
router.post('/update-company-usernames', async (req, res) => {
  try {
    logger.info('Updating company usernames...');
    
    // Get all companies
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name, username');
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Collect existing usernames
    const existingUsernames = new Set<string>();
    companies?.forEach(c => {
      if (c.username) existingUsernames.add(c.username);
    });
    
    // Generate usernames for companies without them
    let updatedCount = 0;
    for (const company of companies || []) {
      if (!company.username) {
        const username = generateUsername(company.name || 'company', existingUsernames);
        
        const { error: updateError } = await supabase
          .from('companies')
          .update({ username })
          .eq('id', company.id);
        
        if (!updateError) {
          updatedCount++;
          logger.info(`Generated username for company ${company.id}: ${username}`);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Updated usernames for ${updatedCount} companies`,
      totalCompanies: companies?.length || 0,
      updatedCount
    });
  } catch (error) {
    logger.error('Error updating company usernames:', error);
    res.status(500).json({ error: 'Failed to update company usernames' });
  }
});

// Run complete migration in sequence
router.post('/run-complete', async (req, res) => {
  try {
    const results = {
      columnsAdded: false,
      usernamesGenerated: 0,
      clientsTransferred: 0,
      companiesUpdated: 0
    };
    
    logger.info('Starting complete migration...');
    
    // Step 1: Add columns (might fail if no permission, that's okay)
    try {
      await fetch('http://localhost:3006/api/migration-complete/add-username-columns', { method: 'POST' });
      results.columnsAdded = true;
    } catch (e) {
      logger.warn('Could not add columns (may already exist)');
    }
    
    // Step 2: Generate usernames for users
    const usernameRes = await fetch('http://localhost:3006/api/migration-complete/generate-usernames', { method: 'POST' });
    const usernameData = await usernameRes.json() as any;
    results.usernamesGenerated = usernameData.updatedCount || 0;
    
    // Step 3: Transfer CLIENT users
    const transferRes = await fetch('http://localhost:3006/api/migration-complete/transfer-clients', { method: 'POST' });
    const transferData = await transferRes.json() as any;
    results.clientsTransferred = transferData.createdCount || 0;
    
    // Step 4: Update company usernames
    const companyRes = await fetch('http://localhost:3006/api/migration-complete/update-company-usernames', { method: 'POST' });
    const companyData = await companyRes.json() as any;
    results.companiesUpdated = companyData.updatedCount || 0;
    
    res.json({ 
      success: true, 
      message: 'Complete migration finished!',
      results
    });
  } catch (error) {
    logger.error('Error running complete migration:', error);
    res.status(500).json({ error: 'Failed to run complete migration' });
  }
});

// Get detailed status
router.get('/detailed-status', async (req, res) => {
  try {
    // Get users with role counts
    const { data: users } = await supabase
      .from('users')
      .select('id, firstName, lastName, email, role, username');
    
    // Get companies
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, userId, username');
    
    const clientUsers = users?.filter(u => u.role === 'CLIENT') || [];
    const companiesWithUserIds = companies?.filter(c => c.userId) || [];
    const usersWithUsernames = users?.filter(u => u.username) || [];
    const companiesWithUsernames = companies?.filter(c => c.username) || [];
    
    res.json({
      users: {
        total: users?.length || 0,
        withUsernames: usersWithUsernames.length,
        clients: clientUsers.length,
        clientsWithUsernames: clientUsers.filter(u => u.username).length
      },
      companies: {
        total: companies?.length || 0,
        withUserIds: companiesWithUserIds.length,
        withUsernames: companiesWithUsernames.length
      },
      clientUsers: clientUsers.map(u => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        username: u.username,
        hasCompany: companiesWithUserIds.some(c => c.userId === u.id)
      })),
      companiesList: companies?.map(c => ({
        id: c.id,
        name: c.name,
        username: c.username,
        userId: c.userId
      }))
    });
  } catch (error) {
    logger.error('Error getting detailed status:', error);
    res.status(500).json({ error: 'Failed to get detailed status' });
  }
});

export { router as migrationCompleteRouter };