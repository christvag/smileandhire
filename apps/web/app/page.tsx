'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute, clearAllAuthCaches } from '../lib/auth-utils';

interface Stats {
  users: number;
  jobs: number;
  companies: number;
  applications: number;
}

interface FeaturedJob {
  id: string;
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  employmentType: string;
  category: string;
  isRemote: boolean;
  isUrgent: boolean;
  createdAt: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyLocation: string;
}

export default function LandingPageSupabase() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, jobs: 0, companies: 0, applications: 0 });
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Clear auth caches on mount if needed
  useEffect(() => {
    // Only clear caches if there's corrupted data or no valid token
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && !user) {
      // Token exists but no user data - clear everything
      clearAllAuthCaches();
    } else if (!token && user) {
      // User data exists but no token - clear everything
      clearAllAuthCaches();
    }
  }, []);

  const handleLogout = () => {
    clearAllAuthCaches();
    logout();
  };

  useEffect(() => {
    // Fetch platform stats using API
    async function fetchStats() {
      try {
        console.log('🔄 Fetching stats from API...');
        setIsLoadingStats(true);
        setStatsError(null);

        const response = await fetch(`${API_URL}/api/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Stats loaded from API:', data.stats);
        setStats(data.stats);
      } catch (error) {
        console.error('❌ Stats fetch failed:', error);
        setStatsError('Failed to load platform statistics');
      } finally {
        setIsLoadingStats(false);
      }
    }

    // Fetch featured jobs using API
    async function fetchJobs() {
      try {
        console.log('🔄 Fetching featured jobs from API...');
        setIsLoadingJobs(true);
        setJobsError(null);

        const response = await fetch(`${API_URL}/api/stats/featured-jobs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Featured jobs loaded from API: ${data.jobs.length} jobs`);
        setFeaturedJobs(data.jobs.slice(0, 3)); // Limit to 3 jobs for homepage
      } catch (error) {
        console.error('❌ Jobs fetch failed:', error);
        setJobsError('Failed to load featured jobs');
      } finally {
        setIsLoadingJobs(false);
      }
    }

    fetchStats();
    fetchJobs();
  }, []);

  return (
    <div id="landing-page" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav id="main-navigation" className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div id="brand-logo" className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <h1 className="text-2xl font-bold text-gray-900">Worky Happy</h1>
            </div>
            <div id="navigation-links" className="flex space-x-4 items-center">
              <Link href="/jobs" id="nav-jobs" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Browse Jobs
              </Link>
              <Link href="/companies" id="nav-companies" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Companies
              </Link>
              
              {authLoading ? (
                <div id="nav-loading" className="flex space-x-2">
                  <div className="w-16 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="w-16 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              ) : isAuthenticated() && user ? (
                <div id="nav-authenticated" className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.firstName || user.email}!</span>
                  <Link 
                    href={getDashboardRoute(user.role)} 
                    id="nav-dashboard" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    id="nav-logout" 
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div id="nav-guest" className="flex space-x-4">
                  <Link href="/login" id="nav-login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" id="nav-register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section id="hero-section" className="text-center mb-16">
          <h1 id="hero-title" className="text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
          </h1>
          <p id="hero-subtitle" className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and passion
          </p>
          
          {/* Search Bar */}
          <div id="hero-search" className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <input 
                id="search-input"
                type="text" 
                placeholder="Search for jobs, companies, or skills..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button id="search-button" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div id="hero-cta" className="flex justify-center space-x-4">
            {isAuthenticated() && user ? (
              <div id="hero-cta-authenticated" className="flex flex-col items-center space-y-4">
                <p className="text-lg text-gray-700">Welcome back, {user.firstName || user.email}!</p>
                <Link 
                  href={getDashboardRoute(user.role)} 
                  id="cta-dashboard" 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div id="hero-cta-guest" className="flex justify-center space-x-4">
                <Link href="/register?role=APPLICANT" id="cta-job-seeker" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  I'm looking for a job
                </Link>
                <Link href="/register?role=CLIENT" id="cta-employer" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  I'm hiring talent
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Platform Stats */}
        <section id="platform-stats" className="mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {isLoadingStats ? (
              // Loading state for stats
              <>
                <div id="stat-users-loading" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
                <div id="stat-jobs-loading" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
                <div id="stat-companies-loading" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
              </>
            ) : statsError ? (
              // Error state for stats
              <div id="stats-error" className="col-span-3 bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-red-600 mb-2">⚠️ {statsError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (
              // Normal stats display
              <>
                <div id="stat-users" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.users.toLocaleString()}+</div>
                  <p className="text-gray-600">Active Users</p>
                </div>
                <div id="stat-jobs" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.jobs.toLocaleString()}+</div>
                  <p className="text-gray-600">Job Listings</p>
                </div>
                <div id="stat-companies" className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.companies.toLocaleString()}+</div>
                  <p className="text-gray-600">Companies</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Featured Jobs */}
        <section id="featured-jobs" className="mb-16">
          <h2 id="featured-jobs-title" className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Job Opportunities
          </h2>
          <div id="featured-jobs-grid" className="grid gap-6 max-w-4xl mx-auto">
            {isLoadingJobs ? (
              // Loading state for jobs
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} id={`job-loading-${i}`} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : jobsError ? (
              // Error state for jobs
              <div id="jobs-error" className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-red-600 mb-4">⚠️ {jobsError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : featuredJobs.length > 0 ? (
              // Jobs display
              featuredJobs.map((job) => (
                <div key={job.id} id={`job-card-${job.id}`} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div id={`job-info-${job.id}`}>
                      <h3 id={`job-title-${job.id}`} className="text-xl font-semibold text-gray-900">
                        {job.title}
                        {job.isUrgent && (
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            🚨 Urgent
                          </span>
                        )}
                      </h3>
                      <p id={`job-company-${job.id}`} className="text-gray-600">
                        {job.companyName} • {job.isRemote ? 'Remote' : job.location}
                      </p>
                    </div>
                    <div id={`job-salary-${job.id}`} className="text-right">
                      {job.salaryMin && job.salaryMax ? (
                        <p className="text-green-600 font-semibold">
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-gray-500">Salary not specified</p>
                      )}
                      <p className="text-sm text-gray-500">{job.employmentType.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <p id={`job-description-${job.id}`} className="text-gray-700 mb-4">
                    {job.description?.substring(0, 150)}...
                  </p>
                  <div id={`job-actions-${job.id}`} className="flex justify-between items-center">
                    <span id={`job-category-${job.id}`} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {job.category || 'General'}
                    </span>
                    <Link href={`/jobs/${job.id}`} id={`job-apply-${job.id}`} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // No jobs state
              <div id="no-jobs-message" className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No featured jobs available yet. Be the first to post!</p>
                <Link href="/register?role=CLIENT" className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-16">
          <h2 id="how-it-works-title" className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div id="how-it-works-grid" className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Job Seekers */}
            <div id="for-job-seekers" className="bg-white rounded-lg shadow-lg p-8">
              <h3 id="job-seekers-title" className="text-2xl font-bold text-indigo-600 mb-6">For Job Seekers</h3>
              <div className="space-y-4">
                <div id="job-seeker-step-1" className="flex items-start space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-gray-700">Create your profile and upload your resume</p>
                </div>
                <div id="job-seeker-step-2" className="flex items-start space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-gray-700">Browse and apply to relevant job opportunities</p>
                </div>
                <div id="job-seeker-step-3" className="flex items-start space-x-3">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-gray-700">Get matched with employers and land your dream job</p>
                </div>
              </div>
            </div>

            {/* For Employers */}
            <div id="for-employers" className="bg-white rounded-lg shadow-lg p-8">
              <h3 id="employers-title" className="text-2xl font-bold text-green-600 mb-6">For Employers</h3>
              <div className="space-y-4">
                <div id="employer-step-1" className="flex items-start space-x-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-gray-700">Post your job openings and company details</p>
                </div>
                <div id="employer-step-2" className="flex items-start space-x-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-gray-700">Review applications and connect with candidates</p>
                </div>
                <div id="employer-step-3" className="flex items-start space-x-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-gray-700">Hire the best talent for your organization</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer id="main-footer" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div id="footer-content" className="grid md:grid-cols-4 gap-8">
            <div id="footer-brand">
              <h3 className="text-xl font-bold mb-4">🎉 Worky Happy</h3>
              <p className="text-gray-400">Your gateway to amazing career opportunities</p>
            </div>
            <div id="footer-job-seekers">
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors">Companies</Link></li>
                <li><Link href="/register?role=APPLICANT" className="hover:text-white transition-colors">Create Profile</Link></li>
              </ul>
            </div>
            <div id="footer-employers">
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register?role=CLIENT" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Employer Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div id="footer-support">
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div id="footer-bottom" className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Worky Happy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}