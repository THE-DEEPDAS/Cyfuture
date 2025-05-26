import React from 'react';
import PropTypes from 'prop-types';

const FormContainer = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-soft p-8 border border-gray-100">
        {children}
      </div>
    </div>
  );
};

FormContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FormContainer;