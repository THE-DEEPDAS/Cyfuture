import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';

const Logo = ({ className }) => {
  return (
    <div className={`relative ${className || 'h-10 w-10'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg opacity-80"></div>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <FontAwesomeIcon icon={faBriefcase} />
      </div>
    </div>
  );
};

export default Logo;