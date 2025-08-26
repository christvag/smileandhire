'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import { API_URL } from '../../../lib/api';

interface ProfileData {
  userId: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  isOpenToWork: boolean;
  preferredJobTypes: string[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  location: string;
  jobHistory: any[];
  skillSets: any[];
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        let userData = null;
        
        // First, try to fetch user by username or ID
        // Check if userId looks like a username (contains non-numeric characters)
        const isUsername = /[a-zA-Z_-]/.test(userId);
        
        if (isUsername) {
          // Try fetching by username first
          const userByUsernameResponse = await fetch(`${API_URL}/api/users/username/${userId}`);
          if (userByUsernameResponse.ok) {
            userData = await userByUsernameResponse.json();
          }
        } else {
          // Try fetching by ID
          const userByIdResponse = await fetch(`${API_URL}/api/users/${userId}`);
          if (userByIdResponse.ok) {
            userData = await userByIdResponse.json();
          }
        }
        
        if (!userData) {
          throw new Error('User not found');
        }
        
        setUser(userData);
        
        // Now fetch profile data using the user's ID
        const profileResponse = await fetch(`${API_URL}/api/profiles/${userData.id}`);
        if (!profileResponse.ok) {
          throw new Error('Profile not found');
        }
        const profileData = await profileResponse.json();
        
        // Parse JSON fields
        if (typeof profileData.skills === 'string') {
          profileData.skills = JSON.parse(profileData.skills || '[]');
        }
        if (typeof profileData.preferredJobTypes === 'string') {
          profileData.preferredJobTypes = JSON.parse(profileData.preferredJobTypes || '[]');
        }
        if (typeof profileData.jobHistory === 'string') {
          profileData.jobHistory = JSON.parse(profileData.jobHistory || '[]');
        }
        if (typeof profileData.skillSets === 'string') {
          profileData.skillSets = JSON.parse(profileData.skillSets || '[]');
        }
        // Ensure skillSets is always an array
        if (!profileData.skillSets) {
          profileData.skillSets = [];
        }
        
        setProfile(profileData);
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Profile not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600">The profile you're looking for doesn't exist or is not available.</p>
          </div>
        </div>
      </div>
    );
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `${API_URL}/uploads/${user.avatar}`;
    }
    return null;
  };

  const formatJobType = (jobType: string) => {
    return jobType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div id="profile-page" className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div id="profile-container" className="container mx-auto px-4 py-8">
        <div id="profile-content" className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div id="profile-header" className="bg-white rounded-lg shadow p-8 mb-6">
            <div id="profile-header-content" className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div id="profile-avatar" className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()!}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-6xl">👤</span>
                )}
              </div>
              
              {/* Basic Info */}
              <div id="profile-basic-info" className="flex-1">
                <h1 id="profile-name" className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                
                {profile.location && (
                  <p id="profile-location" className="text-lg text-gray-600 mb-2">📍 {profile.location}</p>
                )}
                
                {profile.isOpenToWork && (
                  <div id="open-to-work-badge" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Open to Work
                  </div>
                )}
                
                {profile.bio && (
                  <p id="profile-bio" className="text-gray-700 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
            
            {/* Contact Links */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  🌐 Portfolio
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  💼 LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  💻 GitHub
                </a>
              )}
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  📄 Resume
                </a>
              )}
            </div>
          </div>

          {/* Skills & Experience Section */}
          {profile.skillSets && profile.skillSets.length > 0 && (
            <div id="skills-experience-section" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 id="skills-experience-title" className="text-xl font-bold text-gray-900 mb-6">Skills & Experience</h2>
              <div id="skillsets-display" className="space-y-4">
                {profile.skillSets.map((skillSet: any, index: number) => (
                  <div key={index} id={`display-skillset-${index}`} className="border rounded-lg bg-gray-50 p-4">
                    <div id={`skillset-header-display-${index}`} className="border-b pb-3 mb-3">
                      <h3 id={`profession-display-${index}`} className="text-lg font-semibold text-gray-900">{skillSet.profession}</h3>
                      {skillSet.description && (
                        <p id={`description-display-${index}`} className="text-gray-700 mt-1">{skillSet.description}</p>
                      )}
                    </div>
                    
                    {skillSet.workExperiences && skillSet.workExperiences.length > 0 && (
                      <div id={`work-experiences-display-${index}`} className="space-y-3">
                        <h4 id={`work-exp-title-display-${index}`} className="font-medium text-gray-800">Work Experience</h4>
                        {skillSet.workExperiences.map((exp: any, expIndex: number) => (
                          <div key={expIndex} id={`experience-${index}-${expIndex}`} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium text-gray-900">{exp.position}</h5>
                              <span className="text-sm text-gray-500">{exp.yearOfService}</span>
                            </div>
                            <p className="text-indigo-600 font-medium text-sm">{exp.companyName}</p>
                            {exp.contactReference && (exp.contactReference.name || exp.contactReference.phoneNumber) && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">Reference:</span> 
                                {exp.contactReference.name && <span> {exp.contactReference.name}</span>}
                                {exp.contactReference.phoneNumber && <span> • {exp.contactReference.phoneNumber}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="profile-sections-grid" className="grid md:grid-cols-2 gap-6">
            {/* Legacy Skills (if no skillSets) */}
            {(!profile.skillSets || profile.skillSets.length === 0) && profile.skills && profile.skills.length > 0 && (
              <div id="legacy-skills-section" className="bg-white rounded-lg shadow p-6">
                <h2 id="legacy-skills-title" className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <div id="legacy-skills-list" className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Preferences */}
            <div id="job-preferences-section" className="bg-white rounded-lg shadow p-6">
              <h2 id="job-preferences-title" className="text-xl font-bold text-gray-900 mb-4">Job Preferences</h2>
              
              {profile.preferredJobTypes && profile.preferredJobTypes.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Job Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredJobTypes.map((jobType, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {formatJobType(jobType)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(profile.expectedSalaryMin || profile.expectedSalaryMax) && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Salary Expectations</h3>
                  <p className="text-gray-600">
                    ${profile.expectedSalaryMin?.toLocaleString() || '0'} - ${profile.expectedSalaryMax?.toLocaleString() || 'Open'}
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Education */}
          {profile.education && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{profile.education}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}