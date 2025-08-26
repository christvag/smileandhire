import express from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Helper to generate username from name
function generateUsername(name: string, existingUsernames: Set<string>): string {
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!baseUsername) baseUsername = 'user';
  
  let username = baseUsername;
  let counter = 1;
  while (existingUsernames.has(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  existingUsernames.add(username);
  return username;
}

// Step 1: Add username to users and generate usernames
router.post('/fix-user-usernames', async (req, res) => {
  try {
    logger.info('Fixing user usernames...');
    
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, firstName, lastName, email');
    
    if (fetchError) throw fetchError;
    
    const existingUsernames = new Set<string>();
    let updatedCount = 0;
    const updates: any[] = [];
    
    for (const user of users || []) {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email?.split('@')[0] || 'user';
      const username = generateUsername(fullName, existingUsernames);
      
      updates.push({
        id: user.id,
        username: username
      });
    }
    
    // Try to update users with usernames - this will fail if column doesn't exist
    for (const update of updates) {
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ username: update.username })
          .eq('id', update.id);
        
        if (!updateError) {
          updatedCount++;
          logger.info(`Set username for user ${update.id}: ${update.username}`);
        }
      } catch (e) {
        // Username column might not exist, that's okay
        logger.warn(`Could not update user ${update.id}: ${e}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} users with usernames`,
      totalUsers: users?.length || 0,
      updatedCount
    });
  } catch (error) {
    logger.error('Error fixing user usernames:', error);
    res.status(500).json({ error: 'Failed to fix user usernames' });
  }
});

// Step 2: Add username to companies and generate usernames
router.post('/fix-company-usernames', async (req, res) => {
  try {
    logger.info('Fixing company usernames...');
    
    // Get all companies
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (fetchError) throw fetchError;
    
    const existingUsernames = new Set<string>();
    let updatedCount = 0;
    const updates: any[] = [];
    
    for (const company of companies || []) {
      const username = generateUsername(company.name || 'company', existingUsernames);
      updates.push({
        id: company.id,
        username: username
      });
    }
    
    // Try to update companies with usernames - this will fail if column doesn't exist
    for (const update of updates) {
      try {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ username: update.username })
          .eq('id', update.id);
        
        if (!updateError) {
          updatedCount++;
          logger.info(`Set username for company ${update.id}: ${update.username}`);
        }
      } catch (e) {
        // Username column might not exist, that's okay
        logger.warn(`Could not update company ${update.id}: ${e}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} companies with usernames`,
      totalCompanies: companies?.length || 0,
      updatedCount
    });
  } catch (error) {
    logger.error('Error fixing company usernames:', error);
    res.status(500).json({ error: 'Failed to fix company usernames' });
  }
});

