import React from 'react';
import SectionHeader from '../common/SectionHeader';

const CompaniesSection = () => {
  // Real company logos for a more professional look
  const companies = [
    { name: 'Google', logo: 'https://www.vectorlogo.zone/logos/google/google-ar21.svg' },
    { name: 'Microsoft', logo: 'https://www.vectorlogo.zone/logos/microsoft/microsoft-ar21.svg' },
    { name: 'Amazon', logo: 'https://www.vectorlogo.zone/logos/amazon/amazon-ar21.svg' },
    { name: 'Meta', logo: 'https://www.vectorlogo.zone/logos/meta/meta-ar21.svg' },
    { name: 'Apple', logo: 'https://www.vectorlogo.zone/logos/apple/apple-ar21.svg' },
    { name: 'IBM', logo: 'https://www.vectorlogo.zone/logos/ibm/ibm-ar21.svg' },
    { name: 'Oracle', logo: 'https://www.vectorlogo.zone/logos/oracle/oracle-ar21.svg' },
    { name: 'Intel', logo: 'https://www.vectorlogo.zone/logos/intel/intel-ar21.svg' }
  ];
  
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Trusted by Leading Companies"
          subtitle="Join thousands of businesses that trust CyFuture for their recruitment needs"
          alignment="center"
          size="default"
          withLine={true}
        />
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-6xl mx-auto mt-16">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className="group transition-all duration-300 hover:scale-105 p-4 rounded-xl hover:bg-gray-50 hover:shadow-soft"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeIn 0.5s ease forwards'
              }}
            >
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-12 md:h-16 w-auto opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
