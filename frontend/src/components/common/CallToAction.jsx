import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const CallToAction = ({ 
  title, 
  description, 
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundStyle = 'gradient', // options: gradient, light, dark, image
  imageUrl,
  alignment = 'center', // options: center, left, right
  size = 'default', // options: default, small, large
  icon
}) => {  // Styles based on properties
  const containerStyles = {
    gradient: 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-xl rounded-2xl',
    light: 'bg-gray-50 text-gray-900 shadow-md rounded-xl',
    dark: 'bg-gray-900 text-white shadow-xl rounded-xl',
    image: 'bg-cover bg-center text-white relative rounded-xl overflow-hidden',
  };
  
  const containerPadding = {
    default: 'py-16 px-6',
    small: 'py-10 px-6',
    large: 'py-24 px-6',
  };
  
  const textAlignment = {
    center: 'text-center mx-auto',
    left: 'text-left',
    right: 'text-right ml-auto',
  };
  
  const maxWidth = {
    center: 'max-w-3xl mx-auto',
    left: 'max-w-3xl',
    right: 'max-w-3xl',
  };
  
  // Button styles
  const primaryButtonStyle = backgroundStyle === 'light' 
    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
    : 'bg-white hover:bg-gray-100 text-primary-700';
    
  const secondaryButtonStyle = backgroundStyle === 'light'
    ? 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
    : 'bg-transparent border-2 border-white text-white hover:bg-white/10';
  
  return (
    <div 
      className={`${containerStyles[backgroundStyle]} ${containerPadding[size]}`}
      style={backgroundStyle === 'image' ? { backgroundImage: `url(${imageUrl})` } : {}}
    >
      {backgroundStyle === 'image' && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      
      <div className={`container mx-auto relative ${textAlignment[alignment]}`}>
        <div className={maxWidth[alignment]}>
          {icon && (
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-white text-2xl">
              <FontAwesomeIcon icon={icon} />
            </div>
          )}
          
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${backgroundStyle === 'light' ? 'text-gray-900' : 'text-white'}`}>
            {title}
          </h2>
          
          <p className={`text-lg mb-8 ${backgroundStyle === 'light' ? 'text-gray-600' : 'text-white/80'}`}>
            {description}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {primaryButtonText && (
              <Link
                to={primaryButtonLink}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${primaryButtonStyle}`}
              >
                {primaryButtonText}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            )}
            
            {secondaryButtonText && (
              <Link
                to={secondaryButtonLink}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${secondaryButtonStyle}`}
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
