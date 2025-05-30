import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faBuilding, faBriefcase, faDollarSign, faBookmark, faEye } from '@fortawesome/free-solid-svg-icons';
import { formatSalary, daysAgo } from '../../utils/config';

const JobCard = ({ job }) => {
  const { userInfo, isAuthenticated, savedJobs } = useSelector((state) => state.auth);
  
  // Check if job is saved by user
  const isSaved = savedJobs && savedJobs.some((savedJob) => savedJob._id === job._id);
  
  return (
    <div className="card hover-card transition-all duration-300">
      <div className="card-header flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-dark-700 rounded-md flex items-center justify-center text-primary-500">
            <FontAwesomeIcon icon={faBriefcase} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              <Link 
                to={`/jobs/${job._id}`} 
                className="hover:text-primary-400 transition-colors"
              >
                {job.title}
              </Link>
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <FontAwesomeIcon icon={faBuilding} className="mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
        </div>
        
        {isAuthenticated && userInfo.role === 'candidate' && (
          <div className="text-gray-400 hover:text-primary-400 cursor-pointer transition-colors">
            <FontAwesomeIcon icon={faBookmark} className={isSaved ? 'text-primary-500' : ''} />
          </div>
        )}
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-400">
            <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
            <span>{job.type}</span>
          </div>
          
          {job.salary && job.salary.isPublic && (
            <div className="flex items-center text-sm text-gray-400">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
              <span>{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-400">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            <span>{daysAgo(job.createdAt)}</span>
          </div>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="badge-dark text-xs px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="badge-dark text-xs px-2 py-1 rounded-full">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="card-footer flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-400">
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          <span>{job.viewCount}</span>
          <span className="mx-2">•</span>
          <span>{job.applicationCount} applications</span>
        </div>
        
        <Link 
          to={`/jobs/${job._id}`}
          className="btn-primary text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;