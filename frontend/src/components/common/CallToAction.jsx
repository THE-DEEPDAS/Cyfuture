import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const CallToAction = ({ 
  title, 
  description, 
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundStyle = 'gradient', // options: gradient, light, dark, image, modern
  imageUrl,
  alignment = 'center', // options: center, left, right
  size = 'default', // options: default, small, large
  icon
}) => {  
  // Styles based on properties
  const containerStyles = {
    gradient: 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-xl rounded-2xl',
    light: 'bg-gray-50 text-gray-900 shadow-md rounded-xl',
    dark: 'bg-gray-900 text-white shadow-xl rounded-xl',
    image: 'bg-cover bg-center text-white relative rounded-xl overflow-hidden',
    modern: 'bg-gradient-to-br from-indigo-600 via-primary-600 to-blue-500 text-white shadow-xl rounded-2xl'
  };
  
  const containerPadding = {
    default: 'py-16 px-6',
    small: 'py-10 px-6',
    large: 'py-24 px-8',
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className={`${containerStyles[backgroundStyle]} ${containerPadding[size]} overflow-hidden relative`}
      style={backgroundStyle === 'image' ? { backgroundImage: `url(${imageUrl})` } : {}}
    >
      {backgroundStyle === 'image' && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      
      {/* Decorative Elements */}
      {(backgroundStyle === 'gradient' || backgroundStyle === 'modern') && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
        </>
      )}
      
      <div className={`container mx-auto relative ${textAlignment[alignment]}`}>
        <div className={maxWidth[alignment]}>
          {icon && (
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 text-white text-3xl shadow-lg"
            >
              <FontAwesomeIcon icon={icon} />
            </motion.div>
          )}
          
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${backgroundStyle === 'light' ? 'text-gray-900' : 'text-white'} leading-tight`}>
            {title}
          </h2>
          
          <p className={`text-lg md:text-xl mb-10 ${backgroundStyle === 'light' ? 'text-gray-600' : 'text-white/90'} max-w-2xl mx-auto`}>
            {description}
          </p>
          
          <div className="flex flex-wrap gap-5 justify-center">
            {primaryButtonText && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={primaryButtonLink}
                  className={`px-8 py-4 rounded-lg font-medium transition-colors flex items-center shadow-lg ${primaryButtonStyle} text-lg`}
                >
                  {primaryButtonText}
                  <FontAwesomeIcon 
                    icon={faArrowRight} 
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                  />
                </Link>
              </motion.div>
            )}
            
            {secondaryButtonText && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={secondaryButtonLink}
                  className={`px-8 py-4 rounded-lg font-medium transition-colors ${secondaryButtonStyle} text-lg`}
                >
                  {secondaryButtonText}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CallToAction;
