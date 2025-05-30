import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../context/AuthContext.jsx';

const JobPostings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([
    {
      _id: '201',
      title: 'Frontend Developer',
      description: 'We are looking for a talented Frontend Developer to join our team...',
      requirements: ['3+ years of experience with React', 'Strong JavaScript skills', 'CSS expertise', 'Experience with frontend build tools'],
      location: 'New York, NY',
      type: 'Full-time',
      experience: 'Mid-Level',
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Webpack'],
      salary: {
        min: 90000,
        max: 120000,
        currency: 'USD'
      },
      shortlistCount: 10,
      isActive: true,
      applicants: 32,
      createdAt: '2025-03-10T08:00:00Z',
      expiresAt: '2025-04-10T23:59:59Z'
    },
    {
      _id: '202',
      title: 'Backend Developer',
      description: 'Join our backend team to build scalable and robust APIs...',
      requirements: ['Experience with Node.js', 'Knowledge of database systems', 'Understanding of RESTful APIs', 'Basic DevOps knowledge'],
      location: 'Remote',
      type: 'Full-time',
      experience: 'Mid-Level',
      skills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'Docker'],
      salary: {
        min: 85000,
        max: 115000,
        currency: 'USD'
      },
      shortlistCount: 8,
      isActive: true,
      applicants: 28,
      createdAt: '2025-03-08T10:30:00Z',
      expiresAt: '2025-04-08T23:59:59Z'
    },
    {
      _id: '203',
      title: 'Full Stack Developer',
      description: 'We need a Full Stack Developer who can work on both frontend and backend...',
      requirements: ['Experience with React and Node.js', 'Database design skills', 'API development', 'UI/UX sensibility'],
      location: 'San Francisco, CA',
      type: 'Full-time',
      experience: 'Senior',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux', 'TypeScript'],
      salary: {
        min: 130000,
        max: 160000,
        currency: 'USD'
      },
      shortlistCount: 5,
      isActive: true,
      applicants: 18,
      createdAt: '2025-03-05T14:15:00Z',
      expiresAt: '2025-04-05T23:59:59Z'
    },
    {
      _id: '204',
      title: 'UX Designer',
      description: 'Looking for a talented UX Designer to create beautiful and intuitive interfaces...',
      requirements: ['Portfolio demonstrating UX skills', 'Experience with design tools', 'Understanding of user research', 'Prototyping experience'],
      location: 'Chicago, IL',
      type: 'Contract',
      experience: 'Mid-Level',
      skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'UI Design'],
      salary: {
        min: 70,
        max: 90,
        currency: 'USD',
        // This is an hourly rate for contract
      },
      shortlistCount: 6,
      isActive: true,
      applicants: 9,
      createdAt: '2025-03-01T09:45:00Z',
      expiresAt: '2025-04-01T23:59:59Z'
    }
  ]);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'Full-time',
    experience: 'Mid-Level',
    skills: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    shortlistCount: 10,
    expiresAt: ''
  });
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days remaining until expiry
  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Initialize new job form
  const initNewJobForm = () => {
    // Set expiry date to 30 days from now by default
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Format date for input field (YYYY-MM-DD)
    const formattedDate = expiryDate.toISOString().split('T')[0];
    
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      type: 'Full-time',
      experience: 'Mid-Level',
      skills: '',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      shortlistCount: 10,
      expiresAt: formattedDate
    });
    
    setShowNewJobForm(true);
    setEditingJob(null);
  };
  
  // Initialize edit job form
  const initEditJobForm = (job) => {
    // Format requirements array to string
    const requirementsString = job.requirements.join('\n');
    
    // Format skills array to string
    const skillsString = job.skills.join(', ');
    
    // Format date for input field (YYYY-MM-DD)
    const expiryDate = new Date(job.expiresAt);
    const formattedDate = expiryDate.toISOString().split('T')[0];
    
    setFormData({
      title: job.title,
      description: job.description,
      requirements: requirementsString,
      location: job.location,
      type: job.type,
      experience: job.experience,
      skills: skillsString,
      salaryMin: job.salary.min,
      salaryMax: job.salary.max,
      salaryCurrency: job.salary.currency,
      shortlistCount: job.shortlistCount,
      expiresAt: formattedDate
    });
    
    setShowNewJobForm(true);
    setEditingJob(job);
  };
  
  // Submit job form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert requirements string to array
    const requirementsArray = formData.requirements
      .split('\n')
      .filter(item => item.trim() !== '');
    
    // Convert skills string to array
    const skillsArray = formData.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    
    const jobData = {
      title: formData.title,
      description: formData.description,
      requirements: requirementsArray,
      location: formData.location,
      type: formData.type,
      experience: formData.experience,
      skills: skillsArray,
      salary: {
        min: Number(formData.salaryMin),
        max: Number(formData.salaryMax),
        currency: formData.salaryCurrency
      },
      shortlistCount: Number(formData.shortlistCount),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      isActive: true
    };
    
    if (editingJob) {
      // Update existing job
      const updatedJobs = jobs.map(job => 
        job._id === editingJob._id 
          ? { ...job, ...jobData, updatedAt: new Date().toISOString() } 
          : job
      );
      setJobs(updatedJobs);
    } else {
      // Create new job
      const newJob = {
        _id: Date.now().toString(),
        ...jobData,
        applicants: 0,
        createdAt: new Date().toISOString()
      };
      setJobs([newJob, ...jobs]);
    }
    
    // Reset form
    setShowNewJobForm(false);
    setEditingJob(null);
  };
  
  // Toggle job active status
  const toggleJobStatus = (jobId) => {
    const updatedJobs = jobs.map(job => 
      job._id === jobId 
        ? { ...job, isActive: !job.isActive } 
        : job
    );
    setJobs(updatedJobs);
  };
  
  // Delete job
  const deleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      const updatedJobs = jobs.filter(job => job._id !== jobId);
      setJobs(updatedJobs);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white mb-2">
          Job Postings
        </h1>
        <p className="text-gray-300">
          Manage your job listings and view applications
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end">
        <button 
          onClick={initNewJobForm}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors"
        >
          <FontAwesomeIcon icon="plus" className="mr-2" />
          Post New Job
        </button>
      </div>
      
      {/* Job form */}
      {showNewJobForm && (
        <div className="card fade-in">
          <h2 className="text-xl font-semibold text-white mb-6">
            {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="e.g. New York, NY or Remote"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                    Job Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full"
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full"
                    required
                  >
                    <option value="Entry">Entry</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-300 mb-1">
                      Min Salary
                    </label>
                    <input
                      type="number"
                      id="salaryMin"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="e.g. 70000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-300 mb-1">
                      Max Salary
                    </label>
                    <input
                      type="number"
                      id="salaryMax"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="e.g. 90000"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-300 mb-1">
                      Currency
                    </label>
                    <select
                      id="salaryCurrency"
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleChange}
                      className="w-full"
                      required
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="shortlistCount" className="block text-sm font-medium text-gray-300 mb-1">
                      Shortlist Limit
                    </label>
                    <input
                      type="number"
                      id="shortlistCount"
                      name="shortlistCount"
                      value={formData.shortlistCount}
                      onChange={handleChange}
                      className="w-full"
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiresAt"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-1">
                    Required Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="e.g. React, JavaScript, CSS"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Job Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full"
                    placeholder="Describe the job role, responsibilities, and what you're looking for..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="5"
                    className="w-full"
                    placeholder="e.g. 3+ years of React experience"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowNewJobForm(false)}
                className="px-4 py-2 border border-dark-600 rounded-md text-white hover:bg-background-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors"
              >
                {editingJob ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Jobs list */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job._id} className="card hover:shadow-lg transition-all">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  {!job.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-dark-700 text-gray-400 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <FontAwesomeIcon icon="map-marker-alt" className="text-primary-500 mr-2" />
                    {job.location}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <FontAwesomeIcon icon="briefcase" className="text-primary-500 mr-2" />
                    {job.type}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <FontAwesomeIcon icon="user-tie" className="text-primary-500 mr-2" />
                    {job.experience}
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center text-gray-300">
                  <FontAwesomeIcon icon="clock" className="text-primary-500 mr-2" />
                  Posted on {formatDate(job.createdAt)} - Expires in {getDaysRemaining(job.expiresAt)} days
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                <div className="text-white">
                  <span className="font-medium">{job.applicants}</span> applications
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleJobStatus(job._id)}
                    className={`px-3 py-1 rounded-md border transition-colors ${
                      job.isActive
                        ? 'border-warning-500 text-warning-500 hover:bg-warning-900/20'
                        : 'border-success-500 text-success-500 hover:bg-success-900/20'
                    }`}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => initEditJobForm(job)}
                    className="px-3 py-1 rounded-md border border-primary-500 text-primary-400 hover:bg-primary-900/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="px-3 py-1 rounded-md border border-error-500 text-error-500 hover:bg-error-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                
                <a 
                  href={`/company/candidates?job=${job._id}`}
                  className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                >
                  View Candidates
                </a>
              </div>
            </div>
          </div>
        ))}
        
        {jobs.length === 0 && (
          <div className="bg-background-secondary rounded-lg p-8 text-center">
            <FontAwesomeIcon icon="briefcase" className="text-4xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Job Postings Yet</h3>
            <p className="text-gray-400 mb-6">
              Get started by posting your first job to attract candidates.
            </p>
            <button 
              onClick={initNewJobForm}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostings;