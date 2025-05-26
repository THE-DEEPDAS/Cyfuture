import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  backgroundImage,
  size = 'default', // small, default, large
  textAlignment = 'left', // left, center
}) => {
  // Size classes
  const sizeClasses = {
    small: 'py-6',
    default: 'py-12',
    large: 'py-20',
  };
  
  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };
  
  const hasBackgroundImage = !!backgroundImage;
  
  return (
    <div 
      className={`relative ${sizeClasses[size]} ${hasBackgroundImage ? 'bg-cover bg-center text-white' : 'bg-gray-50 text-gray-900'}`}
      style={hasBackgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      {hasBackgroundImage && (
        <div className="absolute inset-0 bg-black/50 z-0"></div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        {breadcrumbs.length > 0 && (
          <nav className={`mb-4 ${hasBackgroundImage ? 'text-white/80' : 'text-gray-500'}`}>
            <ol className="flex flex-wrap items-center text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <li className="mx-2">
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </li>
                  )}
                  <li>
                    {crumb.link ? (
                      <Link 
                        to={crumb.link} 
                        className={`hover:${hasBackgroundImage ? 'text-white' : 'text-primary-600'}`}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>
        )}
        
        <div className={`${alignmentClasses[textAlignment]} ${textAlignment === 'center' ? 'max-w-3xl mx-auto' : ''}`}>
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${hasBackgroundImage ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={`text-lg ${hasBackgroundImage ? 'text-white/80' : 'text-gray-600'} ${actions.length > 0 ? 'mb-8' : ''}`}>
              {subtitle}
            </p>
          )}
          
          {actions.length > 0 && (
            <div className={`flex flex-wrap gap-4 mt-6 ${textAlignment === 'center' ? 'justify-center' : ''}`}>
              {actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-colors
                    ${action.primary 
                      ? `${hasBackgroundImage ? 'bg-white text-primary-700 hover:bg-gray-100' : 'bg-primary-600 text-white hover:bg-primary-700'}` 
                      : `${hasBackgroundImage ? 'bg-transparent border-2 border-white text-white hover:bg-white/10' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  `}
                >
                  {action.icon && (
                    <FontAwesomeIcon icon={action.icon} className="mr-2" />
                  )}
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
