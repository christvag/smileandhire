'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navigation from '../../../components/Navigation';
import { API_URL } from '../../../lib/api';

interface CompanyProfile {
  id: string;
  name: string;
  username?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  logo?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  hiredCandidates: number;
  profileViews: number;
  responseRate: number;
}

function ClientProfileContent() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<CompanyStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlistedCandidates: 0,
    hiredCandidates: 0,
    profileViews: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchCompanyProfile();
    }
  }, [user, token]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);

      // Fetch company profile
      const profileResponse = await fetch(`${API_URL}/api/companies/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setCompany(profileData.company);
      }

      // Fetch jobs and applications for stats
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch(`${API_URL}/api/client/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/client/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let jobs = [];
      let applications = [];

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        jobs = jobsData.jobs || [];
      }

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        applications = applicationsData.applications || [];
      }

      // Calculate stats
      const activeJobs = jobs.filter((job: any) => job.status === 'PUBLISHED').length;
      const newApplications = applications.filter((app: any) => app.status === 'PENDING' || app.status === 'SUBMITTED').length;
      const shortlistedCandidates = applications.filter((app: any) => app.status === 'SHORTLISTED').length;
      const hiredCandidates = applications.filter((app: any) => app.status === 'HIRED').length;
      
      setStats({
        totalJobs: jobs.length,
        activeJobs,
        totalApplications: applications.length,
        newApplications,
        shortlistedCandidates,
        hiredCandidates,
        profileViews: Math.floor(Math.random() * 500) + 100, // Mock data
        responseRate: applications.length > 0 ? Math.round(((shortlistedCandidates + hiredCandidates) / applications.length) * 100) : 0
      });

    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const publicProfileUrl = company?.username 
    ? `/happyclient/${company.username}` 
    : company?.name 
      ? `/happyclient/${company.name.toLowerCase().replace(/\s+/g, '-')}` 
      : '#';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Profile Not Found</h1>
            <p className="text-gray-600 mb-8">Please complete your company profile first.</p>
            <Link
              href="/client/dashboard"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="client-profile-page" className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div id="profile-header" className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-2xl font-bold">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 id="company-name" className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  {company.isVerified && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  {company.industry && <span>🏢 {company.industry}</span>}
                  {company.companySize && <span>👥 {company.companySize} employees</span>}
                  {company.location && <span>📍 {company.location}</span>}
                </div>
                
                {company.website && (
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={publicProfileUrl}
                target="_blank"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                👁️ View Public Profile
              </Link>
              <Link
                href="/client/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
          
          {company.description && (
            <div id="company-description" className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About {company.name}</h2>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}
        </div>

        {/* Metrics Widgets - Square Design */}
        <div id="metrics-section" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Jobs Widget */}
            <div id="widget-total-jobs" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalJobs}</div>
              <p className="text-sm text-gray-600">Total Jobs Posted</p>
            </div>

            {/* Active Jobs Widget */}
            <div id="widget-active-jobs" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeJobs}</div>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </div>

            {/* Total Applications Widget */}
            <div id="widget-total-applications" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalApplications}</div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>

            {/* New Applications Widget */}
            <div id="widget-new-applications" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.newApplications}</div>
              <p className="text-sm text-gray-600">New Applications</p>
            </div>

            {/* Shortlisted Candidates Widget */}
            <div id="widget-shortlisted" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.shortlistedCandidates}</div>
              <p className="text-sm text-gray-600">Shortlisted</p>
            </div>

            {/* Hired Candidates Widget */}
            <div id="widget-hired" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.hiredCandidates}</div>
              <p className="text-sm text-gray-600">Hired</p>
            </div>

            {/* Profile Views Widget */}
            <div id="widget-profile-views" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.profileViews}</div>
              <p className="text-sm text-gray-600">Profile Views</p>
            </div>

            {/* Response Rate Widget */}
            <div id="widget-response-rate" className="bg-white rounded-lg shadow p-6 text-center aspect-square flex flex-col justify-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.responseRate}%</div>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div id="action-buttons" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post New Job</h3>
              <p className="text-gray-600 text-sm">Create and publish a new job opening</p>
            </Link>

            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Jobs</h3>
              <p className="text-gray-600 text-sm">Edit, pause, or delete existing jobs</p>
            </Link>

            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
              <p className="text-gray-600 text-sm">View and manage candidate applications</p>
            </Link>

            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Profile</h3>
              <p className="text-gray-600 text-sm">Update company information and settings</p>
            </Link>

            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Plan</h3>
              <p className="text-gray-600 text-sm">Access premium features and tools</p>
            </Link>

            <Link
              href="/client/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View detailed hiring analytics</p>
            </Link>
          </div>
        </div>

        {/* Company Information Summary */}
        <div id="company-info-summary" className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div id="basic-info">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Name:</span>
                  <span className="font-medium">{company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">{company.industry || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Size:</span>
                  <span className="font-medium">{company.companySize || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{company.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Website:</span>
                  <span className="font-medium">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                        View Website
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div id="status-info">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Status:</span>
                  <span className={`font-medium ${company.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                    {company.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(company.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(company.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Public Profile:</span>
                  <span className="font-medium">
                    <Link href={publicProfileUrl} target="_blank" className="text-indigo-600 hover:text-indigo-800">
                      View Public Profile
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientProfile() {
  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <ClientProfileContent />
    </ProtectedRoute>
  );
}