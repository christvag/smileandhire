import express from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Run migration to transfer CLIENT users to companies table and create admin records
router.post('/run-user-migration', async (req, res) => {
  try {
    logger.info('🚀 Starting comprehensive user migration...');

    // Step 1: Update user usernames
    logger.info('Step 1: Updating user usernames...');
    
    const usersWithoutUsernames = await supabase
      .from('users')
      .select('id, email, firstName, lastName, name')
      .is('username', null);

    if (usersWithoutUsernames.data) {
      for (const user of usersWithoutUsernames.data) {
        const baseUsername = user.email.split('@')[0].toLowerCase();
        let username = baseUsername;
        let counter = 1;

        // Ensure username is unique
        while (true) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

          if (!existingUser) break;
          
          username = `${baseUsername}${counter}`;
          counter++;
        }

        await supabase
          .from('users')
          .update({ username })
          .eq('id', user.id);

        logger.info(`Updated user ${user.email} -> @${username}`);
      }
    }

    // Step 2: Migrate CLIENT users to companies table
    logger.info('Step 2: Migrating CLIENT users to companies table...');

    const { data: clientUsers } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        firstName, 
        lastName, 
        name, 
        username,
        companies (id, name, username)
      `)
      .eq('role', 'CLIENT');

    if (clientUsers) {
      for (const user of clientUsers) {
        // Skip if company already exists
        if (user.companies && user.companies.length > 0) {
          // Update company username if missing
          const company = user.companies[0];
          if (!company.username && user.username) {
            await supabase
              .from('companies')
              .update({ username: user.username })
              .eq('id', company.id);
            
            logger.info(`Updated existing company username for ${user.email}: @${user.username}`);
          }
          continue;
        }

        // Generate company data
        const companyName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName} Company`
          : user.name 
          ? `${user.name} Company`
          : `${user.email.split('@')[0]} Company`;

        let companyUsername = user.username || 
          companyName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Ensure company username is unique
        let counter = 1;
        const originalUsername = companyUsername;
        while (true) {
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('username', companyUsername)
            .single();

          if (!existingCompany) break;
          
          companyUsername = `${originalUsername}${counter}`;
          counter++;
        }

        // Create company
        const { error } = await supabase
          .from('companies')
          .insert({
            userId: user.id,
            name: companyName,
            username: companyUsername,
            description: `Professional services company managed by ${user.firstName || user.name || user.email}`,
            location: 'Not specified',
            companySize: '1-10'
          });

        if (error) {
          logger.error(`Error creating company for ${user.email}:`, error);
        } else {
          logger.info(`Created company: ${companyName} (@${companyUsername}) for ${user.email}`);
        }
      }
    }

    // Step 3: Create admin records
    logger.info('Step 3: Creating admin records...');

    const { data: adminUsers } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        role,
        admins (id)
      `)
      .eq('role', 'ADMIN');

    if (adminUsers) {
      for (const user of adminUsers) {
        // Skip if admin record already exists
        if (user.admins && user.admins.length > 0) {
          logger.info(`Admin record already exists for ${user.email}`);
          continue;
        }

        // Create admin record
        const { error } = await supabase
          .from('admins')
          .insert({
            userId: user.id,
            permissions: [
              'MANAGE_USERS',
              'MANAGE_JOBS', 
              'MANAGE_COMPANIES',
              'VIEW_ANALYTICS',
              'MANAGE_APPLICATIONS',
              'SYSTEM_SETTINGS'
            ],
            department: 'ADMINISTRATION',
            accessLevel: 5,
            isActive: true
          });

        if (error) {
          logger.error(`Error creating admin record for ${user.email}:`, error);
        } else {
          logger.info(`Created admin record for ${user.email}`);
        }
      }
    }

    // Get summary
    const { data: userStats } = await supabase
      .from('users')
      .select('role')
      .not('username', 'is', null);

    const { data: companyStats } = await supabase
      .from('companies')
      .select('id');

    const { data: adminStats } = await supabase
      .from('admins')
      .select('id');

    logger.info('✅ Migration completed successfully!');
    
    res.json({
      success: true,
      message: 'Migration completed successfully!',
      summary: {
        usersWithUsernames: userStats?.length || 0,
        companiesCreated: companyStats?.length || 0,
        adminRecordsCreated: adminStats?.length || 0
      }
    });

  } catch (error) {
    logger.error('💥 Migration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error
    });
  }
});

// Get migration status
router.get('/status', async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('role')
      .not('username', 'is', null);

    const { data: clientUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'CLIENT');

    const { data: companies } = await supabase
      .from('companies')
      .select('id');

    const { data: adminUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'ADMIN');

    const { data: admins } = await supabase
      .from('admins')
      .select('id');

    res.json({
      usersWithUsernames: users?.length || 0,
      clientUsers: clientUsers?.length || 0,
      companiesCreated: companies?.length || 0,
      adminUsers: adminUsers?.length || 0,
      adminRecordsCreated: admins?.length || 0,
      migrationNeeded: {
        clientsWithoutCompanies: (clientUsers?.length || 0) - (companies?.length || 0),
        adminsWithoutRecords: (adminUsers?.length || 0) - (admins?.length || 0)
      }
    });
  } catch (error) {
    logger.error('Error getting migration status:', error);
    res.status(500).json({ error: 'Failed to get migration status' });
  }
});

export { router as migrationRouter };