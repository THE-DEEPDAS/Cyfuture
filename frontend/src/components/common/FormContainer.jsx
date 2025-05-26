import React from 'react';

const FormContainer = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
};

export default FormContainer;