'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Redirect users to their specific dashboards
      if (parsedUser.role === 'CLIENT') {
        window.location.href = '/client/dashboard';
        return;
      }
      
      if (parsedUser.role === 'APPLICANT') {
        window.location.href = '/applicant/dashboard';
        return;
      }
      
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
      return;
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🎉 Worky Happy</h1>
              <span className="text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            You're logged in as a <span className="font-semibold text-indigo-600">{user?.role}</span>
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Profile Status</h3>
              <p className="text-sm text-indigo-700">
                {user?.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Account Type</h3>
              <p className="text-sm text-green-700">{user?.role}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Member Since</h3>
              <p className="text-sm text-blue-700">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {user?.role === 'APPLICANT' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Search</h3>
              <p className="text-gray-600 mb-4">Find your next opportunity</p>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Browse Jobs
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Saved Jobs
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Application History
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile</h3>
              <p className="text-gray-600 mb-4">Manage your profile and resume</p>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Update Profile
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Upload Resume
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Skills & Experience
                </button>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'CLIENT' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Management</h3>
              <p className="text-gray-600 mb-4">Manage your job postings</p>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Post New Job
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Active Jobs
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Draft Jobs
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Applications</h3>
              <p className="text-gray-600 mb-4">Review candidate applications</p>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  New Applications
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Under Review
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Interview Pipeline
                </button>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
              <p className="text-gray-600 mb-4">Manage platform users</p>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  All Users
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Pending Verification
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Management</h3>
              <p className="text-gray-600 mb-4">Moderate job postings</p>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  All Jobs
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Flagged Jobs
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h3>
              <p className="text-gray-600 mb-4">Platform statistics</p>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                  Reports
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  System Health
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">12</div>
              <div className="text-sm text-gray-500">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">45</div>
              <div className="text-sm text-gray-500">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-500">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        {/* Back to Homepage */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}