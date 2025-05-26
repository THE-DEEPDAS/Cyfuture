import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptopCode,
  faChartLine,
  faPencilRuler,
  faUserTie,
  faSuitcase,
  faHeartbeat,
  faGraduationCap,
  faHammer,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

const CategoryCard = ({ icon, title, count, color = 'primary', link }) => {
  // Color variations
  const colorMap = {
    primary: {
      bg: 'bg-primary-50/50',
      iconBg: 'bg-primary-100',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-100/50',
      border: 'border-primary-100',
    },
    secondary: {
      bg: 'bg-secondary-50/50',
      iconBg: 'bg-secondary-100',
      text: 'text-secondary-600',
      hover: 'hover:bg-secondary-100/50',
      border: 'border-secondary-100',
    },
    blue: {
      bg: 'bg-blue-50/50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100/50',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50/50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100/50',
      border: 'border-purple-100',
    },
    green: {
      bg: 'bg-green-50/50',
      iconBg: 'bg-green-100',
      text: 'text-green-600',
      hover: 'hover:bg-green-100/50',
      border: 'border-green-100',
    },
    pink: {
      bg: 'bg-pink-50/50',
      iconBg: 'bg-pink-100',
      text: 'text-pink-600',
      hover: 'hover:bg-pink-100/50',
      border: 'border-pink-100',
    }
  };

  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <Link 
      to={link} 
      className={`group backdrop-blur-sm border ${colorClass.border} ${colorClass.bg} rounded-xl p-6 flex items-center transition-all duration-300 ${colorClass.hover} transform hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className={`mr-6 ${colorClass.iconBg} w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
        <FontAwesomeIcon 
          icon={icon} 
          className={`${colorClass.text} text-2xl`}
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800">{title}</h3>
        <p className={`${colorClass.text} font-semibold`}>{count} jobs</p>
      </div>
      
      <div className="ml-4 opacity-0 transform translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <FontAwesomeIcon icon="arrow-right" className={`${colorClass.text} text-lg`} />
      </div>
    </Link>
  );
};

const JobCategoriesSection = () => {
  // Mock categories data with improved hierarchy
  const categories = [
    { 
      icon: faLaptopCode, 
      title: 'Technology', 
      count: 1250, 
      color: 'primary', 
      link: '/jobs?category=technology' 
    },
    { 
      icon: faChartLine, 
      title: 'Business', 
      count: 863, 
      color: 'blue', 
      link: '/jobs?category=business' 
    },
    { 
      icon: faPencilRuler, 
      title: 'Design', 
      count: 577, 
      color: 'purple', 
      link: '/jobs?category=design' 
    },
    { 
      icon: faUserTie, 
      title: 'Management', 
      count: 421, 
      color: 'primary', 
      link: '/jobs?category=management' 
    },
    { 
      icon: faSuitcase, 
      title: 'Sales', 
      count: 392, 
      color: 'secondary', 
      link: '/jobs?category=sales' 
    },
    { 
      icon: faHeartbeat, 
      title: 'Healthcare', 
      count: 267, 
      color: 'pink', 
      link: '/jobs?category=healthcare' 
    },
    { 
      icon: faGraduationCap, 
      title: 'Education', 
      count: 189, 
      color: 'blue', 
      link: '/jobs?category=education' 
    },
    { 
      icon: faHammer, 
      title: 'Trades & Services', 
      count: 143, 
      color: 'purple', 
      link: '/jobs?category=trades' 
    },
    { 
      icon: faShoppingCart, 
      title: 'Retail', 
      count: 134, 
      color: 'green', 
      link: '/jobs?category=retail' 
    }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Explore Job Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse jobs by category and find the perfect role for your skills and experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              style={{ 
                opacity: 0,
                animation: 'fadeInUp 0.5s ease forwards',
                animationDelay: `${index * 100}ms`
              }}
            >
              <CategoryCard
                icon={category.icon}
                title={category.title}
                count={category.count}
                color={category.color}
                link={category.link}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link 
            to="/jobs" 
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg group"
          >
            View All Categories
            <FontAwesomeIcon 
              icon="arrow-right" 
              className="ml-3 transform group-hover:translate-x-1 transition-transform duration-300" 
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSection;
