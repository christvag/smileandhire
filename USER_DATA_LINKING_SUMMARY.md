# User Data Linking Structure

## Database Tables and User Relationships

### 1. **users** (Main User Table)
- Primary key: `id` (text)
- Contains: email, role, firstName, lastName, phone, etc.
- **This is the central table all other data links to**

### 2. **applicant_profiles** (Jobseeker Profile Data)
- Foreign key: `userId` → `users.id`
- Contains: bio, skills (JSON), experience, education, portfolioUrl, linkedinUrl, githubUrl, resumeUrl, location, isOpenToWork, preferredJobTypes (JSON), expectedSalaryMin, expectedSalaryMax
- **ONE-TO-ONE relationship with users** (unique constraint on userId)

### 3. **applications** (Job Applications) 
- Foreign key: `userId` → `users.id`
- Foreign key: `jobId` → `jobs.id`
- Contains: coverLetter, resumeUrl, status, appliedAt, etc.
- **ONE-TO-MANY relationship with users** (one user can have multiple applications)
- **Unique constraint on (jobId, userId)** to prevent duplicate applications

### 4. **companies** (Company Profiles)
- Foreign key: `userId` → `users.id` 
- Contains: name, description, industry, size, location, website, logo, etc.
- **ONE-TO-ONE relationship with users** (unique constraint on userId)

### 5. **jobs** (Job Postings)
- Foreign key: `companyId` → `companies.id`
- Indirectly linked to users through companies table
- **ONE-TO-MANY relationship with companies**

## API Endpoints for User Data

### Comprehensive User Data
- `GET /api/user/complete-data` - Gets ALL user data in one request
  - User basic info
  - Profile data (if applicant)
  - Applications (if applicant) 
  - Company and jobs (if client)

### Individual Data Endpoints
- `GET /api/profiles/:userId` - Get applicant profile
- `PUT /api/applicant/profile` - Update applicant profile
- `GET /api/applicant/applications` - Get user's applications
- `POST /api/applications` - Create job application
- `GET /api/client/applications` - Get applications for client's jobs

## Data Flow on User Login

1. User authenticates → gets JWT token with `userId`
2. All subsequent API calls use `userId` from token
3. Frontend can call `/api/user/complete-data` to get all relevant data
4. Profile forms update `applicant_profiles` table linked to `userId`
5. Job applications create entries in `applications` table linked to `userId`
6. All data is automatically associated with the logged-in user

## Benefits of This Structure

✅ **No duplicate data** - All data properly linked to users table
✅ **Easy data retrieval** - Single userId gives access to all user data  
✅ **Clean relationships** - No redundant foreign keys
✅ **Scalable** - Can easily add new tables linked to userId
✅ **Secure** - All data access controlled by user authentication
✅ **Efficient** - Optimized queries with proper indexing