import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faUserTie, 
  faMapMarkerAlt, 
  faMoneyBillWave, 
  faCalendarAlt, 
  faBuilding 
} from '@fortawesome/free-solid-svg-icons';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-3 md:mb-0 flex items-start">
            {job.logo ? (
              <img 
                src={job.logo} 
                alt={`${job.company || 'Company'} logo`} 
                className="w-12 h-12 object-contain rounded-lg border border-gray-200 mr-4" 
              />
            ) : (
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center mr-4 text-xl font-bold">
                {job.company ? job.company[0] : <FontAwesomeIcon icon={faBuilding} />}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors">
                  {job.title}
                </Link>
              </h2>
              <p className="text-gray-600 font-medium">
                {job.company || 'Company Name'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 font-medium">
              <FontAwesomeIcon icon={faBriefcase} className="mr-1.5" />
              {job.jobType || 'Full Time'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700 font-medium">
              <FontAwesomeIcon icon={faUserTie} className="mr-1.5" />
              {job.experienceLevel || 'Entry Level'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-y-3 text-gray-600 mb-6">
          <div className="w-full sm:w-1/2 flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
            </div>
            <span>{job.location || 'Remote'}</span>
          </div>
          {job.salary && (
            <div className="w-full sm:w-1/2 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-500" />
              </div>
              <span>{job.salary}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mb-6 line-clamp-3">
          {job.description || 'No description provided'}
        </p>
        
        <div className="flex flex-wrap justify-between items-center border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5" />
            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
          </div>
          
          <Link 
            to={`/jobs/${job._id}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
