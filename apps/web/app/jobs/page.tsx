'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import { API_URL } from '../../lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    position: '',
    salaryMin: '',
    salaryMax: '',
    type: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const searchQuery = filters.search || filters.position;
      if (searchQuery) params.append('q', searchQuery);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('employmentType', filters.type);

      const response = await fetch(`${API_URL}/api/jobs?${params}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div id="jobs-page" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 id="jobs-title" className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Browse Job Opportunities
        </h1>

        {/* Filters */}
        <div id="jobs-filters" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 id="filters-title" className="text-xl font-semibold text-gray-900 mb-4">Filter Jobs</h2>
          <form onSubmit={handleSearch} id="filters-form" className="grid md:grid-cols-5 gap-4">
            <div id="filter-position">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                id="position-input"
                value={filters.position}
                onChange={handleFilterChange}
                placeholder="e.g., Developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div id="filter-location">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location-input"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., Remote"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div id="filter-salary-min">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Salary
              </label>
              <input
                type="number"
                name="salaryMin"
                id="salary-min-input"
                value={filters.salaryMin}
                onChange={handleFilterChange}
                placeholder="30000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div id="filter-salary-max">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Salary
              </label>
              <input
                type="number"
                name="salaryMax"
                id="salary-max-input"
                value={filters.salaryMax}
                onChange={handleFilterChange}
                placeholder="150000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div id="filter-job-type">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                name="type"
                id="job-type-select"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            
            <div id="filter-submit" className="md:col-span-5">
              <button
                type="submit"
                id="search-jobs-button"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>

        {/* Job Listings */}
        <div id="job-listings">
          {loading ? (
            <div id="loading-section" className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div id="no-jobs-section" className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600">No jobs found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div id="jobs-grid" className="grid gap-6">
              {jobs.map((job: any) => (
                <div key={job.id} id={`job-card-${job.id}`} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div id={`job-header-${job.id}`}>
                      <h3 id={`job-title-${job.id}`} className="text-xl font-semibold text-gray-900">
                        <Link href={`/jobs/${job.id}`} className="hover:text-indigo-600">
                          {job.title}
                        </Link>
                      </h3>
                      <p id={`job-company-${job.id}`} className="text-gray-600">
                        <Link href={`/companies/${job.companies?.id}`} className="hover:text-indigo-600">
                          {job.companies?.name}
                        </Link>
                        {' • '}{job.location}
                      </p>
                    </div>
                    <div id={`job-salary-${job.id}`} className="text-right">
                      {job.salaryMin && job.salaryMax && (
                        <p className="text-green-600 font-semibold">
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{job.employmentType?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <p id={`job-description-${job.id}`} className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div id={`job-tags-${job.id}`} className="flex flex-wrap gap-2">
                      {job.tags?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div id={`job-stats-${job.id}`} className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👁 {job.viewCount || 0} views</span>
                      <span>📝 {job.applicationCount || 0} applications</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span id={`job-date-${job.id}`} className="text-sm text-gray-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      id={`job-apply-${job.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Call to Action for Guests */}
        {jobs.length > 0 && (
          <div id="guest-cta" className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 id="cta-title" className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Apply?
            </h2>
            <p id="cta-description" className="text-gray-600 mb-6">
              Create a free account to apply for jobs and track your applications
            </p>
            <Link
              href="/register"
              id="cta-button"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 inline-block"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}