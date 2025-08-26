'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import { API_URL } from '../../../lib/api';

interface UserProfile {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  profile?: {
    bio: string;
    location: string;
    skills: string[];
    experience: string;
    education: string;
    portfolioUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    resumeUrl: string;
    isOpenToWork: boolean;
    preferredJobTypes: string[];
    expectedSalaryMin?: number;
    expectedSalaryMax?: number;
    jobHistory?: any[];
  };
  applications?: any[];
}

export default function JobseekerProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profiles/${userId}`);
      
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      
      const profileResponse = await response.json();
      
      // Also get user basic info
      const userResponse = await fetch(`${API_URL}/api/users/${userId}`);
      let userData = null;
      if (userResponse.ok) {
        userData = await userResponse.json();
      }
      
      // Parse JSON fields if they're strings
      if (typeof profileResponse.skills === 'string') {
        profileResponse.skills = JSON.parse(profileResponse.skills || '[]');
      }
      if (typeof profileResponse.preferredJobTypes === 'string') {
        profileResponse.preferredJobTypes = JSON.parse(profileResponse.preferredJobTypes || '[]');
      }
      
      setProfileData({
        user: userData || { id: userId, firstName: 'Unknown', lastName: 'User', email: '' },
        profile: profileResponse
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Profile Not Found</h2>
            <p className="text-red-600">{error || 'This profile does not exist or is not public.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200">
                  <span className="text-2xl font-bold text-indigo-600">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>
              
              {profile?.location && (
                <p className="text-lg text-gray-600 mb-2">📍 {profile.location}</p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                {profile?.isOpenToWork && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    🟢 Open to Work
                  </span>
                )}
                
                {profile?.expectedSalaryMin && profile?.expectedSalaryMax && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    💰 ${profile.expectedSalaryMin.toLocaleString()} - ${profile.expectedSalaryMax.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Contact Links */}
              <div className="flex space-x-4">
                {user.email && (
                  <a href={`mailto:${user.email}`} className="text-indigo-600 hover:text-indigo-500">
                    📧 Email
                  </a>
                )}
                {user.phone && (
                  <a href={`tel:${user.phone}`} className="text-indigo-600 hover:text-indigo-500">
                    📞 Phone
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    🌐 Portfolio
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    💼 LinkedIn
                  </a>
                )}
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    💻 GitHub
                  </a>
                )}
              </div>
            </div>
            
            {/* Resume Download */}
            {profile?.resumeUrl && (
              <div className="flex-shrink-0">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>View Resume</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {profile?.bio && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {/* Experience Section */}
            {profile?.experience && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.experience}</div>
              </div>
            )}

            {/* Education Section */}
            {profile?.education && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.education}</div>
              </div>
            )}

            {/* Job History Section */}
            {profile?.jobHistory && profile.jobHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment History</h2>
                <div className="space-y-4">
                  {profile.jobHistory.map((job: any, index: number) => (
                    <div key={index} className="border-l-4 border-indigo-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-indigo-600">{job.company}</p>
                      <p className="text-sm text-gray-500">
                        {job.startDate} - {job.endDate || 'Present'}
                        {job.location && ` • ${job.location}`}
                      </p>
                      {job.description && (
                        <p className="text-gray-700 mt-2">{job.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Preferences */}
            {profile?.preferredJobTypes && profile.preferredJobTypes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Preferences</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Preferred Job Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredJobTypes.map((type: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                        >
                          {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {(profile.expectedSalaryMin || profile.expectedSalaryMax) && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Salary Expectations</h3>
                      <p className="text-gray-600">
                        {profile.expectedSalaryMin && profile.expectedSalaryMax 
                          ? `$${profile.expectedSalaryMin.toLocaleString()} - $${profile.expectedSalaryMax.toLocaleString()}`
                          : profile.expectedSalaryMin 
                            ? `From $${profile.expectedSalaryMin.toLocaleString()}`
                            : `Up to $${profile.expectedSalaryMax?.toLocaleString()}`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {user.email && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📧</span>
                    <a href={`mailto:${user.email}`} className="text-indigo-600 hover:text-indigo-500">
                      {user.email}
                    </a>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${user.phone}`} className="text-indigo-600 hover:text-indigo-500">
                      {user.phone}
                    </a>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-700">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}