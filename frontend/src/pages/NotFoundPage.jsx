import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-primary-500 mb-4" />
    <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
    <p className="text-gray-400 mb-6">Sorry, the page you are looking for does not exist.</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage;
