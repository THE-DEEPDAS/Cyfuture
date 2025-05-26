import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faCompass } from '@fortawesome/free-solid-svg-icons';

const NotFoundScreen = () => {
  return (
    <div className="min-h-[70vh] flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="relative mb-8 mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">404</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Page Not Found</h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn btn-primary px-6 py-3 flex items-center justify-center">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Back to Homepage
            </Link>
            
            <button onClick={() => window.history.back()} className="btn btn-secondary px-6 py-3 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Go Back
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Looking for something else?</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/jobs" className="text-primary-600 hover:text-primary-800 font-medium">
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                Browse Jobs
              </Link>
              <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
                Create Account
              </Link>
              <Link to="/contact" className="text-primary-600 hover:text-primary-800 font-medium">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;