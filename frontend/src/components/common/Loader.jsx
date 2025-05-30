import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-transparent border-solid border-4 border-primary-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loader;