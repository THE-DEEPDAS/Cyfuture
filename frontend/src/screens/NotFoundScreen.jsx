import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NotFoundScreen = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-9xl font-bold text-blue-600 mb-8">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary px-6 py-3">
          <FontAwesomeIcon icon="home" className="mr-2" />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundScreen;