// Simple in-memory database for development/testing
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  postedDate: Date;
}

class SimpleDB {
  private users: Map<string, User> = new Map();
  private jobs: Map<string, Job> = new Map();

  constructor() {
    // Add some sample data
    this.users.set('user1', {
      id: 'user1',
      email: 'test@example.com',
      password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of "password"
      name: 'Test User',
      role: 'applicant'
    });

    this.jobs.set('job1', {
      id: 'job1',
      title: 'Senior Developer',
      company: 'Tech Corp',
      location: 'Remote',
      description: 'We are looking for a senior developer...',
      requirements: ['5+ years experience', 'React', 'Node.js'],
      salary: '$100k-$150k',
      type: 'full-time',
      postedDate: new Date()
    });
  }

  // User methods
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // Job methods
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  createJob(job: Job): Job {
    this.jobs.set(job.id, job);
    return job;
  }

  searchJobs(query: string): Job[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllJobs().filter(job => 
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.description.toLowerCase().includes(lowerQuery)
    );
  }
}

export const db = new SimpleDB();

// Export compatibility functions for simple-index.ts
export const testConnection = async (): Promise<boolean> => {
  // Simple in-memory DB is always connected
  return true;
};

export const userQueries = {
  findByEmail: (email: string) => db.getUserByEmail(email),
  create: (user: User) => db.createUser(user),
  findById: (id: string) => db.getUser(id)
};

export default db;