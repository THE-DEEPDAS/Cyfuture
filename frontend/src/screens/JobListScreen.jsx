import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { listJobs } from '../actions/jobActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../config';

const JobListScreen = () => {
  const dispatch = useDispatch();
  
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const jobList = useSelector((state) => state.jobList);
  const { loading, error, jobs, pages, page } = jobList;
  
  useEffect(() => {
    dispatch(listJobs({ 
      keyword, 
      location, 
      jobType, 
      experienceLevel, 
      page: currentPage 
    }));
  }, [dispatch, keyword, location, jobType, experienceLevel, currentPage]);
  
  const searchHandler = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(listJobs({ 
      keyword, 
      location, 
      jobType, 
      experienceLevel, 
      page: 1 
    }));
  };
  
  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
    setExperienceLevel('');
    setCurrentPage(1);
    dispatch(listJobs({}));
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
      
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={searchHandler}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="keyword" className="block text-gray-700 mb-1">
                <FontAwesomeIcon icon="search" className="mr-2" />
                Search
              </label>
              <input
                type="text"
                id="keyword"
                className="input"
                placeholder="Job title or keywords"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-gray-700 mb-1">
                <FontAwesomeIcon icon="map-marker-alt" className="mr-2" />
                Location
              </label>
              <input
                type="text"
                id="location"
                className="input"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-1 flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-grow"
              >
                <FontAwesomeIcon icon="search" className="mr-2" />
                Search
              </button>
              
              <button
                type="button"
                className="btn btn-ghost border border-gray-300"
                onClick={toggleFilters}
              >
                <FontAwesomeIcon icon="filter" />
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="jobType" className="block text-gray-700 mb-1">
                  <FontAwesomeIcon icon="briefcase" className="mr-2" />
                  Job Type
                </label>
                <select
                  id="jobType"
                  className="input"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">All Job Types</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="experienceLevel" className="block text-gray-700 mb-1">
                  <FontAwesomeIcon icon="user-tie" className="mr-2" />
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  className="input"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="">All Experience Levels</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost border border-gray-300 w-full"
                >
                  <FontAwesomeIcon icon="times" className="mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Job Listings */}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <>
          {jobs.length === 0 ? (
            <Message variant="info">
              No jobs found. Try adjusting your search criteria.
            </Message>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:transform hover:scale-101 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="mb-3 md:mb-0">
                        <h2 className="text-xl font-bold text-gray-900">
                          <Link to={`/jobs/${job._id}`} className="hover:text-blue-600 transition-colors">
                            {job.title}
                          </Link>
                        </h2>
                        <p className="text-gray-600">
                          {job.admin && job.admin.companyName}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-primary">
                          <FontAwesomeIcon icon="briefcase" className="mr-1" />
                          {job.jobType}
                        </span>
                        <span className="badge badge-secondary">
                          <FontAwesomeIcon icon="user-tie" className="mr-1" />
                          {job.experienceLevel}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 text-gray-600 mb-4">
                      <div className="w-full sm:w-1/2">
                        <FontAwesomeIcon icon="map-marker-alt" className="mr-2 text-gray-500" />
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="w-full sm:w-1/2">
                          <FontAwesomeIcon icon="money-bill-wave" className="mr-2 text-gray-500" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requiredSkills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="badge badge-accent">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="badge badge-accent">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        <FontAwesomeIcon icon="calendar-alt" className="mr-1" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="btn btn-primary px-4 py-2"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-8">
              <ul className="flex items-center">
                <li>
                  <button
                    className={`px-3 py-1 rounded-l-md border ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setCurrentPage(page - 1)}
                    disabled={page === 1}
                  >
                    <FontAwesomeIcon icon="arrow-left" />
                  </button>
                </li>
                {[...Array(pages).keys()].map((x) => (
                  <li key={x + 1}>
                    <button
                      className={`px-3 py-1 border-t border-b ${
                        x + 1 === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setCurrentPage(x + 1)}
                    >
                      {x + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className={`px-3 py-1 rounded-r-md border ${
                      page === pages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setCurrentPage(page + 1)}
                    disabled={page === pages}
                  >
                    <FontAwesomeIcon icon="arrow-right" />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobListScreen;