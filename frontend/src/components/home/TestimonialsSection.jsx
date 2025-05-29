import React, { useState, useEffect } from 'react';
import TestimonialCard from '../common/TestimonialCard';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
  // Mock testimonial data with avatars
  const testimonials = [
    {
      quote: "CyFuture helped me find my dream job in less than 2 weeks. The AI matching was incredibly accurate and saved me hours of searching through irrelevant listings.",
      author: "Sarah Johnson",
      position: "Software Engineer",
      company: "TechCorp Inc.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "As a hiring manager, I've been amazed by the quality of candidates CyFuture connects us with. Their resume parsing technology really understands the skills we need.",
      author: "Michael Chen",
      position: "Technical Director",
      company: "InnovateSoft",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "The platform is intuitive and the job matching algorithm is spot on. I received interview requests from companies that were perfect matches for my skill set.",
      author: "Priya Patel",
      position: "UX Designer",
      company: "DesignHub",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    },
    {
      quote: "Switching careers seemed impossible until I used CyFuture. Their skill assessment tools helped me identify transferable skills I didn't know I had.",
      author: "James Wilson",
      position: "Marketing Director",
      company: "GrowthLabs",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/68.jpg" 
    }
  ];

  // Autoplay functionality
  useEffect(() => {
    let interval;
    if (isAutoplay) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, testimonials.length]);

  const handleNext = () => {
    setIsAutoplay(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setIsAutoplay(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setIsAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-50 rounded-full opacity-50"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 relative inline-block">
            What Our Users Say
            <span className="absolute -right-8 -top-6 text-primary-500 opacity-20">
              <FontAwesomeIcon icon={faQuoteRight} size="lg" />
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what job seekers and employers have to say about CyFuture.
          </p>
        </div>
        
        {/* Desktop View - Card Carousel */}
        <div className="hidden md:block">
          <div className="relative max-w-6xl mx-auto px-8">
            <button 
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-primary-600 hover:text-primary-700 hover:bg-gray-50 transition-all duration-200"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            <div className="grid grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: Math.abs(index - activeIndex) <= 1 ? 1 : 0.5,
                    scale: index === activeIndex ? 1 : 0.9,
                    y: index === activeIndex ? -20 : 0
                  }}
                  transition={{ duration: 0.4 }}
                  className={`transform transition-all duration-300 ${index === activeIndex ? 'z-20' : 'z-10'}`}
                >
                  <TestimonialCard
                    quote={testimonial.quote}
                    author={testimonial.author}
                    position={testimonial.position}
                    company={testimonial.company}
                    rating={testimonial.rating}
                    avatar={testimonial.avatar}
                    variant={index === activeIndex ? 'bordered' : 'default'}
                  />
                </motion.div>
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-primary-600 hover:text-primary-700 hover:bg-gray-50 transition-all duration-200"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-10 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-primary-600 w-6' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Mobile View - Single Card */}
        <div className="md:hidden">
          <div className="relative max-w-sm mx-auto">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <TestimonialCard
                quote={testimonials[activeIndex].quote}
                author={testimonials[activeIndex].author}
                position={testimonials[activeIndex].position}
                company={testimonials[activeIndex].company}
                rating={testimonials[activeIndex].rating}
                avatar={testimonials[activeIndex].avatar}
                variant="bordered"
              />
            </motion.div>
            
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={handlePrev}
                className="bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-primary-600"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              <div className="flex space-x-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={handleNext}
                className="bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center text-primary-600"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
