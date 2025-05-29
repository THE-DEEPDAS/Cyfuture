import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faUserTie, 
  faMapMarkerAlt, 
  faMoneyBillWave, 
  faCalendarAlt, 
  faBuilding,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] group h-full">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-3 md:mb-0 flex items-start">
            {job.logo ? (
              <img 
                src={job.logo} 
                alt={`${job.company || 'Company'} logo`} 
                className="w-14 h-14 object-contain rounded-xl border border-gray-100 mr-4 group-hover:shadow-md transition-all duration-300" 
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 rounded-xl flex items-center justify-center mr-4 text-xl font-bold group-hover:shadow-md transition-all duration-300">
                {job.company ? job.company[0] : <FontAwesomeIcon icon={faBuilding} />}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors duration-200">
                  {job.title}
                </Link>
              </h2>
              <p className="text-gray-600 font-medium group-hover:text-primary-600 transition-colors duration-200">
                {job.company || 'Company Name'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm bg-primary-50/80 text-primary-700 font-medium backdrop-blur-sm transition-colors duration-200 group-hover:bg-primary-100">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              {job.jobType || 'Full Time'}
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm bg-secondary-50/80 text-secondary-700 font-medium backdrop-blur-sm transition-colors duration-200 group-hover:bg-secondary-100">
              <FontAwesomeIcon icon={faUserTie} className="mr-2" />
              {job.experienceLevel || 'Entry Level'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 mb-6">
          <div className="flex items-center group/item">
            <div className="w-10 h-10 rounded-xl bg-gray-50/80 backdrop-blur-sm flex items-center justify-center mr-3 group-hover:item:bg-primary-50 transition-colors duration-200">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 group-hover:item:text-primary-500 transition-colors duration-200" />
            </div>
            <span className="group-hover:item:text-primary-600 transition-colors duration-200">{job.location || 'Remote'}</span>
          </div>
          {job.salary && (
            <div className="flex items-center group/item">
              <div className="w-10 h-10 rounded-xl bg-gray-50/80 backdrop-blur-sm flex items-center justify-center mr-3 group-hover:item:bg-primary-50 transition-colors duration-200">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400 group-hover:item:text-primary-500 transition-colors duration-200" />
              </div>
              <span className="group-hover:item:text-primary-600 transition-colors duration-200">{job.salary}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mb-6 line-clamp-3">
          {job.description || 'No description provided'}
        </p>
        
        <div className="flex flex-wrap justify-between items-center border-t border-gray-100 pt-4 mt-2">
          <div className="text-sm text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
          </div>
          
          <Link 
            to={`/jobs/${job._id}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow group/btn"
          >
            View Details
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-200" 
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
