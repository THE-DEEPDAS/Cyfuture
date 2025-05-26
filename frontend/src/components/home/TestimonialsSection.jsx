import React from 'react';
import TestimonialCard from '../common/TestimonialCard';

const TestimonialsSection = () => {
  // Mock testimonial data
  const testimonials = [
    {
      quote: "CyFuture helped me find my dream job in less than 2 weeks. The AI matching was incredibly accurate and saved me hours of searching through irrelevant listings.",
      author: "Sarah Johnson",
      position: "Software Engineer",
      company: "TechCorp Inc.",
      rating: 5
    },
    {
      quote: "As a hiring manager, I've been amazed by the quality of candidates CyFuture connects us with. Their resume parsing technology really understands the skills we need.",
      author: "Michael Chen",
      position: "Technical Director",
      company: "InnovateSoft",
      rating: 5
    },
    {
      quote: "The platform is intuitive and the job matching algorithm is spot on. I received interview requests from companies that were perfect matches for my skill set.",
      author: "Priya Patel",
      position: "UX Designer",
      company: "DesignHub",
      rating: 4
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what job seekers and employers have to say about CyFuture.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              position={testimonial.position}
              company={testimonial.company}
              rating={testimonial.rating}
              variant={index === 1 ? 'bordered' : 'default'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
