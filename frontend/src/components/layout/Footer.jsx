import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                CyFuture
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Connecting top talent with the right opportunities through intelligent resume matching.
              </p>
              <div className="flex space-x-5 mt-6">
                <a href="#" className="text-gray-400 hover:text-primary-400 transform hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={['fab', 'facebook']} size="lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transform hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faTwitter} size="lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transform hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faLinkedin} size="lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transform hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faInstagram} size="lg" />
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">For Job Seekers</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/jobs" className="text-gray-400 hover:text-primary-400 transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/upload-resume" className="text-gray-400 hover:text-primary-400 transition-colors">
                    Upload Resume
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    Career Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    Resume Tips
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/register-company" className="text-gray-300 hover:text-white transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Recruitment Solutions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} ResuMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;