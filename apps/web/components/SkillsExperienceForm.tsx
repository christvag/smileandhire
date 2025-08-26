'use client';

import React, { useState, useEffect } from 'react';

// Skills categories from Job Plan document
const skillsCategories = {
  "Business & Management": [
    "Project Management",
    "Business Development", 
    "Operations Management",
    "Product Management",
    "Human Resources (HR)",
    "Administrative Support",
    "Virtual Assistance"
  ],
  "Sales & Marketing": [
    "Digital Marketing",
    "Social Media Management",
    "SEO / SEM",
    "Content Marketing",
    "Copywriting",
    "Sales Development (SDR / Lead Generation)",
    "Email Marketing",
    "Affiliate Marketing",
    "Paid Ads Management (Facebook Ads, Google Ads, LinkedIn Ads)"
  ],
  "Creative & Design": [
    "Graphic Design",
    "UI/UX Design",
    "Web Design",
    "Branding & Identity Design",
    "Motion Graphics",
    "Video Editing",
    "Animation",
    "Illustration"
  ],
  "Technology & Development": [
    "Software Development (Front-End, Back-End, Full-Stack)",
    "Web Development (WordPress, Shopify, Wix, Webflow)",
    "Mobile App Development (iOS, Android, Flutter, React Native)",
    "QA Testing",
    "DevOps & Cloud Engineering",
    "Data Science & Analytics",
    "Cybersecurity"
  ],
  "Content & Writing": [
    "Content Writing",
    "Blogging",
    "Technical Writing",
    "Ghostwriting",
    "Scriptwriting",
    "Editing & Proofreading",
    "Resume & Cover Letter Writing"
  ],
  "Customer Support": [
    "Customer Service Representative (CSR)",
    "Technical Support",
    "Chat/Email Support",
    "Client Success Management"
  ],
  "Finance & Accounting": [
    "Accounting",
    "Bookkeeping",
    "Financial Analysis",
    "Payroll Management",
    "Tax Preparation"
  ],
  "Data & Research": [
    "Data Entry",
    "Web Research",
    "Market Research",
    "Lead Generation Research",
    "Data Analysis (Excel, SQL, Power BI, Tableau)"
  ],
  "E-commerce & Online Business": [
    "Amazon FBA Management",
    "Shopify Store Management",
    "eBay / Etsy Store Support",
    "Product Sourcing & Dropshipping",
    "Inventory Management",
    "Order Fulfillment & VA Support"
  ],
  "Education & Training": [
    "Online Tutoring",
    "Course Creation",
    "Instructional Design",
    "eLearning Development",
    "Corporate Training"
  ],
  "Healthcare & Wellness": [
    "Medical Transcription",
    "Telehealth Assistance",
    "Nursing Support",
    "Medical Billing & Coding",
    "Virtual Therapy / Coaching"
  ],
  "Specialized / Emerging Niches": [
    "AI & Machine Learning (Prompt Engineering, AI Model Training)",
    "Blockchain / Crypto Development",
    "AR/VR Design",
    "Podcast Editing & Management",
    "Influencer / Community Management"
  ]
};

// Flatten all skills into a single array for search
const allSkills = Object.values(skillsCategories).flat().sort();
allSkills.push("Others"); // Add "Others" at the end


interface WorkExperience {
  id: string;
  companyName: string;
  yearOfService: string;
  position: string;
  contactReference?: {
    name: string;
    phoneNumber: string;
  };
}

interface SkillSet {
  id: string;
  profession: string;
  description: string;
  workExperiences: WorkExperience[];
}

interface SkillsExperienceFormProps {
  profile: any;
  onUpdate: (skillSets: SkillSet[]) => void;
}

