import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ icon, count, label, color = 'primary', animation = false }) => {
  // Color variations
  const colorMap = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
    },
    secondary: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-600',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
  };

  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
      <div className={`${colorClass.bg} inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform`}>
        <FontAwesomeIcon 
          icon={icon} 
          className={`text-2xl ${colorClass.text}`}
          beat={animation}
        />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {count}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
};

export default StatsCard;
