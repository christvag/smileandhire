# Worky Happy - Job Board & HR Management Platform

A comprehensive job posting and HR management platform featuring AI-powered resume analysis, real-time communication, and advanced filtering capabilities.

## 📊 Current Status

✅ **What's Working:**
- Frontend Next.js application (port 3005)
- Backend Express API (port 3006) 
- Mock data API mode (no database required)
- Homepage with hero section and job listings
- Authentication structure
- UI components (buttons, cards, inputs)

⚠️ **Known Issues:**
- PostgreSQL connection requires Docker setup
- Prisma client generation needs configuration in workspaces

💡 **Quick Test:** You can run the application immediately without any database setup using mock data mode!

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Docker** (optional - for PostgreSQL, Redis, MinIO)
- **Git** (latest version)

### Installation & Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/worky-happy.git
cd worky-happy
```

#### Step 2: Install Dependencies
```bash
# Install all workspace dependencies
npm install
```

#### Step 3: Environment Setup (Optional)
Create environment files if needed:
```bash
# For API (.env in apps/api/)
cd apps/api
echo "JWT_SECRET=your-secret-key-change-in-production" > .env
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/worky_happy" >> .env
cd ../..

# For Web (.env.local in apps/web/)
cd apps/web
echo "NEXT_PUBLIC_API_URL=http://localhost:3006" > .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3005" >> .env.local
cd ../..
```

#### Step 4: Start Development Servers

**Option A: Start Both API and Web App Together**
```bash
# From root directory - starts both services concurrently
npm run dev
```

**Option B: Start Services Individually**

Terminal 1 - Start API Server:
```bash
cd apps/api
npm run dev
# API runs on http://localhost:3006
```

Terminal 2 - Start Web Application:
```bash
cd apps/web
npm run dev
# Web app runs on http://localhost:3005
```

**Option C: Start Without Database (Mock Data)**
```bash
cd apps/api
npm run dev:no-db
# Runs API with mock data, no database required
```

#### Step 5: Access the Application
- **Frontend:** http://localhost:3005
- **API Health Check:** http://localhost:3006/health

### 🔴 Important Notes on Ports

Per CLAUDE.md instructions:
- **Web App:** Always runs on port **3005**
- **API:** Always runs on port **3006**
- If ports are in use, kill existing processes before starting

#### Killing Processes on Windows
```powershell
# Find process using port 3005
netstat -ano | findstr :3005
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Find process using port 3006  
netstat -ano | findstr :3006
# Kill the process
taskkill /PID <PID> /F
```

#### Killing Processes on Mac/Linux
```bash
# Kill process on port 3005
lsof -ti:3005 | xargs kill -9

# Kill process on port 3006
lsof -ti:3006 | xargs kill -9
```

## 📋 Development Commands

### Main Commands
```bash
# From root directory
npm run dev           # Start both frontend (3005) and backend (3006)
npm run dev:web       # Start only frontend on port 3005
npm run dev:api       # Start only backend on port 3006
npm run build         # Build all workspaces
npm run lint          # Lint all workspaces
```

### API-Specific Commands
```bash
cd apps/api
npm run dev              # Start with database connection (port 3006)
npm run dev:no-db        # Start with mock data, no database
npm run dev:original     # Start with SQLite database
npm run build            # Build TypeScript to JavaScript
```

### Web-Specific Commands
```bash
cd apps/web
npm run dev              # Start Next.js dev server (port 3005)
npm run build            # Build production bundle
npm run start            # Start production server
npm run type-check       # Check TypeScript types
```

### Database Commands (if using PostgreSQL)
```bash
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Prisma Studio GUI
```

## 🏗️ Project Structure

```
worky-happy/
├── apps/
│   ├── web/                      # Next.js frontend (port 3005)
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── jobs/             # Job listings
│   │   │   ├── profile/          # User profiles
│   │   │   ├── login/            # Authentication
│   │   │   └── dashboard/        # User dashboards
│   │   ├── components/           # React components
│   │   │   ├── ui/               # UI components (button, card, input)
│   │   │   ├── home/             # Homepage sections
│   │   │   └── layout/           # Header, footer
│   │   └── contexts/             # React contexts (Auth)
│   └── api/                      # Express.js backend (port 3006)
│       ├── src/
│       │   ├── api-with-db.ts    # Main API with database
│       │   ├── simple-index-no-db.ts # API with mock data
│       │   ├── routes/           # API endpoints
│       │   ├── middleware/       # Auth, error handling
│       │   ├── db/               # Database connections
│       │   └── socket/           # Real-time features
│       └── worky-happy.sqlite    # SQLite database file
├── docs/                         # Project documentation
│   ├── PRD.md                   # Product requirements
│   └── Job Plan.md              # Implementation plan
├── CLAUDE.md                     # Project-specific AI instructions
├── CURRENT_STATUS.md             # Current development status
├── QUICK_START.md                # Quick start guide
└── package.json                  # Workspace configuration
```

## 🔑 Default User Accounts

When using the mock data API (`npm run dev:no-db`), these accounts are available:

### Admin Account
- **Email:** admin@worky.com
- **Password:** admin123
- **Role:** Administrator

### Company/Client Accounts
- **Email:** client@techcorp.com
- **Password:** client123
- **Role:** Client (Company HR)

### Applicant Accounts
- **Email:** applicant@example.com
- **Password:** applicant123
- **Role:** Job Applicant

When using PostgreSQL with seeded data:
- **Admin:** admin@worky-happy.com (admin123)
- **Client:** hr@vagroup.com (client123)
- **Applicants:** john.doe@email.com, jane.smith@email.com (applicant123)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (CLIENT role)

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/company-applications` - Get company's received applications

