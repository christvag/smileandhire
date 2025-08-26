import { PrismaClient, UserRole, JobStatus, EmploymentType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.applicantSkill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleaned existing data');

  // Create skills
  const skills = await Promise.all([
    prisma.skill.create({
      data: { name: 'JavaScript', category: 'Programming' }
    }),
    prisma.skill.create({
      data: { name: 'TypeScript', category: 'Programming' }
    }),
    prisma.skill.create({
      data: { name: 'React', category: 'Frontend' }
    }),
    prisma.skill.create({
      data: { name: 'Node.js', category: 'Backend' }
    }),
    prisma.skill.create({
      data: { name: 'PostgreSQL', category: 'Database' }
    }),
    prisma.skill.create({
      data: { name: 'Python', category: 'Programming' }
    }),
    prisma.skill.create({
      data: { name: 'Marketing', category: 'Business' }
    }),
    prisma.skill.create({
      data: { name: 'Sales', category: 'Business' }
    }),
  ]);

  console.log('✅ Created skills');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@worky-happy.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
    },
  });

  console.log('👤 Created admin user');

  // Create company users
  const clientPassword = await bcrypt.hash('client123', 10);
  const companyUser1 = await prisma.user.create({
    data: {
      email: 'hr@vagroup.com',
      passwordHash: clientPassword,
      role: UserRole.CLIENT,
      firstName: 'Sarah',
      lastName: 'Johnson',
      isVerified: true,
    },
  });

  const companyUser2 = await prisma.user.create({
    data: {
      email: 'hiring@techcorp.com',
      passwordHash: clientPassword,
      role: UserRole.CLIENT,
      firstName: 'Mike',
      lastName: 'Chen',
      isVerified: true,
    },
  });

  // Create companies
  const company1 = await prisma.company.create({
    data: {
      userId: companyUser1.id,
      name: 'The VA Group',
      description: 'Leading virtual assistant services company providing top-tier remote support to businesses worldwide.',
      industry: 'Virtual Assistant Services',
      size: '11-50',
      foundedDate: new Date('2020-01-15'),
      location: 'Remote',
      website: 'https://thevagroup.com',
      rating: 4.5,
      ratingCount: 25,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      userId: companyUser2.id,
      name: 'TechCorp Solutions',
      description: 'Innovative technology solutions for modern businesses.',
      industry: 'Technology',
      size: '51-200',
      foundedDate: new Date('2018-03-20'),
      location: 'Manila, Philippines',
      website: 'https://techcorp.com',
      rating: 4.2,
      ratingCount: 18,
    },
  });

  console.log('🏢 Created companies');

  // Create applicant users
  const applicantPassword = await bcrypt.hash('applicant123', 10);
  const applicantUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        passwordHash: applicantPassword,
        role: UserRole.APPLICANT,
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@email.com',
        passwordHash: applicantPassword,
        role: UserRole.APPLICANT,
        firstName: 'Jane',
        lastName: 'Smith',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.wilson@email.com',
        passwordHash: applicantPassword,
        role: UserRole.APPLICANT,
        firstName: 'Alex',
        lastName: 'Wilson',
        isVerified: true,
      },
    }),
  ]);

  // Create applicant profiles
  const applicants = await Promise.all([
    prisma.applicant.create({
      data: {
        userId: applicantUsers[0].id,
        headline: 'Full Stack Developer with 3+ years experience',
        location: 'Cebu, Philippines',
        summary: 'Passionate developer with expertise in modern web technologies.',
        availability: 'Immediately',
        salaryMin: 50000,
        salaryMax: 80000,
        profileScore: 'A',
        completionPercentage: 95,
        aiSummary: 'Strong technical skills with excellent problem-solving abilities.',
      },
    }),
    prisma.applicant.create({
      data: {
        userId: applicantUsers[1].id,
        headline: 'Digital Marketing Specialist',
        location: 'Manila, Philippines',
        summary: 'Creative marketing professional with proven track record.',
        availability: '2 weeks notice',
        salaryMin: 35000,
        salaryMax: 55000,
        profileScore: 'B',
        completionPercentage: 85,
        aiSummary: 'Excellent communication skills and marketing expertise.',
      },
    }),
    prisma.applicant.create({
      data: {
        userId: applicantUsers[2].id,
        headline: 'Virtual Assistant & Customer Support',
        location: 'Davao, Philippines',
        summary: 'Dedicated professional with strong organizational skills.',
        availability: 'Immediately',
        salaryMin: 25000,
        salaryMax: 40000,
        profileScore: 'B',
        completionPercentage: 80,
        aiSummary: 'Reliable and detail-oriented with great customer service skills.',
      },
    }),
  ]);

  console.log('👥 Created applicants');

  // Add experiences for applicants
  await Promise.all([
    prisma.experience.create({
      data: {
        applicantId: applicants[0].id,
        title: 'Software Developer',
        company: 'Web Solutions Inc.',
        location: 'Cebu, Philippines',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2024-08-01'),
        description: 'Developed web applications using React and Node.js',
        highlights: ['Built 5+ customer-facing applications', 'Improved performance by 40%'],
      },
    }),
    prisma.experience.create({
      data: {
        applicantId: applicants[1].id,
        title: 'Marketing Coordinator',
        company: 'Digital Agency Pro',
        location: 'Manila, Philippines',
        startDate: new Date('2022-01-15'),
        isCurrent: true,
        description: 'Managed social media campaigns and content creation',
        highlights: ['Increased engagement by 60%', 'Managed campaigns worth $50K+'],
      },
    }),
  ]);

  // Add skills to applicants
  await Promise.all([
    prisma.applicantSkill.create({
      data: {
        applicantId: applicants[0].id,
        skillId: skills[0].id, // JavaScript
        level: 4,
        yearsOfExperience: 3,
      },
    }),
    prisma.applicantSkill.create({
      data: {
        applicantId: applicants[0].id,
        skillId: skills[2].id, // React
        level: 4,
        yearsOfExperience: 2,
      },
    }),
    prisma.applicantSkill.create({
      data: {
        applicantId: applicants[1].id,
        skillId: skills[6].id, // Marketing
        level: 5,
        yearsOfExperience: 3,
      },
    }),
  ]);

  console.log('💼 Added experiences and skills');

  // Create job postings
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        companyId: company1.id,
        title: 'Virtual Assistant - Administrative Support',
        description: 'We are looking for a reliable virtual assistant to provide administrative support to our growing team. The ideal candidate will have excellent communication skills and be highly organized.',
        requirements: 'Requirements:\n- Excellent English communication skills\n- Proficient in MS Office Suite\n- Previous VA experience preferred\n- Reliable internet connection\n- Available for full-time work',
        salaryMin: 25000,
        salaryMax: 35000,
        location: 'Remote',
        employmentType: EmploymentType.FULL_TIME,
        category: 'Administrative',
        tags: ['Virtual Assistant', 'Administrative', 'Remote', 'Entry Level'],
        status: JobStatus.PUBLISHED,
        isRemote: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    }),
    prisma.job.create({
      data: {
        companyId: company1.id,
        title: 'Customer Service Representative',
        description: 'Join our customer service team and help provide exceptional support to our clients. This is a remote position perfect for someone with strong communication skills.',
        requirements: 'Requirements:\n- Strong verbal and written communication\n- Customer service experience\n- Problem-solving skills\n- Flexibility with schedules',
        salaryMin: 28000,
        salaryMax: 38000,
        location: 'Remote',
        employmentType: EmploymentType.FULL_TIME,
        category: 'Customer Service',
        tags: ['Customer Service', 'Remote', 'Communication'],
        status: JobStatus.PUBLISHED,
        isRemote: true,
        isUrgent: true,
      },
    }),
    prisma.job.create({
      data: {
        companyId: company2.id,
        title: 'Full Stack Developer',
        description: 'We are seeking a talented Full Stack Developer to join our development team. You will work on exciting projects using modern technologies.',
        requirements: 'Requirements:\n- 2+ years experience with React/Node.js\n- Knowledge of databases (PostgreSQL preferred)\n- Experience with REST APIs\n- Git version control\n- Problem-solving mindset',
        salaryMin: 60000,
        salaryMax: 90000,
        location: 'Manila, Philippines',
        employmentType: EmploymentType.FULL_TIME,
        category: 'Technology',
        tags: ['JavaScript', 'React', 'Node.js', 'Full Stack'],
        status: JobStatus.PUBLISHED,
      },
    }),
    prisma.job.create({
      data: {
        companyId: company2.id,
        title: 'Digital Marketing Manager',
        description: 'Lead our digital marketing efforts and drive growth through innovative campaigns and strategies.',
        requirements: 'Requirements:\n- 3+ years digital marketing experience\n- Social media management expertise\n- Google Ads and Facebook Ads experience\n- Analytics and reporting skills\n- Creative thinking',
        salaryMin: 45000,
        salaryMax: 65000,
        location: 'Manila, Philippines',
        employmentType: EmploymentType.FULL_TIME,
        category: 'Marketing',
        tags: ['Digital Marketing', 'Social Media', 'PPC', 'Analytics'],
        status: JobStatus.PUBLISHED,
      },
    }),
  ]);

  console.log('💼 Created job postings');

  // Create sample applications
  await Promise.all([
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        applicantId: applicants[2].id,
        userId: applicantUsers[2].id,
        status: ApplicationStatus.PENDING,
        coverLetter: 'I am very interested in this virtual assistant position. I have excellent organizational skills and am available to start immediately.',
        appliedAt: new Date(),
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[2].id,
        applicantId: applicants[0].id,
        userId: applicantUsers[0].id,
        status: ApplicationStatus.REVIEWED,
        coverLetter: 'I am excited about this full stack developer opportunity. My experience with React and Node.js makes me a great fit for this role.',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
  ]);

  console.log('📝 Created sample applications');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Seed Data Summary:');
  console.log('- Admin user: admin@worky-happy.com (password: admin123)');
  console.log('- Company users: hr@vagroup.com, hiring@techcorp.com (password: client123)');
  console.log('- Applicant users: john.doe@email.com, jane.smith@email.com, alex.wilson@email.com (password: applicant123)');
  console.log('- 2 Companies with 4 job postings');
  console.log('- 3 Applicants with skills and experiences');
  console.log('- 2 Sample applications');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });