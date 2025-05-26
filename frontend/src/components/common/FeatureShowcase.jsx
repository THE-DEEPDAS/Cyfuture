import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color = 'primary', 
  style = 'default' // default, boxed, minimal
}) => {
  // Color variations
  const colorMap = {
    primary: {
      bg: 'bg-primary-50',
      border: 'border-primary-100',
      text: 'text-primary-600',
    },
    secondary: {
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
      text: 'text-secondary-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
    },
  };

  const colorClass = colorMap[color] || colorMap.primary;
  
  // Style variations
  const styleMap = {
    default: `p-8 bg-white rounded-xl shadow-soft border border-gray-100 hover:shadow-lg transition-all duration-300`,
    boxed: `p-8 ${colorClass.bg} rounded-xl border ${colorClass.border} hover:shadow-md transition-all duration-300`,
    minimal: `p-6 hover:bg-gray-50 transition-all duration-300 rounded-xl`,
  };
  
  const cardStyle = styleMap[style] || styleMap.default;
  
  return (
    <div className={cardStyle}>
      <div className={`${style === 'boxed' ? 'bg-white' : colorClass.bg} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
        <FontAwesomeIcon icon={icon} className={`text-2xl ${colorClass.text}`} />
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// A section to showcase multiple features
const FeatureShowcase = ({ 
  title, 
  subtitle, 
  features, 
  columns = 3, 
  style = 'default',
  backgroundColor = 'white' // white, gray, gradient
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50',
  };
  
  const bgClass = backgroundClasses[backgroundColor] || backgroundClasses.white;
  
  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className={`grid md:grid-cols-${columns} gap-8 max-w-6xl mx-auto`}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color || 'primary'}
              style={style}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureCard, FeatureShowcase };
