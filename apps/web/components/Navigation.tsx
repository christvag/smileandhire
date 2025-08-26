'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

export default function Navigation() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simple user validation without causing loops
  const isUserAuthenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav id="main-navigation" className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div id="nav-container" className="container mx-auto px-4 py-4">
        <div id="nav-content" className="flex justify-between items-center">
          {/* Brand Logo */}
          <Link id="brand-logo" href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎉</span>
            <h1 id="brand-title" className="text-2xl font-bold text-gray-900">Worky Happy</h1>
          </Link>

          {/* Desktop Navigation */}
          <div id="desktop-nav" className="hidden md:flex items-center space-x-6">
            <Link id="nav-jobs" href="/jobs" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Browse Jobs
            </Link>
            <Link id="nav-companies" href="/companies" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Companies
            </Link>

            {isUserAuthenticated && user ? (
              <div id="authenticated-nav" className="flex items-center space-x-4">
                {/* User-specific navigation */}
                {user.role === 'CLIENT' && (
                  <Link id="nav-client-dashboard" href="/client/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'APPLICANT' && (
                  <Link id="nav-applicant-dashboard" href="/applicant/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link id="nav-admin-dashboard" href="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Admin
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={`${API_URL}/uploads/${user.avatar}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">👤</span>
                      )}
                    </div>
                    <span className="text-sm">
                      {user.firstName} {user.lastName}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {user.email}
                        </div>
                        <Link
                          href={user.role === 'CLIENT' ? `/happyclient/${user.company?.username || user.username || user.id}` : `/happyworker/${user.username || user.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            console.log('Desktop View Profile clicked - Username:', user.username, 'ID:', user.id, 'Full user:', user);
                            setIsMenuOpen(false);
                          }}
                        >
                          View Profile
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Edit Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link href="/jobs" className="text-gray-600 hover:text-indigo-600 py-2">
                Browse Jobs
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-indigo-600 py-2">
                Companies
              </Link>

              {isUserAuthenticated && user ? (
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={`${API_URL}/uploads/${user.avatar}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">👤</span>
                      )}
                    </div>
                    <span>{user.firstName} {user.lastName} ({user.email})</span>
                  </div>
                  
                  {user.role === 'CLIENT' && (
                    <Link href="/client/dashboard" className="block text-gray-600 hover:text-indigo-600 py-2">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'APPLICANT' && (
                    <Link href="/applicant/dashboard" className="block text-gray-600 hover:text-indigo-600 py-2">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="block text-gray-600 hover:text-indigo-600 py-2">
                      Admin
                    </Link>
                  )}

                  <Link 
                    href={user.role === 'CLIENT' ? `/happyclient/${user.company?.username || user.username || user.id}` : `/happyworker/${user.username || user.id}`} 
                    className="block text-gray-600 hover:text-indigo-600 py-2"
                    onClick={() => {
                      console.log('Mobile View Profile clicked - Username:', user.username, 'ID:', user.id, 'Full user:', user);
                    }}
                  >
                    View Profile
                  </Link>
                  <Link href="/profile" className="block text-gray-600 hover:text-indigo-600 py-2">
                    Edit Profile
                  </Link>
                  <Link href="/settings" className="block text-gray-600 hover:text-indigo-600 py-2">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-left text-red-600 hover:text-red-500 py-2 w-full"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t pt-2 mt-2 space-y-2">
                  <Link href="/login" className="block text-indigo-600 hover:text-indigo-500 py-2">
                    Sign In
                  </Link>
                  <Link href="/register" className="block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}