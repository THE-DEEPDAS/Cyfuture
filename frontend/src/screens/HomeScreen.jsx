import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.userLogin);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Match Your Resume to the Perfect Job
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-in">
            Our AI-powered platform analyzes your resume and matches you with the most suitable job opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
            {userInfo ? (
              userInfo.isAdmin ? (
                <Link to="/admin/jobs/create" className="btn btn-secondary text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="plus" className="mr-2" />
                  Post a Job
                </Link>
              ) : (
                <Link to="/upload-resume" className="btn btn-secondary text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="upload" className="mr-2" />
                  Upload Resume
                </Link>
              )
            ) : (
              <>
                <Link to="/register" className="btn btn-secondary text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="user-plus" className="mr-2" />
                  Sign Up
                </Link>
                <Link to="/register-company" className="btn btn-accent text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="building" className="mr-2" />
                  Register Company
                </Link>
              </>
            )}
            <Link to="/jobs" className="btn btn-ghost bg-white text-blue-600 text-lg px-8 py-3 rounded-full">
              <FontAwesomeIcon icon="search" className="mr-2" />
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:transform hover:scale-105">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FontAwesomeIcon icon="upload" size="2x" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Upload Your Resume</h3>
              <p className="text-gray-600 text-center">
                Upload your resume and our AI will extract your skills, experience, and education to create your profile.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:transform hover:scale-105">
              <div className="bg-teal-100 text-teal-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FontAwesomeIcon icon="percentage" size="2x" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Smart Matching</h3>
              <p className="text-gray-600 text-center">
                Our sophisticated algorithm matches your profile with job requirements to find the perfect fit.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:transform hover:scale-105">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FontAwesomeIcon icon="comment" size="2x" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Interactive Chatbot</h3>
              <p className="text-gray-600 text-center">
                Answer a few job-specific questions through our multi-lingual chatbot to enhance your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ResuMatch</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Match Accuracy</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Job Seekers</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Companies</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
              <p className="text-gray-600">Languages Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who found their ideal positions through our intelligent matching platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {userInfo ? (
              userInfo.isAdmin ? (
                <Link to="/admin/jobs/create" className="btn bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="plus" className="mr-2" />
                  Post a Job
                </Link>
              ) : (
                <Link to="/upload-resume" className="btn bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full">
                  <FontAwesomeIcon icon="upload" className="mr-2" />
                  Upload Resume
                </Link>
              )
            ) : (
              <Link to="/register" className="btn bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full">
                <FontAwesomeIcon icon="user-plus" className="mr-2" />
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;