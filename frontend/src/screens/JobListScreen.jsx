import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from '@emotion/styled';
import {
  faSearch,
  faMapMarkerAlt,
  faBriefcase,
  faMoneyBillWave,
  faSlidersH,
  faUserGraduate,
  faUserTie,
  faTimesCircle,
  faCalendarAlt,
  faArrowLeft,
  faArrowRight,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { listJobs } from '../actions/jobActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../config';

const AnimatedJobCard = styled.div`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  animation: fadeInUp 0.5s ease forwards;
  animation-delay: ${props => props.index * 150}ms;
  opacity: 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FilterPanel = styled.div`
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  animation: slideIn 0.3s ease forwards;
`;

const PulseLoader = styled.div`
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const ButtonHover = styled.button`
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

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
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent leading-tight max-w-4xl mx-auto">
            Find Your Perfect Career
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Browse through thousands of opportunities from industry-leading companies. 
            Your next career move is just a click away.
          </p>
        </div>
        
        {/* Search & Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100/50 hover:shadow-lg transition-all duration-300 max-w-5xl mx-auto mb-12">
          <form onSubmit={searchHandler} className="p-8">
            <div className="flex flex-col space-y-6">
              {/* Main Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Keywords Field */}
                <div className="md:col-span-5">
                  <label htmlFor="keyword" className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 text-primary-500 shadow-sm">
                      <FontAwesomeIcon icon={faSearch} className="text-lg" />
                    </div>
                    <span className="text-gray-700 font-medium">Keywords</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="keyword"
                      className="w-full pl-12 pr-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300 shadow-sm"
                      placeholder="Job title, skills, or company name"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" 
                    />
                  </div>
                </div>

                {/* Location Field */}
                <div className="md:col-span-4">
                  <label htmlFor="location" className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 text-primary-500 shadow-sm">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
                    </div>
                    <span className="text-gray-700 font-medium">Location</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="location"
                      className="w-full pl-12 pr-4 h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300 shadow-sm"
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <FontAwesomeIcon 
                      icon={faMapMarkerAlt} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" 
                    />
                  </div>
                </div>

                {/* Search Buttons */}
                <div className="md:col-span-3 flex items-end space-x-3">
                  <button
                    type="submit"
                    className="flex-grow h-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium flex items-center justify-center transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    <span>Search Jobs</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={toggleFilters}
                    className="h-12 w-12 bg-gray-50/80 backdrop-blur-sm hover:bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center transform hover:scale-[1.02] transition-all duration-200 shadow-sm"
                    aria-label="Toggle filters"
                  >
                    <FontAwesomeIcon icon={faSlidersH} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-6 border-t border-gray-200 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Job Type Filter */}
                    <div>
                      <label htmlFor="jobType" className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-primary-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 text-primary-500 shadow-sm">
                          <FontAwesomeIcon icon={faBriefcase} className="text-lg" />
                        </div>
                        <span className="text-gray-700 font-medium">Job Type</span>
                      </label>
                      <select
                        id="jobType"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300 shadow-sm"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                      >
                        <option value="">All Job Types</option>
                        {JOB_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level Filter */}
                    <div>
                      <label htmlFor="experienceLevel" className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-primary-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 text-primary-500 shadow-sm">
                          <FontAwesomeIcon icon={faUserGraduate} className="text-lg" />
                        </div>
                        <span className="text-gray-700 font-medium">Experience Level</span>
                      </label>
                      <select
                        id="experienceLevel"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300 shadow-sm"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                      >
                        <option value="">All Experience Levels</option>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="w-full h-12 text-primary-600 hover:text-primary-700 font-medium rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-primary-50/80 backdrop-blur-sm border border-primary-200 hover:border-primary-300"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                        <span>Clear Filters</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader />
              <div className="mt-4 text-gray-600 text-lg animate-pulse">
                Finding the perfect opportunities...
              </div>
            </div>
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : (
            <>
              {jobs.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-12 text-center max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-primary-50/80 backdrop-blur-sm rounded-xl mx-auto mb-6 flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faBriefcase} className="text-3xl text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-900">No Jobs Found</h3>
                  <p className="text-gray-600 text-lg mb-6">Try adjusting your search criteria or filters to find more opportunities.</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 h-12 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50/80 backdrop-blur-sm transition-all duration-300 font-medium"
                  >
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    Reset Search
                  </button>
                </div>
              ) : (
                <>
                  {/* Job Cards Grid */}
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {jobs.map((job, index) => (
                      <AnimatedJobCard key={job._id} index={index}>
                        {/* JobCard component */}
                      </AnimatedJobCard>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-12 flex justify-center items-center space-x-3">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-primary-600 shadow-sm'
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    
                    {Array.from({ length: pages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`h-12 min-w-[48px] rounded-xl flex items-center justify-center transition-all duration-200 font-medium ${
                          page === i + 1
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-primary-600 shadow-sm'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pages, page + 1))}
                      disabled={page === pages}
                      className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        page === pages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-primary-600 shadow-sm'
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListScreen;