// Step 3: Create company records for CLIENT users
router.post('/create-companies-for-clients', async (req, res) => {
  try {
    logger.info('Creating companies for CLIENT users...');
    
    // Get all CLIENT users
    const { data: clientUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, firstName, lastName, email, role')
      .eq('role', 'CLIENT');
    
    if (fetchError) throw fetchError;
    
    // Get existing companies to avoid duplicates
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id, name');
    
    const existingCompanyNames = new Set(
      existingCompanies?.map(c => c.name.toLowerCase()) || []
    );
    
    // Also get usernames for uniqueness
    const existingUsernames = new Set<string>();
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const user of clientUsers || []) {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || 'Unnamed Company';
      
      // Skip if a company with this name already exists
      if (existingCompanyNames.has(fullName.toLowerCase())) {
        skippedCount++;
        logger.info(`Skipping user ${user.id} - company "${fullName}" already exists`);
        continue;
      }
      
      const username = generateUsername(fullName, existingUsernames);
      
      // Create minimal company record (without username for now since column doesn't exist)
      const companyData = {
        id: `company_${user.id.substring(user.id.lastIndexOf('_') + 1)}`,
        name: fullName,
        description: `${fullName}'s company profile`,
        industry: '',
        companySize: '',
        location: '',
        website: '',
        logo: '',
        subscriptionType: 'BASIC',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      try {
        const { error: insertError } = await supabase
          .from('companies')
          .insert(companyData);
        
        if (!insertError) {
          createdCount++;
          existingCompanyNames.add(fullName.toLowerCase());
          logger.info(`Created company for CLIENT user ${user.id}: ${fullName} (@${username})`);
        } else {
          logger.warn(`Could not create company for ${user.id}:`, insertError);
        }
      } catch (e) {
        logger.warn(`Failed to create company for ${user.id}:`, e);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Created ${createdCount} new companies for CLIENT users`,
      totalClients: clientUsers?.length || 0,
      createdCount,
      skippedCount
    });
  } catch (error) {
    logger.error('Error creating companies for clients:', error);
    res.status(500).json({ error: 'Failed to create companies for clients' });
  }
});

// Get migration status
router.get('/status', async (req, res) => {
  try {
    // Get users
    const { data: users } = await supabase
      .from('users')
      .select('id, firstName, lastName, email, role');
    
    // Get companies
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name');
    
    const clientUsers = users?.filter(u => u.role === 'CLIENT') || [];
    const applicantUsers = users?.filter(u => u.role === 'APPLICANT') || [];
    const adminUsers = users?.filter(u => u.role === 'ADMIN') || [];
    
    // Check which CLIENT users have matching companies
    const clientsWithCompanies = clientUsers.filter(user => {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || '';
      return companies?.some(c => 
        c.name.toLowerCase() === fullName.toLowerCase()
      );
    });
    
    res.json({
      users: {
        total: users?.length || 0,
        clients: clientUsers.length,
        applicants: applicantUsers.length,
        admins: adminUsers.length
      },
      companies: {
        total: companies?.length || 0
      },
      clientsWithCompanies: clientsWithCompanies.length,
      clientsWithoutCompanies: clientUsers.length - clientsWithCompanies.length,
      clientDetails: clientUsers.map(u => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        hasCompany: clientsWithCompanies.some(c => c.id === u.id)
      }))
    });
  } catch (error) {
    logger.error('Error getting migration status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Run all migrations
router.post('/run-all', async (req, res) => {
  try {
    const results = {
      userUsernames: { success: false, count: 0 },
      companyUsernames: { success: false, count: 0 },
      companiesCreated: { success: false, count: 0 }
    };
    
    logger.info('Running complete migration...');
    
    // Step 1: Fix user usernames
    try {
      const userRes = await fetch('http://localhost:3006/api/simple-migration/fix-user-usernames', { 
        method: 'POST' 
      });
      const userData = await userRes.json() as any;
      results.userUsernames = { 
        success: userData.success || false, 
        count: userData.updatedCount || 0 
      };
    } catch (e) {
      logger.warn('User username update failed:', e);
    }
    
    // Step 2: Fix company usernames
    try {
      const companyRes = await fetch('http://localhost:3006/api/simple-migration/fix-company-usernames', { 
        method: 'POST' 
      });
      const companyData = await companyRes.json() as any;
      results.companyUsernames = { 
        success: companyData.success || false, 
        count: companyData.updatedCount || 0 
      };
    } catch (e) {
      logger.warn('Company username update failed:', e);
    }
    
    // Step 3: Create companies for CLIENT users
    try {
      const createRes = await fetch('http://localhost:3006/api/simple-migration/create-companies-for-clients', { 
        method: 'POST' 
      });
      const createData = await createRes.json() as any;
      results.companiesCreated = { 
        success: createData.success || false, 
        count: createData.createdCount || 0 
      };
    } catch (e) {
      logger.warn('Company creation failed:', e);
    }
    
    res.json({ 
      success: true, 
      message: 'Migration completed',
      results
    });
  } catch (error) {
    logger.error('Error running complete migration:', error);
    res.status(500).json({ error: 'Failed to run migration' });
  }
});

export { router as simpleMigrationRouter };