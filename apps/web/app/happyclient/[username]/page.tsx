'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import { API_URL } from '../../../lib/api';
import { useNextAuth } from '../../../contexts/NextAuthContext';
import { useAuth } from '../../../contexts/AuthContext';
import AuthStatus from '../../../components/auth/AuthStatus';

interface Job {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salaryMin: number;
  salaryMax: number;
  isRemote: boolean;
  isUrgent: boolean;
  createdAt: string;
  description: string;
  category: string;
  tags: string[];
  applicationCount: number;
}

interface Company {
  id: string;
  name: string;
  username: string;
  description: string;
  website: string;
  location: string;
  industry: string;
  companySize: string;
  logo: string;
  subscriptionType: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  jobs: Job[];
}

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: nextAuthUser, isAuthenticated: nextAuthIsAuthenticated } = useNextAuth();
  const { user: authUser, isAuthenticated: authIsAuthenticated } = useAuth();
  
  // Use NextAuth if available, fallback to old Auth
  const user = nextAuthUser || authUser;
  const isAuthenticated = () => nextAuthIsAuthenticated() || authIsAuthenticated();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/companies/username/${username}`);
        
        if (response.ok) {
          const data = await response.json();
          setCompany(data.company);
        } else if (response.status === 404) {
          setError('Company not found');
        } else {
          setError('Failed to load company profile');
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
        setError('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCompanyProfile();
    }
  }, [username]);

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `$${min.toLocaleString()}+`;
    }
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleJobAction = (jobId: string) => {
    if (!isAuthenticated()) {
      // User not logged in - redirect to signup
      router.push('/register');
    } else if (user?.role === 'APPLICANT') {
      // Logged in as jobseeker - navigate to job application
      router.push(`/jobs/${jobId}`);
    } else {
      // Logged in as client or admin - show message or redirect appropriately
      alert('This action is available for job seekers only.');
    }
  };

  const getActionButtonText = () => {
    if (!isAuthenticated()) {
      return 'Sign Up to Apply';
    } else if (user?.role === 'APPLICANT') {
      return 'Apply Now';
    } else {
      return 'View Job';
    }
  };

  const getActionButtonStyle = () => {
    if (!isAuthenticated()) {
      return 'bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap ml-4';
    } else if (user?.role === 'APPLICANT') {
      return 'bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap ml-4';
    } else {
      return 'bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 whitespace-nowrap ml-4';
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <a
              href="/"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div id="company-profile-page" className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Debug Auth Status */}
        <AuthStatus />
        
        {/* Company Header */}
        <div id="company-header" className="bg-white rounded-lg shadow p-8 mb-8">
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
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                {company.isVerified && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                <span>🏢 {company.industry}</span>
                <span>👥 {company.companySize} employees</span>
                <span>📍 {company.location}</span>
              </div>
              
              <div className="flex items-center gap-4">
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
                
                {/* Global Action Button */}
                <div className="ml-auto">
                  {!isAuthenticated() ? (
                    <Link
                      href="/register"
                      id="company-signup-button"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Sign Up to Apply
                    </Link>
                  ) : user?.role === 'APPLICANT' ? (
                    <div className="text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Ready to apply! Choose a job below
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        Company profile view
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {company.description && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About {company.name}</h2>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}
        </div>

        {/* User Status Banner */}
        {isAuthenticated() && user && (
          <div id="user-status-banner" className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">
                    {user.role === 'APPLICANT' ? '👤' : '🏢'}
                  </span>
                </div>
                <span className="text-blue-800 font-medium">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.name || user.email}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {user.role === 'APPLICANT' ? 'Job Seeker' : user.role}
                </span>
              </div>
              <div className="text-blue-600 text-sm ml-auto">
                {user.role === 'APPLICANT' 
                  ? "You can apply to any job that interests you!" 
                  : "Viewing as company profile"
                }
              </div>
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div id="job-listings" className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Open Positions ({company.jobs.length})
          </h2>
          
          {company.jobs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No open positions at the moment. Check back later!
            </p>
          ) : (
            <div className="space-y-6">
              {company.jobs.map((job) => (
                <div key={job.id} id={`job-${job.id}`} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                        {job.isUrgent && (
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            🚨 Urgent
                          </span>
                        )}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-gray-600 mb-3">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.employmentType}</span>
                        {job.isRemote && <span>🏠 Remote</span>}
                        <span>💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 Posted {formatDate(job.createdAt)}</span>
                        <span>👥 {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                        {job.category && <span>🏷️ {job.category}</span>}
                      </div>
                    </div>
                    
                    <button 
                      id={`apply-button-${job.id}`}
                      onClick={() => handleJobAction(job.id)}
                      className={getActionButtonStyle()}
                    >
                      {getActionButtonText()}
                    </button>
                  </div>
                  
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}