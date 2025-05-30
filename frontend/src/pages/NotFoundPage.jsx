import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center px-4 text-center">
      <div className="text-primary-500 text-7xl mb-8">
        <FontAwesomeIcon icon="map-signs" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-6">Page Not Found</h2>
      
      <p className="text-gray-400 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/" 
          className="px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors flex items-center justify-center"
        >
          <FontAwesomeIcon icon="home" className="mr-2" />
          Go to Home
        </Link>
        
        <Link 
          to="/login" 
          className="px-6 py-3 rounded-lg bg-transparent border border-white hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center"
        >
          <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;