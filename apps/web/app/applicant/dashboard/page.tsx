'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navigation from '../../../components/Navigation';
import ProfileImageUpload from '../../../components/ProfileImageUpload';
import SkillsExperienceForm from '../../../components/SkillsExperienceForm';
import { API_URL } from '../../../lib/api';

function ApplicantDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchApplicantData(token);
    }
  }, [user, token]);

  const fetchApplicantData = async (token: string) => {
    try {
      // Fetch user profile
      const profileResponse = await fetch(`${API_URL}/api/profiles/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // Parse JSON fields from database
        if (typeof profileData.skills === 'string') {
          profileData.skills = JSON.parse(profileData.skills || '[]');
        }
        if (typeof profileData.preferredJobTypes === 'string') {
          profileData.preferredJobTypes = JSON.parse(profileData.preferredJobTypes || '[]');
        }
        if (typeof profileData.jobHistory === 'string') {
          profileData.jobHistory = JSON.parse(profileData.jobHistory || '[]');
        }
        setProfile(profileData);
      }

      // Fetch applications
      const appsResponse = await fetch(`${API_URL}/api/applicant/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applicant data:', error);
    } finally {
      setLoading(false);
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
    <div id="applicant-dashboard" className="min-h-screen bg-gray-50">
      <Navigation />

      <div id="dashboard-container" className="container mx-auto px-4 py-8">
        <div id="dashboard-grid" className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div id="dashboard-sidebar" className="md:col-span-1">
            <div id="sidebar-navigation" className="bg-white rounded-lg shadow p-6">
              <h3 id="nav-title" className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav id="nav-menu" className="space-y-2">
                <button
                  id="nav-btn-overview"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  id="nav-btn-profile"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  👤 Update Profile
                </button>
                <button
                  id="nav-btn-photo"
                  onClick={() => setActiveTab('photo')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'photo' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📸 Profile Photo
                </button>
                <button
                  id="nav-btn-resume"
                  onClick={() => setActiveTab('resume')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📄 Upload Resume
                </button>
                <button
                  id="nav-btn-skills"
                  onClick={() => setActiveTab('skills')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'skills' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  🎯 Skills & Experience
                </button>
                <button
                  id="nav-btn-applications"
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  📝 My Applications
                </button>
                <button
                  id="nav-btn-messages"
                  onClick={() => setActiveTab('messages')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  💬 Messages
                </button>
                <button
                  id="nav-btn-jobs"
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  🔍 Browse Jobs
                </button>
                <Link
                  href={`/happyworker/${user?.username || user?.id}`}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 block text-gray-700"
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
                  <p className="text-2xl font-bold text-indigo-600">{applications.length}</p>
                  <p className="text-sm text-gray-500">Applications Sent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter((a: any) => a.status === 'REVIEWED' || a.status === 'INTERVIEW_SCHEDULED').length}
                  </p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {profile?.isOpenToWork ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-500">Open to Work</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div id="dashboard-main-content" className="md:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div id="tab-overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Profile Completion</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {calculateProfileCompletion(user, profile)}%
                        </p>
                      </div>
                      <span className="text-3xl">📊</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Applications Sent</p>
                        <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                      </div>
                      <span className="text-3xl">📤</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Response Rate</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {applications.length > 0 
                            ? Math.round((applications.filter((a: any) => a.status !== 'SUBMITTED').length / applications.length) * 100)
                            : 0}%
                        </p>
                      </div>
                      <span className="text-3xl">📈</span>
                    </div>
                  </div>
                </div>

                {/* Profile Status */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Profile Status</h3>
                  <div className="space-y-4">
                    <ProfileStatusItem 
                      label="Basic Information" 
                      completed={!!(user?.firstName && user?.lastName && user?.email)} 
                    />
                    <ProfileStatusItem 
                      label="Profile Photo" 
                      completed={!!user?.avatar} 
                    />
                    <ProfileStatusItem 
                      label="Bio & Description" 
                      completed={!!profile?.bio} 
                    />
                    <ProfileStatusItem 
                      label="Skills Listed" 
                      completed={!!(profile?.skills && profile?.skills.length > 0)} 
                    />
                    <ProfileStatusItem 
                      label="Resume Uploaded" 
                      completed={!!profile?.resumeUrl} 
                    />
                    <ProfileStatusItem 
                      label="Portfolio Link" 
                      completed={!!profile?.portfolioUrl} 
                    />
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
                            <p className="font-medium text-gray-900">{app.jobTitle}</p>
                            <p className="text-sm text-gray-600">{app.companyName}</p>
                            <p className="text-xs text-gray-500">
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-100 text-purple-800' :
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {applications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No applications yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div id="tab-profile">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Profile</h2>
                <ProfileUpdateForm user={user} profile={profile} onUpdate={(updatedProfile) => {
                  const token = localStorage.getItem('token');
                  if (token) fetchApplicantData(token);
                }} />
              </div>
            )}

            {/* Profile Photo Tab */}
            {activeTab === 'photo' && (
              <div id="tab-photo">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Photo</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <ProfileImageUpload
                    currentAvatar={user?.avatar}
                    onUploadSuccess={(avatarUrl) => {
                      // Update user object with new avatar
                      const updatedUser = { ...user, avatar: avatarUrl };
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                      
                      // Refresh profile data
                      const token = localStorage.getItem('token');
                      if (token) fetchApplicantData(token);
                      
                      alert('Profile photo updated successfully!');
                    }}
                    onUploadError={(error) => {
                      alert(`Upload failed: ${error}`);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div id="tab-resume">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Resume</h2>
                <ResumeUploadForm profile={profile} onUpdate={(updatedProfile) => {
                  const token = localStorage.getItem('token');
                  if (token) fetchApplicantData(token);
                }} />
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div id="tab-skills">
                <SkillsExperienceForm profile={profile} onUpdate={async (skillSets) => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    
                    const response = await fetch(`${API_URL}/api/applicant/skill-sets`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ skillSets })
                    });

                    if (response.ok) {
                      // Refresh data
                      fetchApplicantData(token);
                    } else {
                      throw new Error('Failed to update skill sets');
                    }
                  } catch (error) {
                    console.error('Error updating skill sets:', error);
                    throw error;
                  }
                }} />
              </div>
            )}


            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div id="tab-applications">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>
                <ApplicationsList applications={applications} />
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div id="tab-messages">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
                <ApplicantChatDashboard />
              </div>
            )}

            {/* Browse Jobs Tab */}
            {activeTab === 'jobs' && (
              <div id="tab-jobs">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Jobs</h2>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-4">Discover new opportunities</p>
                  <Link 
                    href="/jobs"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
                  >
                    View All Jobs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ProfileStatusItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm ${completed ? 'text-green-600' : 'text-gray-400'}`}>
        {completed ? '✅' : '⏳'}
      </span>
    </div>
  );
}

function calculateProfileCompletion(user: any, profile: any): number {
  const fields = [
    user?.firstName && user?.lastName,
    user?.email,
    user?.avatar,
    profile?.bio,
    profile?.skills && profile?.skills.length > 0,
    profile?.resumeUrl,
    profile?.portfolioUrl,
    profile?.linkedinUrl
  ];
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Profession tags for categorization
const suggestedProfessionTags = [
  "Remote", "Hybrid", "On-site", 
  "Full-time", "Part-time", "Contract", "Freelance",
  "Entry-level", "Mid-level", "Senior-level", "Expert",
  "Leadership", "Team-player", "Independent",
  "Fast-paced", "Detail-oriented", "Creative", "Analytical",
  "Problem-solver", "Innovative", "Reliable", "Adaptable",
  "Customer-focused", "Results-driven", "Collaborative",
  "Technical", "Strategic", "Operational", "Consultative"
];

// Profile Update Form Component
function ProfileUpdateForm({ user, profile, onUpdate }: { user: any; profile: any; onUpdate: (profile: any) => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    isOpenToWork: true,
    username: '',
    professionTags: [] as string[]
  });
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Update form data when user or profile changes
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      portfolioUrl: profile?.portfolioUrl || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      isOpenToWork: profile?.isOpenToWork !== false,
      username: user?.username || '',
      professionTags: profile?.professionTags || []
    });
  }, [user, profile]);
  
  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameChecking(true);
    try {
      const response = await fetch(`${API_URL}/api/check-username/${username}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    }
    setUsernameChecking(false);
  };

  // Add profession tag
  const addProfessionTag = (tag: string) => {
    if (!formData.professionTags.includes(tag)) {
      setFormData({
        ...formData,
        professionTags: [...formData.professionTags, tag]
      });
    }
  };

  // Remove profession tag
  const removeProfessionTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      professionTags: formData.professionTags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      // Update username if it changed
      if (formData.username !== user?.username && formData.username) {
        const usernameResponse = await fetch(`${API_URL}/api/user/username`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: formData.username })
        });

        if (!usernameResponse.ok) {
          const errorData = await usernameResponse.json();
          alert(`Failed to update username: ${errorData.error}`);
          return;
        }
      }
      
      // Update other profile data
      const { username, ...profileData } = formData;
      const response = await fetch(`${API_URL}/api/applicant/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update localStorage with new username
        if (formData.username !== user?.username) {
          const updatedUser = { ...user, username: formData.username };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        alert('Profile updated successfully!');
        onUpdate({ ...profile, ...formData });
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    const name = e.target.name;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Check username availability on username field changes
    if (name === 'username' && typeof value === 'string') {
      if (value !== user?.username) {
        checkUsernameAvailability(value);
      } else {
        setUsernameAvailable(null); // Reset if back to original username
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your-unique-username"
              pattern="[a-zA-Z0-9_-]{3,30}"
              title="3-30 characters: letters, numbers, hyphens, underscores only"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {usernameChecking && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
          {formData.username && formData.username !== user?.username && (
            <div className="mt-1 text-sm">
              {usernameAvailable === true && (
                <span className="text-green-600">✓ Username available</span>
              )}
              {usernameAvailable === false && (
                <span className="text-red-600">✗ Username taken</span>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Your profile will be available at: /happyworker/{formData.username || 'username'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio URL
          </label>
          <input
            type="url"
            name="portfolioUrl"
            value={formData.portfolioUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Profile
          </label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isOpenToWork"
            checked={formData.isOpenToWork}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Open to work opportunities
          </label>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio / Summary
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell employers about yourself, your experience, and what you're looking for..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Profession Tags */}
      <div id="profession-tags-section" className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profession Tags
          <span className="text-xs text-gray-500 ml-2">(Help employers find you - describe your work style and preferences)</span>
        </label>
        
        {/* Current Tags */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {formData.professionTags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                id={`current-tag-${tagIndex}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeProfessionTag(tag)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Add New Tag */}
        <div className="mb-3">
          <div className="flex gap-2">
            <input
              id="new-profession-tag-input"
              type="text"
              placeholder="Add custom tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const tag = input.value.trim();
                  if (tag) {
                    addProfessionTag(tag);
                    input.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = document.getElementById('new-profession-tag-input') as HTMLInputElement;
                const tag = input?.value.trim();
                if (tag) {
                  addProfessionTag(tag);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Suggested tags:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedProfessionTags
              .filter(tag => !formData.professionTags.includes(tag))
              .slice(0, 12) // Show first 12 suggestions
              .map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addProfessionTag(tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors border border-gray-200"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
}

// Resume Upload Form Component
function ResumeUploadForm({ profile, onUpdate }: { profile: any; onUpdate: (profile: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    setUploading(true);
    
    // For demo purposes, simulate upload
    setTimeout(() => {
      const mockResumeUrl = `https://example.com/resumes/${file.name}`;
      const updatedProfile = { ...profile, resumeUrl: mockResumeUrl };
      onUpdate(updatedProfile);
      setUploading(false);
      alert('Resume uploaded successfully! (Demo)');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        {profile?.resumeUrl ? (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <span className="text-green-800">✅ Resume uploaded successfully!</span>
              <p className="text-sm text-gray-600 mt-2">
                Current resume: resume.pdf
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <span className="text-yellow-800">⏳ No resume uploaded yet</span>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <span className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                  {uploading ? 'Uploading...' : 'Choose Resume File'}
                </span>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              PDF, DOC, or DOCX up to 5MB
            </p>
          </div>
        </div>

        {profile?.resumeUrl && (
          <div className="mt-6 flex justify-center space-x-4">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Current Resume
            </a>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Remove Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// Applications List Component
function ApplicationsList({ applications }: { applications: any[] }) {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">No applications yet</p>
        <Link 
          href="/jobs"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div key={app.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600">{app.companyName}</p>
                  <p className="text-sm text-gray-600">{app.jobLocation}</p>
                  {app.coverLetter && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      Cover Letter: {app.coverLetter}
                    </p>
                  )}
                  <div className="mt-3 flex space-x-4 text-xs text-gray-500">
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.expectedSalary && (
                      <span>Expected: ${app.expectedSalary.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-100 text-purple-800' :
                    app.status === 'INTERVIEWED' ? 'bg-indigo-100 text-indigo-800' :
                    app.status === 'OFFER_MADE' ? 'bg-orange-100 text-orange-800' :
                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(app.lastStatusUpdate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Applicant Chat Dashboard Component
function ApplicantChatDashboard() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

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

  const getParticipantInfo = (conversation: any) => {
    const participants = conversation.participants || [];
    const otherParticipant = participants.find((p: any) => p.id !== user?.id);
    return otherParticipant || { firstName: 'Unknown', lastName: 'User', company: null };
  };

  if (loading) {
    return <div id="applicant-chat-loading" className="flex justify-center items-center h-64">Loading messages...</div>;
  }

  return (
    <div id="applicant-chat-dashboard" className="bg-white rounded-lg shadow">
      <div className="flex h-[600px]">
        {/* Conversations List */}
        <div id="applicant-conversations-list" className="w-1/3 border-r border-gray-200">
          <div id="applicant-conversations-header" className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          <div id="applicant-conversations-scroll" className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div id="applicant-no-conversations" className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation: any) => {
                const participant = getParticipantInfo(conversation);
                return (
                  <div
                    key={conversation.id}
                    id={`applicant-conversation-${conversation.id}`}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {participant.company?.name || `${participant.firstName} ${participant.lastName}`}
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
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div id="applicant-messages-area" className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages List */}
              <div id="applicant-messages-list" className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    id={`applicant-message-${message.id}`}
                    className={`flex ${message.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender?.id === user?.id
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
              <div id="applicant-message-input-area" className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    id="applicant-message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    id="applicant-send-message-btn"
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
            <div id="applicant-no-conversation-selected" className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplicantDashboard() {
  return (
    <ProtectedRoute allowedRoles={['APPLICANT']}>
      <ApplicantDashboardContent />
    </ProtectedRoute>
  );
}