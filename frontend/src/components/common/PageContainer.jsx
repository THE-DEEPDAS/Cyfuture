import React from 'react';
import PropTypes from 'prop-types';

const PageContainer = ({ 
  children, 
  className = '', 
  fullWidth = false,
  maxWidth = '7xl', // '4xl', '5xl', '6xl', '7xl', etc.
  contained = true, // Whether to add padding and max-width constraints
  spacing = 'default', // 'none', 'tight', 'default', 'loose'
}) => {
  // Max width classes
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'none': '',
  };

  // Spacing classes (vertical padding)
  const spacingClasses = {
    none: '',
    tight: 'py-4 md:py-6',
    default: 'py-8 md:py-12',
    loose: 'py-12 md:py-16',
  };

  return (
    <div className={`w-full ${!fullWidth ? 'px-4 md:px-6' : ''} ${spacingClasses[spacing] || ''}`}>
      <div className={`
        mx-auto
        ${contained ? maxWidthClasses[maxWidth] || 'max-w-7xl' : ''}
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['4xl', '5xl', '6xl', '7xl', 'none']),
  contained: PropTypes.bool,
  spacing: PropTypes.oneOf(['none', 'tight', 'default', 'loose']),
};

export default PageContainer;