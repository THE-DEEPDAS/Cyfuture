import React from 'react';
import CallToAction from '../common/CallToAction';
import { faRocket, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const CtaSection = ({ userType = 'jobseeker' }) => {
  // Content based on user type
  const content = {    
    jobseeker: {
      title: "Ready to Accelerate Your Career?",
      description: "Upload your resume now and let our AI technology match you with your dream job. It only takes a few minutes to get started.",
      primaryButtonText: "Upload Your Resume",
      primaryButtonLink: "/upload-resume",
      secondaryButtonText: "Browse Jobs",
      secondaryButtonLink: "/jobs",
      icon: faRocket
    },
    employer: {
      title: "Find the Perfect Candidates",
      description: "Post a job today and let our advanced AI matching technology connect you with the most qualified candidates for your position.",
      primaryButtonText: "Post a Job",
      primaryButtonLink: "/post-job",
      secondaryButtonText: "Learn More",
      secondaryButtonLink: "/employer-solutions",
      icon: faBuilding
    }
  };
  
  const selectedContent = content[userType] || content.jobseeker;
  
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-6xl"
      >
        <CallToAction
          title={selectedContent.title}
          description={selectedContent.description}
          primaryButtonText={selectedContent.primaryButtonText}
          primaryButtonLink={selectedContent.primaryButtonLink}
          secondaryButtonText={selectedContent.secondaryButtonText}
          secondaryButtonLink={selectedContent.secondaryButtonLink}
          backgroundStyle="modern"
          alignment="center"
          size="large"
          icon={selectedContent.icon}
        />
      </motion.div>
    </section>
  );
};

export default CtaSection;
