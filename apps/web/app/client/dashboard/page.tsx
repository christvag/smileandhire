'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navigation from '../../../components/Navigation';
import { API_URL } from '../../../lib/api';

function ClientDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const hasFetched = useRef(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token && !hasFetched.current) {
      hasFetched.current = true;
      fetchClientData(token);
    }
  }, [user, token]); // Only fetch once when user/token are available

  // Also set company from user object if available
  useEffect(() => {
    if (user?.company) {
      setCompany(user.company);
    }
  }, [user]);

  const fetchClientData = async (token: string) => {
    try {
      // Fetch company jobs
      console.log('🔍 Fetching client jobs...');
      const jobsResponse = await fetch(`${API_URL}/api/client/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Jobs response status:', jobsResponse.status);
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log('📋 Jobs data received:', jobsData);
        setJobs(jobsData.jobs || []);
      } else {
        console.error('❌ Jobs fetch failed:', jobsResponse.status, await jobsResponse.text());
      }

      // Fetch applications
      console.log('🔍 Fetching client applications...');
      const appsResponse = await fetch(`${API_URL}/api/client/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Applications response status:', appsResponse.status);
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        console.log('📋 Applications data received:', appsData);
        setApplications(appsData.applications || []);
      } else {
        console.error('❌ Applications fetch failed:', appsResponse.status, await appsResponse.text());
      }

      // Fetch company profile
      try {
        console.log('🔍 Fetching company profile...');
        const companyResponse = await fetch(`${API_URL}/api/companies/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          console.log('🏢 Company data received:', companyData);
          setCompany(companyData.company);
        } else {
          console.log('ℹ️ No company profile found or failed to fetch');
        }
      } catch (error) {
        console.error('⚠️ Error fetching company profile:', error);
      }

    } catch (error) {
      console.error('💥 Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };


  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/client/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh applications
        fetchClientData(token!);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleStartConversation = async (participantId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId })
      });

      if (response.ok) {
        const data = await response.json();
        // Switch to messages tab and potentially highlight the conversation
        setActiveTab('messages');
      } else {
        console.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  💼 Job Postings
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📝 Applications
                </button>
                <button
                  onClick={() => setActiveTab('post-job')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'post-job' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  ➕ Post New Job
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  💬 Messages
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'company' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  🏢 Company Profile
                </button>
                <Link 
                  href={`/happyclient/${company?.username || user?.username || user?.id}`}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 block"
                >
                  👁️ View Public Profile
                </Link>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{jobs.length}</p>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{applications.length}</p>
                  <p className="text-sm text-gray-500">Total Applications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {applications.filter((a: any) => a.status === 'SUBMITTED').length}
                  </p>
                  <p className="text-sm text-gray-500">New Applications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Jobs</p>
                        <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                      </div>
                      <span className="text-3xl">💼</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">New Applications</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {applications.filter((a: any) => a.status === 'SUBMITTED').length}
                        </p>
                      </div>
                      <span className="text-3xl">📥</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">In Review</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {applications.filter((a: any) => a.status === 'REVIEWED').length}
                        </p>
                      </div>
                      <span className="text-3xl">👀</span>
                    </div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Applications</h3>
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {app.firstName} {app.lastName}
                            </p>
                            <p className="text-sm text-gray-600">Applied for: {app.jobTitle}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    + Post New Job
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                        <strong>Debug Info:</strong> Found {jobs.length} jobs
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(jobs, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {jobs.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No job postings yet</p>
                    ) : (
                      <div className="space-y-4">
                        {jobs.map((job: any) => (
                          <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                <p className="text-sm text-gray-600">
                                  {job.location} • {job.employmentType}
                                </p>
                                <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                  <span>👁 {job.viewCount || 0} views</span>
                                  <span>📝 {job.applicationCount || 0} applications</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-indigo-600 hover:text-indigo-500">Edit</button>
                                <button className="text-red-600 hover:text-red-500">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications Management</h2>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    {applications.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No applications received yet</p>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((app: any) => (
                          <div key={app.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {app.firstName} {app.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{app.email}</p>
                                <p className="text-sm text-gray-500">
                                  Applied for: <span className="font-medium">{app.jobTitle}</span>
                                </p>
                                {app.coverLetter && (
                                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                                    {app.coverLetter}
                                  </p>
                                )}
                                <div className="mt-3 flex space-x-4">
                                  <Link 
                                    href={`/happyworker/${app.username || app.userId}`}
                                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                                  >
                                    View Profile
                                  </Link>
                                  {app.resumeUrl && (
                                    <a href={app.resumeUrl} className="text-indigo-600 hover:text-indigo-500 text-sm">
                                      View Resume
                                    </a>
                                  )}
                                  <button 
                                    onClick={() => handleStartConversation(app.userId)}
                                    className="text-green-600 hover:text-green-500 text-sm"
                                  >
                                    Send Message
                                  </button>
                                </div>
                              </div>
                              <div className="ml-4">
                                <select
                                  value={app.status}
                                  onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                  className={`px-3 py-1 rounded-lg text-sm border ${
                                    app.status === 'SUBMITTED' ? 'bg-blue-50 border-blue-200' :
                                    app.status === 'REVIEWED' ? 'bg-yellow-50 border-yellow-200' :
                                    app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-50 border-purple-200' :
                                    app.status === 'ACCEPTED' ? 'bg-green-50 border-green-200' :
                                    'bg-red-50 border-red-200'
                                  }`}
                                >
                                  <option value="SUBMITTED">New</option>
                                  <option value="REVIEWED">Reviewed</option>
                                  <option value="INTERVIEW_SCHEDULED">Interview</option>
                                  <option value="INTERVIEWED">Interviewed</option>
                                  <option value="OFFER_MADE">Offer Made</option>
                                  <option value="ACCEPTED">Accepted</option>
                                  <option value="REJECTED">Rejected</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(app.appliedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Post Job Tab */}
            {activeTab === 'post-job' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Post New Job</h2>
                <JobPostingForm onSuccess={() => {
                  setActiveTab('jobs');
                  const token = localStorage.getItem('token');
                  if (token) fetchClientData(token);
                }} />
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
                <ChatDashboard />
              </div>
            )}

            {/* Company Profile Tab */}
            {activeTab === 'company' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h2>
                <CompanyProfileEditor />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Posting Form Component
function JobPostingForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: 'FULL_TIME',
    workType: 'ONSITE',
    location: '',
    experienceLevel: '',
    educationLevel: '',
    skills: '',
    tags: '',
    isRemote: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    console.log('🚀 Submitting job post...', formData);
    console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
    
    try {
      const response = await fetch(`${API_URL}/api/client/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          employmentType: formData.employmentType,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          isRemote: formData.workType === 'REMOTE' || formData.workType === 'HYBRID',
          isUrgent: false,
          category: null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        })
      });

      console.log('📊 Job post response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Job posted successfully:', result);
        alert('Job posted successfully!');
        onSuccess();
      } else {
        const errorText = await response.text();
        console.error('❌ Job post failed:', response.status, errorText);
        alert(`Failed to post job: ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Error posting job:', error);
      alert('Error posting job');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type
          </label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Location
          </label>
          <select
            name="workType"
            value={formData.workType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Salary
          </label>
          <input
            type="number"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Salary
          </label>
          <input
            type="number"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <input
            type="text"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            placeholder="e.g., 3-5 years"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level
          </label>
          <input
            type="text"
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            placeholder="e.g., Bachelor's Degree"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, Node.js, TypeScript"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="remote, startup, benefits"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Post Job
        </button>
      </div>
    </form>
  );
}

// Company Profile Editor Component
function CompanyProfileEditor() {
  const [companyData, setCompanyData] = useState({
    name: '',
    username: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    logo: '',
    foundedDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/companies/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const company = data.company;
        setCompanyId(company.id);
        setCompanyData({
          name: company.name || '',
          username: company.username || '',
          description: company.description || '',
          website: company.website || '',
          industry: company.industry || '',
          size: company.companySize || company.size || '',
          location: company.location || '',
          logo: company.logo || '',
          foundedDate: company.foundedDate ? new Date(company.foundedDate).toISOString().split('T')[0] : ''
        });
        setHasProfile(true);
      } else if (response.status === 404) {
        // No company profile exists yet
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const payload = {
        ...companyData,
        companySize: companyData.size, // Map size to companySize for API
        foundedDate: companyData.foundedDate ? new Date(companyData.foundedDate).toISOString() : null,
        ...(hasProfile && companyId && { id: companyId })
      };
      
      // Remove the size field as we're using companySize
      delete (payload as any).size;

      let response;
      if (hasProfile) {
        // Update existing profile
        response = await fetch(`${API_URL}/api/companies/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new profile
        response = await fetch(`${API_URL}/api/companies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Company profile saved:', result);
        
        // Store company ID if it's a new profile
        if (!hasProfile && result.company && result.company.id) {
          setCompanyId(result.company.id);
        }
        
        alert(hasProfile ? 'Company profile updated successfully!' : 'Company profile created successfully!');
        setHasProfile(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Company profile save failed:', response.status, errorText);
        alert(`Failed to save company profile: ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Error saving company profile:', error);
      alert('Error saving company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="name"
            value={companyData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={companyData.username}
            onChange={handleChange}
            placeholder="your-company-handle"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be your unique company URL: /happyclient/{companyData.username || 'username'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={companyData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            name="industry"
            value={companyData.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <input
            type="text"
            name="size"
            value={companyData.size}
            onChange={handleChange}
            placeholder="e.g., 50-100 employees"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            name="logo"
            value={companyData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Founded Date
          </label>
          <input
            type="date"
            name="foundedDate"
            value={companyData.foundedDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={companyData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Description
          </label>
          <textarea
            name="description"
            value={companyData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (hasProfile ? 'Update Company Profile' : 'Create Company Profile')}
        </button>
      </div>

      {!hasProfile && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> You need to create a company profile before you can post jobs.
          </p>
        </div>
      )}
    </form>
  );
}

// Chat Dashboard Component
function ChatDashboard() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`${API_URL}/api/messages/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        fetchConversations(); // Refresh conversations to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getParticipantName = (conversation: any) => {
    const participants = conversation.participants || [];
    const currentUser = participants.find((p: any) => p.id === token); // This would need user ID, simplified for now
    const otherParticipant = participants.find((p: any) => p.id !== currentUser?.id);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown';
  };

  if (loading) {
    return <div id="chat-loading" className="flex justify-center items-center h-64">Loading messages...</div>;
  }

  return (
    <div id="chat-dashboard" className="bg-white rounded-lg shadow">
      <div className="flex h-[600px]">
        {/* Conversations List */}
        <div id="conversations-list" className="w-1/3 border-r border-gray-200">
          <div id="conversations-header" className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          <div id="conversations-scroll" className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div id="no-conversations" className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation: any) => (
                <div
                  key={conversation.id}
                  id={`conversation-${conversation.id}`}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {getParticipantName(conversation)}
                      </h4>
                      {conversation.messages?.[0] && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.messages[0].content}
                        </p>
                      )}
                      {conversation.application && (
                        <p className="text-xs text-indigo-600 mt-1">
                          Re: {conversation.application.job?.title}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 text-right">
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div id="messages-area" className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages List */}
              <div id="messages-list" className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    id={`message-${message.id}`}
                    className={`flex ${message.sender?.id === token ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender?.id === token
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div id="message-input-area" className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    id="message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    id="send-message-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div id="no-conversation-selected" className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}