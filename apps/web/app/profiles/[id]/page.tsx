'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../../../lib/api';

export default function ApplicantProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/${params.id}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
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
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-green-600 rounded-t-lg">
            <div className="absolute -bottom-12 left-8">
              {profile.avatar ? (
                <img src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} 
                     className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>
            {profile.isOpenToWork && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  🟢 Open to Work
                </span>
              </div>
            )}
          </div>

          <div className="px-8 pt-16 pb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              {profile.location && (
                <p className="text-gray-600">📍 {profile.location}</p>
              )}
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </section>
            )}

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Preferred Job Types */}
            {profile.preferredJobTypes && profile.preferredJobTypes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Job Types</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredJobTypes.map((type: string) => (
                    <span key={type} className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Preferred Locations */}
            {profile.preferredLocations && profile.preferredLocations.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Locations</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredLocations.map((location: string) => (
                    <span key={location} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Links Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Links</h2>
              <div className="flex flex-wrap gap-4">
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <span className="mr-2">🌐</span> Portfolio
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <span className="mr-2">💼</span> LinkedIn
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <span className="mr-2">🐙</span> GitHub
                  </a>
                )}
              </div>
            </section>

            {/* Hire Me Button (Guest View) */}
            <div className="mt-8 bg-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Interested in hiring {profile.firstName}?
              </h3>
              <p className="text-gray-600 mb-6">
                Create a company account to connect with this candidate and review their full profile
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register?role=CLIENT"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Register as Company
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