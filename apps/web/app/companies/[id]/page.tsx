'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../../../lib/api';

export default function CompanyProfilePage() {
  const params = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCompany();
    }
  }, [params.id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies/${params.id}`);
      const data = await response.json();
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company not found</h1>
          <Link href="/jobs" className="text-indigo-600 hover:text-indigo-500">
            ← Browse Jobs
          </Link>
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
            <Link href="/" className="text-2xl font-bold text-gray-900">
              🎉 Worky Happy
            </Link>
            <div className="flex space-x-4">
              <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                Sign In
              </Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/jobs" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Company Header */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg">
            <div className="absolute -bottom-12 left-8">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-24 h-24 bg-white rounded-lg shadow-lg p-2" />
              ) : (
                <div className="w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-3xl">🏢</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pt-16 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                {company.industry && (
                  <p className="text-gray-600">Industry: {company.industry}</p>
                )}
                {company.location && (
                  <p className="text-gray-600">📍 {company.location}</p>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                     className="text-indigo-600 hover:text-indigo-500">
                    🌐 Visit Website
                  </a>
                )}
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block mb-2">
                  {company.isVerified ? '✅ Verified Company' : '⏳ Pending Verification'}
                </div>
                <p className="text-sm text-gray-500">
                  Member since {new Date(company.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Company Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{company.staffCount || 0}</div>
                <div className="text-sm text-gray-600">Current Staff</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{company.jobCount || 0}</div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {company.companySize || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Company Size</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {company.subscriptionType || 'BASIC'}
                </div>
                <div className="text-sm text-gray-600">Subscription</div>
              </div>
            </div>

            {/* Company Description */}
            {company.description && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Us</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
              </section>
            )}

            {/* Active Jobs */}
            {company.activeJobs && company.activeJobs.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Open Positions</h2>
                <div className="grid gap-4">
                  {company.activeJobs.map((job: any) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:text-indigo-600">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {job.type?.replace('_', ' ')} • {job.location}
                          </p>
                        </div>
                        <div className="text-right">
                          {job.salaryMin && job.salaryMax && (
                            <p className="text-green-600 font-semibold">
                              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Call to Action */}
            <div className="mt-8 bg-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Want to work with {company.name}?
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to apply for positions and connect with this company
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Create Account
                </Link>
                <Link
                  href="/jobs"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Browse All Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}