export default function SkillsExperienceForm({ profile, onUpdate }: SkillsExperienceFormProps) {
  const [skillSets, setSkillSets] = useState<SkillSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSkillSets, setExpandedSkillSets] = useState<Set<string>>(new Set());

  // Initialize from profile data
  useEffect(() => {
    if (profile?.skillSets && Array.isArray(profile.skillSets)) {
      setSkillSets(profile.skillSets);
    }
  }, [profile]);

  // Add new skill set
  const addSkillSet = () => {
    const newSkillSet: SkillSet = {
      id: `skillset-${Date.now()}`,
      profession: '',
      description: '',
      workExperiences: []
    };
    setSkillSets([...skillSets, newSkillSet]);
    // Auto-expand new skill sets for editing
    setExpandedSkillSets(prev => new Set([...prev, newSkillSet.id]));
  };

  // Toggle accordion expansion
  const toggleSkillSetExpansion = (skillSetId: string) => {
    setExpandedSkillSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillSetId)) {
        newSet.delete(skillSetId);
      } else {
        newSet.add(skillSetId);
      }
      return newSet;
    });
  };

  // Get summary info for accordion header
  const getSkillSetSummary = (skillSet: SkillSet) => {
    const companies = skillSet.workExperiences.map(exp => exp.companyName).filter(Boolean);
    const years = skillSet.workExperiences.map(exp => exp.yearOfService).filter(Boolean);
    
    return {
      profession: skillSet.profession || 'No profession selected',
      companies: companies.length > 0 ? companies.slice(0, 2).join(', ') + (companies.length > 2 ? '...' : '') : 'No companies',
      years: years.length > 0 ? years.slice(0, 2).join(', ') + (years.length > 2 ? '...' : '') : 'No years'
    };
  };

  // Remove skill set
  const removeSkillSet = (skillSetId: string) => {
    setSkillSets(skillSets.filter(set => set.id !== skillSetId));
  };

  // Update skill set
  const updateSkillSet = (skillSetId: string, updates: Partial<SkillSet>) => {
    setSkillSets(skillSets.map(set => 
      set.id === skillSetId ? { ...set, ...updates } : set
    ));
  };


  // Add work experience to skill set
  const addWorkExperience = (skillSetId: string) => {
    const newExperience: WorkExperience = {
      id: `exp-${Date.now()}`,
      companyName: '',
      yearOfService: '',
      position: ''
    };
    
    setSkillSets(skillSets.map(set => 
      set.id === skillSetId 
        ? { ...set, workExperiences: [...set.workExperiences, newExperience] }
        : set
    ));
  };

  // Remove work experience
  const removeWorkExperience = (skillSetId: string, experienceId: string) => {
    setSkillSets(skillSets.map(set => 
      set.id === skillSetId 
        ? { ...set, workExperiences: set.workExperiences.filter(exp => exp.id !== experienceId) }
        : set
    ));
  };

  // Update work experience
  const updateWorkExperience = (skillSetId: string, experienceId: string, updates: Partial<WorkExperience>) => {
    setSkillSets(skillSets.map(set => 
      set.id === skillSetId 
        ? {
            ...set, 
            workExperiences: set.workExperiences.map(exp => 
              exp.id === experienceId ? { ...exp, ...updates } : exp
            )
          }
        : set
    ));
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(skillSets);
      alert('Skills & Experience updated successfully!');
    } catch (error) {
      alert('Failed to update skills & experience');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="skills-experience-form" className="bg-white rounded-lg shadow p-6">
      <div id="skills-header" className="flex justify-between items-center mb-6">
        <h2 id="skills-title" className="text-2xl font-bold text-gray-900">Skills & Experience</h2>
        <button
          id="btn-add-skillset"
          onClick={addSkillSet}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Skill Set
        </button>
      </div>

      {skillSets.length === 0 && (
        <div id="empty-skillsets" className="text-center py-8 text-gray-500">
          <p className="mb-4">No skill sets added yet.</p>
          <button
            id="btn-add-first-skillset"
            onClick={addSkillSet}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Your First Skill Set
          </button>
        </div>
      )}

      <div id="skillsets-container" className="space-y-4">
        {skillSets.map((skillSet, skillSetIndex) => {
          const isExpanded = expandedSkillSets.has(skillSet.id);
          const summary = getSkillSetSummary(skillSet);
          
          return (
            <div key={skillSet.id} id={`skillset-${skillSetIndex}`} className="border rounded-lg bg-white shadow-sm">
              {/* Accordion Header */}
              <div id={`skillset-header-${skillSetIndex}`} className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    id={`btn-toggle-skillset-${skillSetIndex}`}
                    onClick={() => toggleSkillSetExpansion(skillSet.id)}
                    className="flex-1 text-left flex items-center space-x-3 focus:outline-none"
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {summary.profession}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Companies:</span> {summary.companies}</p>
                        <p><span className="font-medium">Years:</span> {summary.years}</p>
                      </div>
                    </div>
                  </button>
                  <button
                    id={`btn-remove-skillset-${skillSetIndex}`}
                    onClick={() => removeSkillSet(skillSet.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div id={`skillset-content-${skillSetIndex}`} className="p-6 bg-white">
                  {/* Profession Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession *
                    </label>
                    <select
                      value={skillSet.profession}
                      onChange={(e) => updateSkillSet(skillSet.id, { profession: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a profession...</option>
                      {Object.entries(skillsCategories).map(([category, skills]) => (
                        <optgroup key={category} label={`💼 ${category}`}>
                          {skills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Custom Profession Input (if Others selected) */}
                  {skillSet.profession === 'Others' && (
                    <div className="mb-4">
                      <label id={`label-custom-profession-${skillSetIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Profession *
                      </label>
                      <input
                        id={`input-custom-profession-${skillSetIndex}`}
                        type="text"
                        placeholder="Enter your profession"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => updateSkillSet(skillSet.id, { profession: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <label id={`label-description-${skillSetIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Describe this profession - where are you good at? *
                    </label>
                    <textarea
                      id={`textarea-description-${skillSetIndex}`}
                      value={skillSet.description}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 200); // Cap at 200 characters
                        updateSkillSet(skillSet.id, { description: value });
                      }}
                      placeholder="Describe your expertise in this profession..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
                      maxLength={200}
                      required
                    />
                    <p id={`char-count-${skillSetIndex}`} className="text-xs text-gray-500 mt-1">
                      {skillSet.description.length}/200 characters
                    </p>
                  </div>

                  {/* Work Experiences */}
                  <div id={`work-experiences-${skillSetIndex}`} className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 id={`work-exp-title-${skillSetIndex}`} className="text-md font-medium text-gray-800">Work Experience</h4>
                      <button
                        id={`btn-add-experience-${skillSetIndex}`}
                        onClick={() => addWorkExperience(skillSet.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Add Experience
                      </button>
                    </div>

                    {skillSet.workExperiences.length === 0 && (
                      <p className="text-gray-500 text-sm mb-2">No work experience added for this skill set.</p>
                    )}

                    <div className="space-y-4">
                      {skillSet.workExperiences.map((experience, expIndex) => (
                        <div key={experience.id} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium text-gray-800">Experience #{expIndex + 1}</h5>
                            <button
                              onClick={() => removeWorkExperience(skillSet.id, experience.id)}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Company Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name *
                              </label>
                              <input
                                type="text"
                                value={experience.companyName}
                                onChange={(e) => updateWorkExperience(skillSet.id, experience.id, { companyName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>

                            {/* Year of Service */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year of Service *
                              </label>
                              <input
                                type="text"
                                value={experience.yearOfService}
                                onChange={(e) => updateWorkExperience(skillSet.id, experience.id, { yearOfService: e.target.value })}
                                placeholder="e.g., 2020-2023, 2021-Present"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>

                            {/* Position */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Position *
                              </label>
                              <input
                                type="text"
                                value={experience.position}
                                onChange={(e) => updateWorkExperience(skillSet.id, experience.id, { position: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>

                            {/* Contact Reference (Optional) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Name (Optional)
                              </label>
                              <input
                                type="text"
                                value={experience.contactReference?.name || ''}
                                onChange={(e) => updateWorkExperience(skillSet.id, experience.id, { 
                                  contactReference: { 
                                    ...experience.contactReference,
                                    name: e.target.value,
                                    phoneNumber: experience.contactReference?.phoneNumber || ''
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Phone (Optional)
                              </label>
                              <input
                                type="tel"
                                value={experience.contactReference?.phoneNumber || ''}
                                onChange={(e) => updateWorkExperience(skillSet.id, experience.id, { 
                                  contactReference: { 
                                    name: experience.contactReference?.name || '',
                                    phoneNumber: e.target.value
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {skillSets.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Saving...
              </>
            ) : (
              'Save Skills & Experience'
            )}
          </button>
        </div>
      )}
    </div>
  );
}