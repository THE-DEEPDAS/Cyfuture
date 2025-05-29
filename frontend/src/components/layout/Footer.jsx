import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faLinkedin, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  CF
                </div>
                <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  CyFuture
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting top talent with the right opportunities through intelligent resume matching and AI-powered career guidance.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block">
              For Job Seekers
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-600"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/upload-resume" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Upload Resume
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Career Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Resume Tips
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block">
              For Employers
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-600"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register-company" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Post a Job
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Recruitment Solutions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75"></span>
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-600"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-500" />
                  </div>
                  <span className="text-gray-400">
                    Department of AI and Department of CSE<br />
                    NIT Surat, Gujarat, India<br />
                    Pin: 395007
                  <br />
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <div className="mr-3">
                    <FontAwesomeIcon icon={faPhone} className="text-primary-500" />
                  </div>
                  <a href="tel:+919660108763" className="text-gray-400 hover:text-primary-400 transition-colors">
                    +91 9660108763
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <div className="mr-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-primary-500" />
                  </div>
                  <a href="mailto:jainbodhini05@gmail.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                    Mail
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">&copy; {currentYear} CyFuture. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;