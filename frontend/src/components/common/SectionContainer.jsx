import React from 'react';
import PropTypes from 'prop-types';

const SectionContainer = ({ 
  children, 
  className = '',
  background = 'white', // 'white', 'gray', 'gradient', 'dark', 'primary', 'none'
  spacing = 'default', // 'none', 'tight', 'default', 'loose'
  contained = true,
  maxWidth = '7xl',
  hasPattern = false,
  hasDivider = false,
}) => {
  // Background classes
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-gray-50 to-white',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary-900 text-white',
    none: '',
  };

  // Border classes
  const borderClasses = hasDivider ? 'border-t border-gray-100' : '';

  // Pattern overlay for visual interest
  const patternOverlay = hasPattern ? (
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDUwIDAgTCAwIDAgMCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
  ) : null;

  // Spacing classes (vertical padding)
  const spacingClasses = {
    none: '',
    tight: 'py-8 md:py-12',
    default: 'py-16 md:py-24',
    loose: 'py-24 md:py-32',
  };

  // Max width classes
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'none': '',
  };

  return (
    <section className={`relative ${backgroundClasses[background]} ${borderClasses} ${className}`}>
      {patternOverlay}
      <div className={`relative ${spacingClasses[spacing] || ''}`}>
        <div className={`mx-auto px-4 md:px-6 ${contained ? maxWidthClasses[maxWidth] : ''}`}>
          {children}
        </div>
      </div>
    </section>
  );
};

SectionContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  background: PropTypes.oneOf(['white', 'gray', 'gradient', 'dark', 'primary', 'none']),
  spacing: PropTypes.oneOf(['none', 'tight', 'default', 'loose']),
  contained: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['4xl', '5xl', '6xl', '7xl', 'none']),
  hasPattern: PropTypes.bool,
  hasDivider: PropTypes.bool,
};

export default SectionContainer;
