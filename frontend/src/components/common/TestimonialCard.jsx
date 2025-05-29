import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { motion } from 'framer-motion';

const TestimonialCard = ({
  quote,
  author,
  position,
  company,
  avatar,
  rating = 5,
  variant = 'default' // default, bordered, minimal, featured
}) => {
  // Render the rating stars
  const renderStars = (rating) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i}
          icon={i <= rating ? faStar : faStarRegular}
          className={i <= rating ? "text-amber-400" : "text-gray-300"}
        />
      );
    }
    
    return <div className="flex space-x-1 mb-4">{stars}</div>;
  };
  
  // Styles based on variant
  const cardStyles = {
    default: "bg-white shadow-md rounded-xl p-6 hover:shadow-lg",
    bordered: "bg-white border-2 border-primary-300 shadow-md rounded-xl p-6 hover:shadow-lg hover:border-primary-400",
    minimal: "bg-gray-50 rounded-xl p-6 hover:bg-gray-100",
    featured: "bg-gradient-to-br from-primary-50 to-blue-50 shadow-md rounded-xl p-6 hover:shadow-lg"
  };  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${cardStyles[variant]} transition-all duration-300 h-full flex flex-col`}
    >
      <div className="mb-4 text-primary-500 text-2xl">
        <FontAwesomeIcon icon={faQuoteLeft} />
      </div>
      
      {rating > 0 && renderStars(rating)}
      
      <p className="text-gray-700 mb-6 flex-grow italic">
        "{quote}"
      </p>
      
      <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
        {avatar ? (
          <img 
            src={avatar} 
            alt={author} 
            className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-gray-100 shadow-sm" 
          />
        ) : (
          <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mr-4 border-2 border-primary-50">
            {author.charAt(0)}
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-gray-500 text-sm">
            <span className="font-medium">{position}</span>
            {company && (
              <>
                <span className="mx-1 text-gray-300">•</span>
                <span>{company}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
