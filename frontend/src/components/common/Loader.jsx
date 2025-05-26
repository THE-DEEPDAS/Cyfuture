import React from 'react';

const Loader = ({ size = 'default' }) => {
  let sizeClass;
  
  switch (size) {
    case 'sm':
      sizeClass = 'w-6 h-6 border-2';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12 border-4';
      break;
    case 'default':
    default:
      sizeClass = 'w-8 h-8 border-3';
      break;
  }
  
  return (
    <div className="flex justify-center py-4">
      <div className={`${sizeClass} border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loader;