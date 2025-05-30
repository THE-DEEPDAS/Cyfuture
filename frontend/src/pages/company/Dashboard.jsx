import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../context/AuthContext.jsx';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulated data loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated stats
        setStats({
          activeJobs: 5,
          totalApplications: 87,
          shortlisted: 24,
          hired: 3
        });
        
        // Simulated recent applications
        setRecentApplications([
          {
            _id: '1',
            candidate: {
              _id: '101',
              name: 'John Smith'
            },
            job: {
              _id: '201',
              title: 'Frontend Developer'
            },
            matchScore: 92,
            status: 'shortlisted',
            createdAt: '2025-03-15T10:00:00Z'
          },
          {
            _id: '2',
            candidate: {
              _id: '102',
              name: 'Sarah Johnson'
            },
            job: {
              _id: '201',
              title: 'Frontend Developer'
            },
            matchScore: 88,
            status: 'reviewing',
            createdAt: '2025-03-14T14:30:00Z'
          },
          {
            _id: '3',
            candidate: {
              _id: '103',
              name: 'Michael Brown'
            },
            job: {
              _id: '202',
              title: 'Backend Developer'
            },
            matchScore: 95,
            status: 'shortlisted',
            createdAt: '2025-03-14T09:15:00Z'
          },
          {
            _id: '4',
            candidate: {
              _id: '104',
              name: 'Emily Chen'
            },
            job: {
              _id: '203',
              title: 'Full Stack Developer'
            },
            matchScore: 86,
            status: 'pending',
            createdAt: '2025-03-13T16:45:00Z'
          },
          {
            _id: '5',
            candidate: {
              _id: '105',
              name: 'David Wilson'
            },
            job: {
              _id: '202',
              title: 'Backend Developer'
            },
            matchScore: 79,
            status: 'pending',
            createdAt: '2025-03-12T11:30:00Z'
          }
        ]);
        
        // Simulated job postings
        setJobPostings([
          {
            _id: '201',
            title: 'Frontend Developer',
            location: 'New York, NY',
            type: 'Full-time',
            applicants: 32,
            createdAt: '2025-03-10T08:00:00Z',
            expiresAt: '2025-04-10T23:59:59Z'
          },
          {
            _id: '202',
            title: 'Backend Developer',
            location: 'Remote',
            type: 'Full-time',
            applicants: 28,
            createdAt: '2025-03-08T10:30:00Z',
            expiresAt: '2025-04-08T23:59:59Z'
          },
          {
            _id: '203',
            title: 'Full Stack Developer',
            location: 'San Francisco, CA',
            type: 'Full-time',
            applicants: 18,
            createdAt: '2025-03-05T14:15:00Z',
            expiresAt: '2025-04-05T23:59:59Z'
          },
          {
            _id: '204',
            title: 'UX Designer',
            location: 'Chicago, IL',
            type: 'Contract',
            applicants: 9,
            createdAt: '2025-03-01T09:45:00Z',
            expiresAt: '2025-04-01T23:59:59Z'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
  
  // Get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-warning-100 text-warning-800`;
      case 'reviewing':
        return `${baseClasses} bg-primary-100 text-primary-800`;
      case 'shortlisted':
        return `${baseClasses} bg-success-100 text-success-800`;
      case 'rejected':
        return `${baseClasses} bg-error-100 text-error-800`;
      case 'hired':
        return `${baseClasses} bg-accent-100 text-accent-800`;
      default:
        return baseClasses;
    }
  };
  
  // Get match score styling
  const getMatchScoreBadge = (score) => {
    const baseClasses = "text-sm font-medium";
    
    if (score >= 90) {
      return `${baseClasses} text-success-500`;
    } else if (score >= 75) {
      return `${baseClasses} text-primary-500`;
    } else if (score >= 60) {
      return `${baseClasses} text-warning-500`;
    } else {
      return `${baseClasses} text-error-500`;
    }
  };
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FontAwesomeIcon icon="circle-notch" spin className="text-4xl text-primary-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {user?.companyName || 'Company'}!
        </h1>
        <p className="text-gray-300">
          Manage your job postings and review candidates from your dashboard.
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-700/30 p-3 mr-4">
              <FontAwesomeIcon icon="briefcase" className="text-primary-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Jobs</p>
              <h3 className="text-2xl font-bold text-white">{stats.activeJobs}</h3>
            </div>
          </div>
        </div>
        
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-accent-700/30 p-3 mr-4">
              <FontAwesomeIcon icon="file-alt" className="text-accent-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Applications</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalApplications}</h3>
            </div>
          </div>
        </div>
        
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-success-700/30 p-3 mr-4">
              <FontAwesomeIcon icon="user-check" className="text-success-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <h3 className="text-2xl font-bold text-white">{stats.shortlisted}</h3>
            </div>
          </div>
        </div>
        
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-700/30 p-3 mr-4">
              <FontAwesomeIcon icon="user-plus" className="text-primary-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hired</p>
              <h3 className="text-2xl font-bold text-white">{stats.hired}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          <Link to="/company/candidates" className="text-primary-400 hover:text-primary-300 text-sm">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-background-secondary">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Job
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Match
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentApplications.map((application) => (
                <tr key={application._id} className="hover:bg-background-light transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{application.candidate.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{application.job.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getMatchScoreBadge(application.matchScore)}>
                      {application.matchScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{formatDate(application.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/company/candidates/${application._id}`} className="text-primary-400 hover:text-primary-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Job postings */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Your Job Postings</h2>
          <Link to="/company/jobs" className="flex items-center text-primary-400 hover:text-primary-300 text-sm">
            <FontAwesomeIcon icon="plus-circle" className="mr-1" />
            Post New Job
          </Link>
        </div>
        
        <div className="space-y-4">
          {jobPostings.map((job) => (
            <div key={job._id} className="bg-background-secondary rounded-lg p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{job.title}</h3>
                  
                  <div className="mt-2 flex items-center text-gray-400 text-sm">
                    <FontAwesomeIcon icon="map-marker-alt" className="mr-1" />
                    {job.location}
                  </div>
                  
                  <div className="mt-1 flex items-center text-gray-400 text-sm">
                    <FontAwesomeIcon icon="briefcase" className="mr-1" />
                    {job.type}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-sm text-white">
                    <FontAwesomeIcon icon="users" className="text-primary-500 mr-2" />
                    <span>{job.applicants} Applicants</span>
                  </div>
                  
                  <div className="mt-1 text-xs text-gray-400">
                    {getDaysRemaining(job.expiresAt)} days remaining
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <Link 
                  to={`/company/jobs/${job._id}`}
                  className="px-3 py-1 rounded-md bg-transparent border border-primary-500 text-primary-400 hover:bg-primary-700/20 text-sm transition-colors"
                >
                  Edit
                </Link>
                <Link 
                  to={`/company/candidates?job=${job._id}`}
                  className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                >
                  View Candidates
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="rounded-full bg-primary-700/30 p-4 mb-4">
            <FontAwesomeIcon icon="plus-circle" className="text-primary-500 text-2xl" />
          </div>
          <h3 className="font-medium text-white mb-2">Post New Job</h3>
          <p className="text-sm text-gray-400">
            Create a new job posting to attract the best talent
          </p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="rounded-full bg-accent-700/30 p-4 mb-4">
            <FontAwesomeIcon icon="search" className="text-accent-500 text-2xl" />
          </div>
          <h3 className="font-medium text-white mb-2">Search Candidates</h3>
          <p className="text-sm text-gray-400">
            Find candidates that match your job requirements
          </p>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="rounded-full bg-success-700/30 p-4 mb-4">
            <FontAwesomeIcon icon="chart-line" className="text-success-500 text-2xl" />
          </div>
          <h3 className="font-medium text-white mb-2">Analytics</h3>
          <p className="text-sm text-gray-400">
            View hiring metrics and optimize your recruitment
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;