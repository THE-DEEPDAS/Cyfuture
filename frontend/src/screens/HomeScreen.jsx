import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  faSearch,
  faFilter,
  faMapMarkerAlt,
  faBriefcase,
  faDollarSign,
  faUsers,
  faBuilding,
  faChartLine,
  faRocket,
  faGraduationCap,
  faHandshake,
  faCheck,
  faArrowRight,
  faChevronDown,
  faEnvelope,
  faPhone,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { listJobs } from '../actions/jobActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';
import PageHeader from '../components/common/PageHeader';
import { FeatureShowcase } from '../components/common/FeatureShowcase';
import JobCategoriesSection from '../components/home/JobCategoriesSection';
import CompaniesSection from '../components/home/CompaniesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CtaSection from '../components/common/CtaSection';
import JobCard from '../components/job/JobCard';
import SectionContainer from '../components/common/SectionContainer';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    profile: '',
    stipend: '',
  });

  const jobList = useSelector((state) => state.jobList);
  const { loading, error, jobs } = jobList;

  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    dispatch(listJobs());
    
    // Welcome toast notification with improved styling
    toast.info('Welcome to CyFuture! Find your dream job with our AI-powered matching.', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: <FontAwesomeIcon icon={faRocket} className="text-primary-600" />,
      style: { 
        borderLeft: '4px solid #4F46E5', 
        background: 'linear-gradient(to right, #F9FAFB, #F3F4F6)' 
      },
    });
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would filter jobs or trigger a new API call
    const searchTerm = filters.search || 'all jobs';
    const location = filters.location ? ` in ${filters.location}` : '';
    const profile = filters.profile ? ` matching "${filters.profile}" profile` : '';
    const salary = filters.stipend ? ` with salary range ${filters.stipend}` : '';
    
    toast.success(
      <div className="flex items-start">
        <FontAwesomeIcon icon={faSearch} className="text-lg mr-3 mt-1 text-primary-600" />
        <div>
          <p className="font-medium">Searching for jobs</p>
          <p className="text-sm text-gray-600 mt-1">
            {searchTerm}{location}{profile}{salary}
          </p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      }
    );
    // Implementation would go here
  };

  // Stats data (you can replace with real data from backend)
  const stats = [
    { icon: faUsers, count: '10,000+', label: 'Active Candidates' },
    { icon: faBuilding, count: '500+', label: 'Partner Companies' },
    { icon: faBriefcase, count: '1,000+', label: 'Jobs Posted' },
    { icon: faHandshake, count: '5,000+', label: 'Successful Placements' },
  ];

  // Feature data for the showcase section
  const features = [
    {
      icon: faRocket,
      title: "AI-Powered Matching",
      description: "Our advanced AI algorithm ensures perfect matches between candidates and job opportunities, maximizing your chances of finding the right fit.",
      color: "primary"
    },
    {
      icon: faGraduationCap,
      title: "Smart Resume Parsing",
      description: "Automated resume analysis and skill extraction ensures your qualifications are properly recognized and matched to the right opportunities.",
      color: "secondary"
    },
    {
      icon: faChartLine,
      title: "Real-time Analytics",
      description: "Comprehensive insights and tracking for your job applications help you make informed decisions and improve your job search strategy.",
      color: "info"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 overflow-hidden opacity-30"
        >
          <div className="absolute top-1/4 -left-1/4 w-[40rem] h-[40rem] bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-[40rem] h-[40rem] bg-secondary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-primary-900/20 to-gray-900/40"></div>
        </motion.div>
        {/* Content */}
        <div className="w-full flex flex-col items-center justify-center relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent leading-tight">
                Your Career Journey{' '}
                <span className="bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent">Starts Here</span>
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Connect with top employers and find your dream job with our
                <span className="text-primary-400"> AI-powered </span>
                matching technology
              </p>
            </motion.div>
          </motion.div>
          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`w-full max-w-2xl mx-auto transition-all duration-300 transform ${searchFocused ? 'scale-105' : ''}`}
          >
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-400 transition-colors duration-300" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Job title or keyword"
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/30"
                  />
                </div>
                <div className="flex-1 relative group">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-400 transition-colors duration-300" />
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/30"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="md:w-auto w-full px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group shadow-lg shadow-primary-900/20"
                >
                  Search Jobs
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </form>
            </div>
          </motion.div>
          {/* Stats Section - horizontally distributed */}
          <div className="w-full flex justify-center mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group p-8 bg-gradient-to-b from-white/10 to-gray-900/10 rounded-2xl shadow-soft border border-white/10 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="bg-primary-50/20 group-hover:bg-primary-100/30 transition-colors duration-300 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}>
                      <FontAwesomeIcon icon={stat.icon} className="text-3xl text-primary-200" />
                    </motion.div>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary-200 to-primary-400 bg-clip-text text-transparent">
                      {stat.count}
                    </div>
                    <div className="text-gray-200 font-medium group-hover:text-primary-100 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - horizontally distributed */}
      <SectionContainer background="gradient" spacing="default" maxWidth="7xl" hasPattern>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Why Choose CyFuture?</h2>
            <p className="text-xl text-gray-600 leading-relaxed">Our platform offers cutting-edge features designed to make your job search smarter and more efficient</p>
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg transition-all duration-500 border border-gray-100 group flex-1 min-w-[260px] max-w-sm mx-auto"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors duration-300 mx-auto">
                <FontAwesomeIcon icon={feature.icon} className="text-2xl text-primary-600 group-hover:text-primary-700 transition-colors duration-300" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors duration-300 text-center">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>

      {/* Job Categories Section - centered */}
      <SectionContainer background="white" spacing="default" maxWidth="7xl" hasDivider>
        <div className="flex flex-col items-center justify-center">
          <JobCategoriesSection />
        </div>
      </SectionContainer>

      {/* Job Search Section - centered */}
      <SectionContainer background="primary" spacing="default" maxWidth="7xl" hasPattern>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold mb-6 text-white">Find Your Perfect Job</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-gray-200 max-w-3xl mx-auto">Search our extensive database of opportunities tailored to your skills and experience</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="w-full max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Search</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300"
                      placeholder="Job title or keyword"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300"
                      placeholder="City or zip code"
                    />
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Profile</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="profile"
                      value={filters.profile}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300"
                      placeholder="e.g. Software Engineer"
                    />
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="stipend"
                      value={filters.stipend}
                      onChange={handleFilterChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 group-hover:border-primary-300"
                      placeholder="e.g. $50,000-$75,000"
                    />
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              <motion.div 
                className="mt-8 flex justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button 
                  onClick={handleSearch}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg transition-all flex items-center justify-center hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-600/20"
                >
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Search Jobs
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* Featured Jobs Section - grid, centered */}
      <SectionContainer background="gray" spacing="default" maxWidth="7xl" hasPattern>
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Opportunities</h3>
            <p className="text-xl text-gray-600 max-w-2xl">Discover top-rated positions from leading companies</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/jobs" className="group flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-soft hover:shadow-lg border border-gray-100/50">
              View All Jobs
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mb-4"
              >
                <Loader />
              </motion.div>
              <p className="text-lg text-gray-600 animate-pulse">Finding the perfect opportunities...</p>
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full"
            >
              <Message variant="error">{error}</Message>
            </motion.div>
          ) : !jobs || jobs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 p-12 text-center max-w-2xl mx-auto"
            >
              <motion.div 
                className="w-20 h-20 bg-primary-50 rounded-full mx-auto mb-6 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FontAwesomeIcon icon={faBriefcase} className="text-3xl text-primary-600" />
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4">No jobs found</h3>
              <p className="text-gray-600 mb-8 text-lg">Check back later for new opportunities or adjust your search criteria.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 font-medium group shadow-soft hover:shadow-lg"
                >
                  Get job alerts
                  <FontAwesomeIcon 
                    icon={faArrowRight} 
                    className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
                  />
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {jobs.slice(0, 6).map((job, index) => (
                <motion.div 
                  key={job._id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <JobCard 
                    job={{
                      _id: job._id,
                      title: job.title,
                      company: job.admin?.companyName || "Company",
                      location: job.location,
                      salary: job.salary,
                      jobType: job.jobType,
                      experienceLevel: job.experienceLevel,
                      description: job.description,
                      createdAt: job.createdAt,
                      skills: job.requiredSkills || []
                    }}
                  />
                </motion.div>
              ))}
            </>
          )}
        </div>
      </SectionContainer>

      {/* Companies Section - centered logos */}
      <SectionContainer background="white" spacing="default" maxWidth="7xl" hasDivider>
        <div className="flex flex-col items-center justify-center">
          <CompaniesSection />
        </div>
      </SectionContainer>

      {/* Testimonials Section - centered */}
      <SectionContainer background="dark" spacing="default" maxWidth="7xl" hasPattern>
        <div className="flex flex-col items-center justify-center">
          <TestimonialsSection />
        </div>
      </SectionContainer>

      {/* Call to Action Section - centered */}
      <SectionContainer background="primary" spacing="default" maxWidth="7xl" hasPattern>
        <div className="flex flex-col items-center justify-center">
          <CtaSection userType="jobseeker" />
        </div>
      </SectionContainer>
    </div>
  );
};

export default HomeScreen;