'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../../../lib/api';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/${params.id}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <Link href="/jobs" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Jobs
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Job Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <Link href={`/companies/${job.companyId}`} className="hover:text-indigo-600">
                    🏢 {job.companyName}
                  </Link>
                  <span>📍 {job.location}</span>
                  <span>💼 {job.type?.replace('_', ' ')}</span>
                  <span>🏠 {job.employmentType?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                {job.salaryMin && job.salaryMax && (
                  <p className="text-2xl font-bold text-green-600">
                    ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-500">{job.currency || 'USD'} / year</p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
              </section>

              {job.requirements && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{job.requirements}</div>
                </section>
              )}

              {job.skills && job.skills.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string) => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {job.tags && job.tags.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div>
              {/* Company Info Card */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">About {job.companyName}</h3>
                {job.companyLogo && (
                  <img src={job.companyLogo} alt={job.companyName} className="w-20 h-20 mb-4" />
                )}
                {job.companyDescription && (
                  <p className="text-sm text-gray-600 mb-4">{job.companyDescription}</p>
                )}
                {job.companyWebsite && (
                  <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" 
                     className="text-indigo-600 hover:text-indigo-500 text-sm">
                    Visit Website →
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {job.industry && (
                    <p><span className="font-medium">Industry:</span> {job.industry}</p>
                  )}
                  {job.companySize && (
                    <p><span className="font-medium">Company Size:</span> {job.companySize}</p>
                  )}
                </div>
              </div>

              {/* Job Stats */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Job Statistics</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Views:</span> {job.viewCount || 0}</p>
                  <p><span className="font-medium">Applications:</span> {job.applicationCount || 0}</p>
                  <p><span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}</p>
                  {job.applicationDeadline && (
                    <p><span className="font-medium">Deadline:</span> {new Date(job.applicationDeadline).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  {job.experienceLevel && (
                    <p><span className="font-medium">Experience:</span> {job.experienceLevel}</p>
                  )}
                  {job.educationLevel && (
                    <p><span className="font-medium">Education:</span> {job.educationLevel}</p>
                  )}
                  <p><span className="font-medium">Remote:</span> {job.isRemote ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Section */}
          <div className="mt-8 border-t pt-8">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Interested in this position?
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to apply for this job and track your application status
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Sign Up to Apply
                </Link>
                <Link
                  href="/login"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}