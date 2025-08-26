# 🧪 Worky Happy Testing Guide

## 🚀 Quick Start

### Prerequisites
- ✅ API running on: `http://localhost:3001`
- ✅ Web app running on: `http://localhost:3005`
- ✅ PostgreSQL database connected
- ✅ Debug overlay active (development mode)

## 👥 Test Users Created

### 🏢 CLIENT (Employer/Company)
- **Email:** `client@worky.com`
- **Password:** `password123`
- **Name:** John Manager
- **Role:** CLIENT
- **Access:** Client Dashboard, Job Posting

### 👨‍💻 APPLICANT (Job Seeker)
- **Email:** `jobseeker@worky.com`
- **Password:** `password123`
- **Name:** Jane Applicant
- **Role:** APPLICANT
- **Access:** Applicant Dashboard, Job Applications

## 🔄 Complete Testing Workflow

### Step 1: Test Client (Employer) Workflow

1. **Access Client Dashboard**
   ```
   URL: http://localhost:3005/client/dashboard
   Login: client@worky.com / password123
   ```

2. **Dashboard Features to Test:**
   - ✅ Overview tab (stats and recent applications)
   - ✅ Job Postings tab (view existing jobs)
   - ✅ Applications tab (manage applicants)
   - ✅ Post New Job tab (create job postings)
   - ✅ Company Profile tab

3. **Post a New Job:**
   - Click "Post New Job" tab
   - Fill in job details:
     - Title: e.g., "Frontend Developer"
     - Description: Job responsibilities
     - Requirements: Skills needed
     - Location: e.g., "Remote" or "New York"
     - Salary: Min/Max range
     - Employment Type: FULL_TIME, PART_TIME, etc.
   - Submit and verify success message
   - Check "Job Postings" tab to see new job

4. **Debug Information:**
   - Check browser console for detailed logs
   - Look at debug overlay (bottom-right) for API calls
   - Debug panel shows raw job data

### Step 2: Test Job Seeker (Applicant) Workflow

1. **Access Applicant Dashboard**
   ```
   URL: http://localhost:3005/applicant/dashboard
   Login: jobseeker@worky.com / password123
   ```

2. **Dashboard Features to Test:**
   - ✅ Overview tab (profile completion, applications)
   - ✅ Job Search tab (browse available jobs)
   - ✅ Applications tab (track application status)
   - ✅ Profile tab (update personal information)

3. **Apply for Jobs:**
   - Browse jobs in Job Search tab
   - Click on a job posting
   - Fill out application form
   - Submit application
   - Check Applications tab for status

### Step 3: Test End-to-End Workflow

1. **As CLIENT:**
   - Post a new job
   - Go to Applications tab (should be empty initially)

2. **As APPLICANT:**
   - Find the newly posted job
   - Apply to the job
   - Check application status

3. **As CLIENT:**
   - Refresh Applications tab
   - See new application
   - Update application status
   - Test status updates

## 🐛 Debug Tools Available

### 1. Debug Overlay (Bottom-Right)
- **What it shows:** All API requests/responses
- **How to use:** Click to expand, view details
- **Features:**
  - Request/response logging
  - Status codes
  - Response data
  - Error tracking
  - Quick auth checks

### 2. Browser Console Logs
- **Open:** F12 → Console tab
- **Look for:** Emojis (🔍, 📊, ✅, ❌) indicating different log types
- **Information:**
  - API call details
  - Authentication status
  - Data fetching results
  - Error messages

### 3. Debug Panels on Pages
- **Location:** Development mode only
- **Shows:** Raw data being fetched
- **Format:** JSON format for inspection

## 🔍 Common Issues to Check

### Jobs Not Appearing
1. Check browser console for errors
2. Verify debug overlay shows successful API calls
3. Look at debug panel raw data
4. Confirm user is logged in with correct role

### Authentication Issues
1. Check localStorage for token
2. Use debug overlay "Check Auth" button
3. Verify token format in console logs
4. Try logging out and back in

### Database Issues
1. Check API logs for database errors
2. Verify database connection in API console
3. Test API endpoints directly with curl

## 📊 Test Job Posted

**Pre-created job for testing:**
- **Title:** Senior React Developer
- **Company:** My Company
- **Location:** San Francisco, CA
- **Salary:** $90,000 - $130,000
- **Type:** FULL_TIME
- **ID:** 61d091ae-13fb-41f1-a0a6-bd1c6788acb3

## 🔧 API Endpoints for Manual Testing

### Authentication
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","role":"CLIENT"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@worky.com","password":"password123"}'
```

### Client Endpoints (Require Bearer Token)
```bash
# Get client jobs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/client/jobs

# Post new job
curl -X POST http://localhost:3001/api/client/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","description":"Test description","location":"Remote","employmentType":"FULL_TIME"}'

# Get applications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/client/applications
```

## 🎯 Success Criteria

### Client Dashboard
- ✅ Can log in successfully
- ✅ Dashboard loads without errors
- ✅ Can create new job postings
- ✅ Jobs appear in Jobs tab after creation
- ✅ Debug tools show successful API calls

### Applicant Dashboard
- ✅ Can log in with different credentials
- ✅ Dashboard loads with applicant view
- ✅ Can view available jobs
- ✅ Can apply to jobs
- ✅ Applications tracked properly

### Integration
- ✅ Jobs posted by clients visible to applicants
- ✅ Applications from applicants visible to clients
- ✅ Status updates work end-to-end
- ✅ Real-time updates (after refresh)

## 🚨 Troubleshooting

### If Jobs Don't Appear
1. **Check browser console** for API errors
2. **Look at debug overlay** for failed requests
3. **Verify authentication** using debug tools
4. **Check API logs** for server-side errors
5. **Test API directly** with curl commands

### If Login Fails
1. **Verify credentials** match test users above
2. **Check API health** at http://localhost:3001/health
3. **Clear localStorage** and try again
4. **Check database connection** in API logs

### If Debug Overlay Missing
1. **Confirm development mode** (NODE_ENV=development)
2. **Check browser console** for JavaScript errors
3. **Refresh page** to reload components
4. **Verify component is imported** in layout.tsx

---

## 📝 Notes

- Debug overlay only appears in development mode
- All API calls are logged for debugging
- Test users are pre-created with known credentials
- Database has sample job posting for testing
- Both dashboards have role-based access control