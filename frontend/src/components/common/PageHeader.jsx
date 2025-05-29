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
      className={`relative w-full min-h-[80vh] flex items-center justify-center ${hasBackgroundImage ? 'bg-cover bg-center bg-fixed text-white' : 'bg-gray-50 text-gray-900'}`}
      style={hasBackgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      {/* Background overlay */}
      {hasBackgroundImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-[2px] z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-0"></div>
        </>
      )}
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        {breadcrumbs.length > 0 && (
          <nav className={`mb-8 ${hasBackgroundImage ? 'text-white/90' : 'text-gray-500'}`}>
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
                        className={`hover:${hasBackgroundImage ? 'text-white' : 'text-primary-600'} transition-colors duration-200`}
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
        
        <div className={`${alignmentClasses[textAlignment]} ${textAlignment === 'center' ? 'max-w-4xl mx-auto' : ''}`}>
          <div className={`mb-8 ${hasBackgroundImage ? 'animate-fadeInUp' : ''}`}>
            {typeof title === 'string' ? (
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${hasBackgroundImage ? 'text-white' : 'text-gray-900'} leading-tight`}>
                {title}
              </h1>
            ) : (
              title
            )}
            
            {subtitle && (
              typeof subtitle === 'string' ? (
                <p className={`text-xl ${hasBackgroundImage ? 'text-white/90' : 'text-gray-600'} max-w-3xl mx-auto`}>
                  {subtitle}
                </p>
              ) : (
                subtitle
              )
            )}
          </div>
          
          {actions.length > 0 && (
            <div className={`flex flex-wrap gap-6 mt-8 ${textAlignment === 'center' ? 'justify-center' : ''} ${hasBackgroundImage ? 'animate-fadeInUp' : ''}`}>
              {actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`
                    px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center
                    ${action.primary 
                      ? `${hasBackgroundImage ? 'bg-white text-primary-700 hover:bg-gray-100 shadow-lg' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'}` 
                      : `${hasBackgroundImage ? 'bg-transparent border-2 border-white text-white hover:bg-white/10' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  `}
                >
                  {action.icon && (
                    <FontAwesomeIcon icon={action.icon} className={`text-lg ${action.primary ? 'mr-3' : 'mr-2'}`} />
                  )}
                  <span className="text-lg">{action.label}</span>
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
