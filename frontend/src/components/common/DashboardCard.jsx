import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  showArrow = false,
  onClick,
  percentage,
  trend = 'up'
}) => {
  // Color variations
  const colorClasses = {
    primary: {
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
    secondary: {
      iconBg: 'bg-secondary-100',
      iconText: 'text-secondary-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
    success: {
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
    danger: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      percentageUp: 'text-green-600',
      percentageDown: 'text-red-600',
    },
  };
  
  const classes = colorClasses[color] || colorClasses.primary;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${classes.iconBg} rounded-full flex items-center justify-center ${classes.iconText}`}>
          <FontAwesomeIcon icon={icon} size="lg" />
        </div>
        
        {showArrow && (
          <div className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        
        {percentage && (
          <div className={`flex items-center ${trend === 'up' ? classes.percentageUp : classes.percentageDown}`}>
            <FontAwesomeIcon 
              icon={trend === 'up' ? 'arrow-up' : 'arrow-down'} 
              className="mr-1" 
            />
            <span className="font-medium">{percentage}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