### User Management
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/applicant-profile` - Update applicant profile
- `PATCH /api/users/company-profile` - Update company profile

### Admin
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/reports` - User reports
- `PATCH /api/admin/users/:id/ban` - Ban/unban user

## 🎯 Core Features

### For Job Seekers (Applicants)
- **AI-Powered Profile Creation:** Upload resume for automatic profile generation
- **Smart Job Matching:** Advanced filtering and search capabilities
- **Application Tracking:** Monitor application status in real-time
- **Profile Scoring:** AI-driven profile completeness evaluation (A/B/C/D grades)
- **Real-time Communication:** Chat with recruiters directly on the platform

### For Employers (Clients)
- **Job Posting Management:** Create, edit, and manage job listings
- **Candidate Pipeline:** Organize applications through recruitment stages
- **Advanced Search:** Find candidates using sophisticated filters
- **Real-time Notifications:** Instant updates on new applications
- **Company Branding:** Customizable company profiles with ratings

### For Administrators
- **User Management:** Monitor and moderate user accounts
- **Analytics Dashboard:** Platform usage and performance metrics
- **Spam Prevention:** 4-strike system with automated moderation
- **Report Management:** Handle user complaints and violations

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand + TanStack Query
- **Authentication:** NextAuth.js
- **Real-time:** Socket.IO Client

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL 15 + Prisma ORM
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.IO
- **File Storage:** MinIO (S3-compatible)
- **Caching:** Redis
- **Validation:** Zod

### AI & ML (Planned)
- **Local LLM:** Ollama
- **Document Processing:** PDF-parse, Mammoth
- **Vector Search:** pgvector extension

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Monitoring:** Winston logger
- **Testing:** Jest + Playwright (planned)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/worky_happy` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `OLLAMA_BASE_URL` | Ollama API endpoint | `http://localhost:11434` |

### Docker Services

The `docker-compose.yml` includes:

- **PostgreSQL:** Database with pgvector extension
- **Redis:** Session storage and caching
- **MinIO:** S3-compatible object storage

## 🧪 Testing (Planned)

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📱 Mobile Support

The platform is built with mobile-first responsive design:
- Progressive Web App (PWA) capabilities
- Touch-optimized interfaces
- Offline functionality (planned)
- Native app feel on mobile devices

## 🔒 Security Features

- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Rate Limiting:** API endpoint protection
- **Input Validation:** Zod schema validation
- **File Upload Security:** Type and size restrictions
- **CORS Protection:** Cross-origin request filtering

## 🚀 Deployment (Production)

### Docker Production Setup
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Build applications
npm run build

# Start production servers
npm run start
```

## 📊 Performance Targets

- **Page Load Time:** < 3 seconds (LCP)
- **API Response Time:** < 500ms (95th percentile)
- **Search Results:** < 1 second
- **File Upload:** < 30 seconds for 10MB files
- **Real-time Messages:** < 100ms delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Option 1: Run without database
cd apps/api
npm run dev:no-db

# Option 2: Use SQLite version
npm run dev:original

# Option 3: Check PostgreSQL (if using Docker)
docker ps | grep postgres
npm run docker:down && npm run docker:up
```

**Port Already in Use (3005 or 3006)**
```bash
# Windows
netstat -ano | findstr :3005
taskkill /PID <PID> /F

# Mac/Linux  
lsof -ti:3005 | xargs kill -9
```

**Module Not Found Errors**
```bash
# Clean install from root
cd C:\Users\eneat\job-board
rm -rf node_modules package-lock.json
npm install
```

**API Not Connecting**
```bash
# Ensure API is running on port 3006
cd apps/api
npm run dev

# Check health endpoint
curl http://localhost:3006/health
```

### Getting Help

- 📖 Check the [documentation](./docs/)
- 🐛 Report bugs via [GitHub Issues](https://github.com/your-org/worky-happy/issues)
- 💬 Join our community discussions

## 📈 Roadmap

### Phase 1: MVP (Current)
- [x] Core authentication system
- [x] Basic job posting and application flow
- [x] Simple profile management
- [ ] AI resume parsing integration
- [ ] Admin dashboard foundations

### Phase 2: Enhanced Features
- [ ] Advanced search and filtering
- [ ] Real-time messaging system
- [ ] AI profile evaluation system
- [ ] Company profiles and ratings
- [ ] Mobile application

### Phase 3: Scale and Optimize
- [ ] Multi-tenant architecture
- [ ] Advanced analytics and reporting
- [ ] API marketplace for integrations
- [ ] Machine learning recommendations
- [ ] Video interview integration

---

**Built with ❤️ by the Worky Happy Team**