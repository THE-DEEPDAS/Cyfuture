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
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-100',
    },
    secondary: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-600',
      hover: 'hover:bg-secondary-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      hover: 'hover:bg-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      hover: 'hover:bg-red-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      hover: 'hover:bg-pink-100',
    },
  };

  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <Link 
      to={link} 
      className={`${colorClass.bg} rounded-xl p-6 flex items-center transition-all duration-300 ${colorClass.hover} group`}
    >
      <div className="mr-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
        <FontAwesomeIcon 
          icon={icon} 
          className={`${colorClass.text} text-xl transition-transform duration-300 group-hover:scale-110`} 
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500">{count} jobs</p>
      </div>
      
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <FontAwesomeIcon icon="arrow-right" className={colorClass.text} />
      </div>
    </Link>
  );
};

const JobCategoriesSection = () => {
  // Mock categories data
  const categories = [
    { icon: faLaptopCode, title: 'Technology', count: 1250, color: 'primary', link: '/jobs?category=technology' },
    { icon: faChartLine, title: 'Business', count: 863, color: 'blue', link: '/jobs?category=business' },
    { icon: faPencilRuler, title: 'Design', count: 577, color: 'purple', link: '/jobs?category=design' },
    { icon: faUserTie, title: 'Management', count: 421, color: 'indigo', link: '/jobs?category=management' },
    { icon: faSuitcase, title: 'Sales', count: 392, color: 'amber', link: '/jobs?category=sales' },
    { icon: faHeartbeat, title: 'Healthcare', count: 267, color: 'red', link: '/jobs?category=healthcare' },
    { icon: faGraduationCap, title: 'Education', count: 189, color: 'green', link: '/jobs?category=education' },
    { icon: faHammer, title: 'Trades & Services', count: 143, color: 'secondary', link: '/jobs?category=trades' },
    { icon: faShoppingCart, title: 'Retail', count: 134, color: 'pink', link: '/jobs?category=retail' },
  ];
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Explore Job Categories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse jobs by category and find the perfect role for your skills and experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              count={category.count}
              color={category.color}
              link={category.link}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/jobs" 
            className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 bg-white hover:bg-primary-50 rounded-lg font-medium transition-colors"
          >
            View All Categories
            <FontAwesomeIcon icon="arrow-right" className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSection;
