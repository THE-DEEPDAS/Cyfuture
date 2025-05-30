import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-800 border-t border-dark-700 py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold">TalentMatch</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting talented professionals with their dream careers through AI-powered job matching.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
            </div>
          </div>
          
          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/resume-upload" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Saved Jobs
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-gray-400 hover:text-primary-400 transition-colors">
                  My Applications
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Career Assistant
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/register" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Register as Employer
                </Link>
              </li>
              <li>
                <Link to="/employer/jobs/create" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} TalentMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;