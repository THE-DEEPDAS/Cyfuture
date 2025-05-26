import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  actionLink,
  actionIcon,
  secondaryActionText,
  secondaryActionLink,
  variant = 'default', // default, compact, card
}) => {
  // Variant classes
  const variantClasses = {
    default: 'py-16',
    compact: 'py-8',
    card: 'py-12 bg-white rounded-xl shadow-soft border border-gray-100',
  };
  
  return (
    <div className={`${variantClasses[variant]} text-center px-6`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-6">
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      
      <p className="text-gray-600 max-w-md mx-auto mb-6">{message}</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {actionText && (
          <Link
            to={actionLink}
            className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {actionIcon && <FontAwesomeIcon icon={actionIcon} className="mr-2" />}
            {actionText}
          </Link>
        )}
        
        {secondaryActionText && (
          <Link
            to={secondaryActionLink}
            className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {secondaryActionText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
