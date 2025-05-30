import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-primary">
      <div className="text-primary-500 text-4xl animate-spin">
        <FontAwesomeIcon icon="circle-notch" />
      </div>
      <p className="mt-4 text-xl text-white">Loading...</p>
    </div>
  );
};

export default Loading;