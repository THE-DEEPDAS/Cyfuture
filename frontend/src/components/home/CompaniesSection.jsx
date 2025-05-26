import React from 'react';

const CompaniesSection = () => {
  // Mock company logos (in a real app, these would be actual image URLs)
  const companies = [
    { name: 'Google', logo: 'https://via.placeholder.com/150x50?text=Google' },
    { name: 'Microsoft', logo: 'https://via.placeholder.com/150x50?text=Microsoft' },
    { name: 'Amazon', logo: 'https://via.placeholder.com/150x50?text=Amazon' },
    { name: 'Facebook', logo: 'https://via.placeholder.com/150x50?text=Facebook' },
    { name: 'Apple', logo: 'https://via.placeholder.com/150x50?text=Apple' },
    { name: 'IBM', logo: 'https://via.placeholder.com/150x50?text=IBM' }
  ];
  
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-700">Trusted by Leading Companies</h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-5xl mx-auto">
          {companies.map((company, index) => (
            <div key={index} className="group transition-transform duration-300 hover:scale-105">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-10 md:h-12 w-auto opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
