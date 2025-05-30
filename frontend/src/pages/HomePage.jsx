import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faBriefcase, faGraduationCap, faCheckCircle, faRocket } from '@fortawesome/free-solid-svg-icons';
import { getTopJobs } from '../redux/actions/jobActions';
import JobCard from '../components/job/JobCard';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  
  const { loading, jobs, error } = useSelector((state) => state.topJobs);
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getTopJobs());
  }, [dispatch]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${keyword}&location=${location}`);
  };
  
  // Animated gradient for hero section
  const heroStyle = {
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15), rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0))',
    backgroundSize: '200% 200%',
    animation: 'gradientAnimation 15s ease infinite',
  };
  
  return (
    <div className="space-y-16 pt-4">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-2xl bg-dark-800 border border-dark-700" style={heroStyle}>
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-500 text-transparent bg-clip-text">
              Your Career Journey Starts Here
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Find your perfect job match with our AI-powered platform. Upload your resume and let our intelligent matching system connect you with opportunities that align with your skills and experience.
            </p>
            
            {/* Search form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Job title, keywords, or company"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="btn-primary md:w-auto">
                  Search Jobs
                </button>
              </div>
            </form>
            
            {!isAuthenticated && (
              <div className="mt-8">
                <Link to="/register" className="btn-accent mr-4">
                  Create Account
                </Link>
                <Link to="/login" className="btn-outline">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-600 rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </section>
      
      {/* Features section */}
      <section className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-900 text-primary-400 mb-6">
              <FontAwesomeIcon icon={faRocket} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
            <p className="text-gray-400">
              Our intelligent algorithm analyzes your resume and matches you with jobs that align with your skills and experience.
            </p>
          </div>
          
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary-900 text-secondary-400 mb-6">
              <FontAwesomeIcon icon={faBriefcase} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Expert Resume Parsing</h3>
            <p className="text-gray-400">
              Upload your resume in PDF or DOCX format and our system will automatically extract key information to enhance your profile.
            </p>
          </div>
          
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-900 text-accent-400 mb-6">
              <FontAwesomeIcon icon={faGraduationCap} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Skill Analysis</h3>
            <p className="text-gray-400">
              Get insights about your skills and recommendations on how to improve your profile to match more job opportunities.
            </p>
          </div>
          
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900 text-blue-400 mb-6">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Application Tracking</h3>
            <p className="text-gray-400">
              Keep track of all your job applications in one place, from submission to interview and beyond.
            </p>
          </div>
          
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-900 text-purple-400 mb-6">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Geo-Targeted Searches</h3>
            <p className="text-gray-400">
              Find jobs in your area or explore opportunities in different locations with our advanced search filters.
            </p>
          </div>
          
          <div className="card p-6 hover-card">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-900 text-green-400 mb-6">
              <FontAwesomeIcon icon={faSearch} className="text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
            <p className="text-gray-400">
              Receive personalized job recommendations based on your profile, search history, and application patterns.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured jobs section */}
      <section className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Jobs</h2>
          <Link to="/jobs" className="text-primary-400 hover:text-primary-300 transition-colors">
            View all jobs
          </Link>
        </div>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="alert-danger">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>
      
      {/* CTA section */}
      <section className="bg-gradient-to-r from-primary-800 to-secondary-800 rounded-2xl overflow-hidden">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Dream Job?</h2>
            <p className="text-lg mb-8 text-gray-200">
              Join thousands of job seekers who have found their perfect match using TalentMatch.
            </p>
            
            {isAuthenticated ? (
              <Link to="/jobs" className="btn-primary text-lg px-8 py-3">
                Browse Jobs Now
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;