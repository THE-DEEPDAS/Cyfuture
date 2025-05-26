import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle, 
  alignment = 'center', // center, left, right
  size = 'default', // small, default, large
  withLine = false,
  subtitleColor = 'default', // default, light, accent
}) => {
  // Alignment classes
  const alignmentClasses = {
    center: 'text-center mx-auto',
    left: 'text-left',
    right: 'text-right',
  };
  
  // Size classes
  const titleSizeClasses = {
    small: 'text-2xl md:text-3xl',
    default: 'text-3xl md:text-4xl',
    large: 'text-4xl md:text-5xl',
  };
  
  const subtitleSizeClasses = {
    small: 'text-base',
    default: 'text-lg',
    large: 'text-xl',
  };
  
  // Subtitle color classes
  const subtitleColorClasses = {
    default: 'text-gray-600',
    light: 'text-gray-400',
    accent: 'text-primary-600',
  };
  
  // Margin classes
  const marginClasses = {
    small: 'mb-6',
    default: 'mb-12',
    large: 'mb-16',
  };
  
  return (
    <div className={`${alignmentClasses[alignment]} ${marginClasses[size]}`}>
      <h2 className={`${titleSizeClasses[size]} font-bold mb-4 text-gray-900 ${withLine ? 'pb-4 relative' : ''}`}>
        {title}
        {withLine && alignment === 'center' && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-primary-600"></span>
        )}
        {withLine && alignment === 'left' && (
          <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary-600"></span>
        )}
        {withLine && alignment === 'right' && (
          <span className="absolute bottom-0 right-0 w-16 h-1 bg-primary-600"></span>
        )}
      </h2>
      
      {subtitle && (
        <p className={`${subtitleSizeClasses[size]} ${subtitleColorClasses[subtitleColor]} max-w-3xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
