const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateClientUsersToCompanies() {
  console.log('🚀 Starting migration of CLIENT users to companies table...');

  try {
    // Find all CLIENT users
    const clientUsers = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      include: {
        company: true  // Check if they already have a company record
      }
    });

    console.log(`📊 Found ${clientUsers.length} CLIENT users`);

    for (const user of clientUsers) {
      console.log(`\n👤 Processing user: ${user.email} (${user.id})`);

      if (user.company) {
        console.log(`  ✅ Company already exists: ${user.company.name}`);
        
        // Update company with username if missing
        if (!user.company.username && user.username) {
          const updatedCompany = await prisma.company.update({
            where: { id: user.company.id },
            data: {
              username: user.username
            }
          });
          console.log(`  🔧 Updated company username to: ${updatedCompany.username}`);
        }
        
        continue;
      }

      // Generate company name from user info
      const companyName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName} Company`
        : user.name 
        ? `${user.name} Company`
        : `${user.email.split('@')[0]} Company`;

      // Generate username from company name or user info
      let companyUsername = (user.username || 
                            companyName.toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)/g, '') ||
                            user.email.split('@')[0])
                           .toLowerCase();

      // Ensure username is unique
      let counter = 1;
      let originalUsername = companyUsername;
      while (await prisma.company.findUnique({ where: { username: companyUsername } })) {
        companyUsername = `${originalUsername}${counter}`;
        counter++;
      }

      // Create company record
      const newCompany = await prisma.company.create({
        data: {
          userId: user.id,
          name: companyName,
          username: companyUsername,
          description: `Professional services company managed by ${user.firstName || user.name || user.email}`,
          location: user.applicant?.location || 'Not specified',
          size: '1-10', // Default small company size
        }
      });

      console.log(`  ✅ Created company: ${newCompany.name} (@${newCompany.username})`);
    }

    console.log('\n🎉 CLIENT users migration completed!');

  } catch (error) {
    console.error('❌ Error during CLIENT migration:', error);
  }
}

async function migrateAdminUsers() {
  console.log('\n🚀 Starting migration of ADMIN users...');

  try {
    // Find all ADMIN users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      include: {
        admin: true  // Check if they already have an admin record
      }
    });

    console.log(`📊 Found ${adminUsers.length} ADMIN users`);

    for (const user of adminUsers) {
      console.log(`\n👤 Processing admin: ${user.email} (${user.id})`);

      if (user.admin) {
        console.log(`  ✅ Admin record already exists`);
        continue;
      }

      // Create admin record with appropriate permissions
      const newAdmin = await prisma.admin.create({
        data: {
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
          accessLevel: 5, // Full access for admins
          isActive: true,
        }
      });

      console.log(`  ✅ Created admin record with full permissions`);
    }

    console.log('\n🎉 ADMIN users migration completed!');

  } catch (error) {
    console.error('❌ Error during ADMIN migration:', error);
  }
}

async function updateUserUsernames() {
  console.log('\n🚀 Updating user usernames...');

  try {
    // Find users without usernames
    const usersWithoutUsernames = await prisma.user.findMany({
      where: {
        username: null
      }
    });

    console.log(`📊 Found ${usersWithoutUsernames.length} users without usernames`);

    for (const user of usersWithoutUsernames) {
      // Generate username from email
      let baseUsername = user.email.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;

      // Ensure username is unique
      while (await prisma.user.findUnique({ where: { username: username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { username: username }
      });

      console.log(`  ✅ Updated ${user.email} -> @${username}`);
    }

    console.log('\n🎉 Username update completed!');

  } catch (error) {
    console.error('❌ Error updating usernames:', error);
  }
}

async function main() {
  console.log('🚀 Starting comprehensive migration...\n');

  await updateUserUsernames();
  await migrateClientUsersToCompanies();
  await migrateAdminUsers();

  console.log('\n✅ All migrations completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   - Updated user usernames');
  console.log('   - Migrated CLIENT users to companies table');
  console.log('   - Created admin records for ADMIN users');
  console.log('   - Generated company usernames for profile URLs');
}

main()
  .catch((e) => {
    console.error('💥 Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });