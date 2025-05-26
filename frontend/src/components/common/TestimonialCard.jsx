import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

const TestimonialCard = ({
  quote,
  author,
  position,
  company,
  avatar,
  rating = 5,
  variant = 'default' // default, bordered, minimal
}) => {
  // Render the rating stars
  const renderStars = (rating) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i}
          icon="star"
          className={i <= rating ? "text-amber-400" : "text-gray-300"}
        />
      );
    }
    
    return <div className="flex space-x-1 mb-4">{stars}</div>;
  };
  
  // Styles based on variant
  const cardStyles = {
    default: "bg-white shadow-soft rounded-xl p-6",
    bordered: "bg-white border-2 border-primary-100 rounded-xl p-6",
    minimal: "bg-gray-50 rounded-xl p-6"
  };
  
  return (
    <div className={`${cardStyles[variant]} transition-all duration-300 hover:shadow-md`}>
      <div className="mb-4 text-primary-500 text-xl">
        <FontAwesomeIcon icon={faQuoteLeft} />
      </div>
      
      {rating > 0 && renderStars(rating)}
      
      <p className="text-gray-700 mb-6">
        "{quote}"
      </p>
      
      <div className="flex items-center">
        {avatar ? (
          <img 
            src={avatar} 
            alt={author} 
            className="w-12 h-12 rounded-full object-cover mr-4" 
          />
        ) : (
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
            {author.charAt(0)}
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-gray-500 text-sm">
            {position}
            {company && (
              <>
                <span className="mx-1">|</span>
                {company}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
