import React from 'react';
import CallToAction from '../common/CallToAction';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

const CtaSection = ({ userType = 'jobseeker' }) => {
  // Content based on user type
  const content = {    jobseeker: {
      title: "Ready to Accelerate Your Career?",
      description: "Upload your resume now and let our AI technology match you with your dream job. It only takes a few minutes to get started.",
      primaryButtonText: "Upload Your Resume",
      primaryButtonLink: "/upload-resume",
      secondaryButtonText: "Browse Jobs",
      secondaryButtonLink: "/jobs",
      icon: faRocket
    },employer: {
      title: "Find the Perfect Candidates",
      description: "Post a job today and let our advanced AI matching technology connect you with the most qualified candidates for your position.",
      primaryButtonText: "Post a Job",
      primaryButtonLink: "/post-job",
      secondaryButtonText: "Learn More",
      secondaryButtonLink: "/employer-solutions",
      icon: faRocket
    }
  };
  
  const selectedContent = content[userType] || content.jobseeker;
    return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl transform hover:scale-[1.01] transition-all duration-300">
        <CallToAction
          title={selectedContent.title}
          description={selectedContent.description}
          primaryButtonText={selectedContent.primaryButtonText}
          primaryButtonLink={selectedContent.primaryButtonLink}
          secondaryButtonText={selectedContent.secondaryButtonText}
          secondaryButtonLink={selectedContent.secondaryButtonLink}
          backgroundStyle="gradient"
          alignment="center"
          size="default"
          icon={selectedContent.icon}
        />
      </div>
    </section>
  );
};

export default CtaSection;
