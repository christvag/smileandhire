# Worky Happy - Installation & Setup Guide

## 🎯 Complete Local Setup Instructions

### Step 1: Prerequisites Check

Before starting, ensure you have installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check Docker version
docker --version

# Check Docker Compose version  
docker compose version
```

### Step 2: Project Setup

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\eneat\job-board
   ```

2. **Copy environment variables:**
   ```bash
   # Copy the example file to create your local env
   copy .env.example .env.local
   ```

3. **Install all dependencies:**
   ```bash
   npm install
   ```

### Step 3: Infrastructure Setup

1. **Start Docker services:**
   ```bash
   npm run docker:up
   ```
   
   This starts:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - MinIO (ports 9000, 9001)

2. **Wait for services to be ready** (about 30 seconds)

3. **Initialize database:**
   ```bash
   # Generate Prisma client
   npm run db:generate --workspace=packages/database
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

### Step 4: Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend (Next.js):** http://localhost:3000
- **Backend (Express.js):** http://localhost:3001

### Step 5: Verify Installation

1. **Check Frontend:** Visit http://localhost:3000
   - You should see the Worky Happy homepage
   - Hero section with search functionality
   - Featured jobs and companies

2. **Check Backend API:** Visit http://localhost:3001/health
   - Should return health status JSON

3. **Check Database:** 
   ```bash
   npm run db:studio --workspace=packages/database
   ```
   - Opens Prisma Studio at http://localhost:5555
   - Browse seeded data

4. **Check MinIO:** Visit http://localhost:9001
   - Login: `minioadmin` / `minioadmin`
   - File storage interface

## 🔐 Default User Accounts

After running the seed script, use these accounts:

### Admin Account
- **Email:** admin@worky-happy.com
- **Password:** admin123
- **Access:** Full platform administration

### Company/Recruiter Account  
- **Email:** hr@vagroup.com
- **Password:** client123
- **Access:** Job posting and candidate management

### Job Seeker Accounts
- **Email:** john.doe@email.com
- **Password:** applicant123
- **Profile:** Full Stack Developer

- **Email:** jane.smith@email.com  
- **Password:** applicant123
- **Profile:** Digital Marketing Specialist

## 🛠️ Development Commands

### Database Management
```bash
npm run db:migrate    # Apply database migrations
npm run db:seed       # Add sample data
npm run db:studio     # Open database GUI
npm run db:reset      # Reset database (destructive!)
```

### Application Development
```bash
npm run dev           # Start both apps
npm run dev:web       # Frontend only
npm run dev:api       # Backend only
npm run build         # Build for production
```

### Docker Management
```bash
npm run docker:up     # Start services
npm run docker:down   # Stop services
docker ps             # View running containers
```

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports 3000 and 3001
npx kill-port 3000 3001
```

**Database connection failed:**
```bash
# Restart Docker services
npm run docker:down
npm run docker:up
# Wait 30 seconds then retry
```

**Module not found errors:**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

**Prisma client issues:**
```bash
# Regenerate Prisma client
npm run db:generate --workspace=packages/database
```

### Windows-Specific Issues

**Docker Desktop not running:**
- Ensure Docker Desktop is started
- Check system tray for Docker icon
- Restart Docker Desktop if needed

**Permission errors:**
```cmd
# Run command prompt as Administrator
# Or use PowerShell as Administrator
```

## 📁 Project Structure Overview

```
worky-happy/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express.js backend
├── packages/
│   └── database/         # Prisma ORM setup
├── docker-compose.yml    # Infrastructure services
├── .env.local           # Environment variables
└── package.json         # Root workspace config
```

## 🚀 Next Steps

1. **Explore the Platform:**
   - Browse jobs at http://localhost:3000
   - Test user registration and login
   - Try job application flow

2. **Development:**
   - Start with authentication setup
   - Add job listing page
   - Implement user dashboards

3. **Customization:**
   - Update company branding
   - Modify job categories
   - Adjust UI components

## 📞 Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Ensure Docker services are running
4. Check the console for error messages

The platform is now ready for development and testing! 🎉