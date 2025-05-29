import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
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
  faArrowRight
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
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
        <PageHeader
          title={
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold from-primary-400 to-primary-600 bg-gradient-to-r bg-clip-text text-transparent max-w-4xl mx-auto">
              Your Career Journey <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text">Starts Here</span>
            </div>
          }
          subtitle={
            <div className="text-white/90 text-xl backdrop-blur-sm bg-black/10 inline-block px-6 py-3 rounded-xl shadow-soft max-w-2xl mx-auto">
              Connect with top employers and find your dream job with our AI-powered matching technology
            </div>
          }
          backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          size="large"
          textAlignment="center"
          actions={[
            {
              label: "Get Started",
              link: "/register",
              primary: true,
            icon: faRocket
          },
          {
            label: "Hire Talent",
            link: "/register-company",
            primary: false
          }
        ]}
      />

      {/* Stats Section */}
      <section className="bg-white py-20 shadow-md border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Trusted by Professionals and Companies
            </span>
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Join thousands of job seekers and employers who trust CyFuture for their career and hiring needs
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group hover:transform hover:scale-105 transition-all duration-300 bg-gradient-to-b from-white to-gray-50 p-8 rounded-xl shadow-soft border border-gray-100 hover:shadow-lg animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="bg-primary-50 inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto group-hover:bg-primary-100 transition-colors duration-300 shadow-soft">
                  <FontAwesomeIcon 
                    icon={stat.icon} 
                    className="text-3xl text-primary-600 transform group-hover:scale-110 transition-transform duration-300"
                    beat={index === 0}
                  />
                </div>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  {stat.count}
                </div>
                <div className="text-gray-600 font-medium group-hover:text-primary-600 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <FeatureShowcase
          title="Why Choose CyFuture?"
          subtitle="Our platform offers cutting-edge features designed to make your job search smarter and more efficient"
          features={features}
          columns={3}
          style="default"
          backgroundColor="gray"
        />
      </section>

      {/* Job Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <JobCategoriesSection />
      </section>

      {/* Job Search Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Find Your Perfect Job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Search our extensive database of opportunities tailored to your skills and experience
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fadeIn">
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

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleSearch}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg transition-all flex items-center justify-center transform hover:scale-[1.02] hover:shadow-lg hover:from-primary-500 hover:to-primary-600 active:scale-[0.99] duration-200"
                >
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Search Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Opportunities</h3>
              <p className="text-gray-600 text-lg">Discover top-rated positions from leading companies</p>
            </div>
            <Link 
              to="/jobs" 
              className="group flex items-center px-6 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-all duration-300 shadow-sm hover:shadow"
            >
              View All Jobs 
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
              />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader />
              <p className="mt-4 text-gray-600 animate-pulse">Finding the perfect opportunities...</p>
            </div>
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : !jobs || jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">Check back later for new opportunities or adjust your search criteria.</p>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 font-medium group"
              >
                Get job alerts
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
                />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.slice(0, 6).map((job, index) => (
                <div 
                  key={job._id} 
                  className="transform transition-all duration-300 hover:translate-y-[-5px] animate-fadeInUp"
                  style={{ 
                    animationDelay: `${index * 150}ms` 
                  }}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <CompaniesSection />
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Call to Action Section */}
      <section className="py-20">
        <CtaSection userType="jobseeker" />
      </section>
    </div>
  );
};

export default HomeScreen;