import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faLinkedin, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 pt-20 pb-12 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDUwIDAgTCAwIDAgMCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:pr-8">
            <div className="space-y-6">
              <div className="flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                  CF
                </div>
                <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  CyFuture
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Connecting top talent with the right opportunities through intelligent resume matching and AI-powered career guidance.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 hover:-rotate-6 transition-all duration-300 shadow-lg hover:shadow-primary-600/20">
                  <FontAwesomeIcon icon={faFacebookF} className="text-sm" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-primary-600/20">
                  <FontAwesomeIcon icon={faTwitter} className="text-sm" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 hover:-rotate-6 transition-all duration-300 shadow-lg hover:shadow-primary-600/20">
                  <FontAwesomeIcon icon={faLinkedin} className="text-sm" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-primary-600/20">
                  <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="lg:border-l lg:border-gray-800 lg:pl-8">
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block group">
              For Job Seekers
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-600 to-transparent transform origin-left transition-transform duration-300 group-hover:scale-x-150"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Browse Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/upload-resume" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Upload Resume</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Career Resources</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Resume Tips</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div className="lg:border-l lg:border-gray-800 lg:pl-8">
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block group">
              For Employers
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-600 to-transparent transform origin-left transition-transform duration-300 group-hover:scale-x-150"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register-company" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Post a Job</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Pricing</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Recruitment Solutions</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 opacity-75 group-hover:scale-150 transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Success Stories</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div className="lg:border-l lg:border-gray-800 lg:pl-8">
            <h4 className="text-xl font-semibold text-white mb-6 relative inline-block group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-primary-600 to-transparent transform origin-left transition-transform duration-300 group-hover:scale-x-150"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start group hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300 -mx-3">
                  <div className="mr-3 mt-1">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors duration-300">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-500" />
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    Department of AI and Department of CSE<br />
                    NIT Surat, Gujarat, India<br />
                    Pin: 395007
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center group hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300 -mx-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors duration-300">
                      <FontAwesomeIcon icon={faPhone} className="text-primary-500" />
                    </div>
                  </div>
                  <a href="tel:+919660108763" className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    +91 9660108763
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center group hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300 -mx-3">
                  <div className="mr-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors duration-300">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary-500" />
                    </div>
                  </div>
                  <a href="mailto:jainbodhini05@gmail.com" className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    jainbodhini05@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="relative mt-16 pt-8 border-t border-gray-800">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 px-8 -mt-px">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm hover:text-gray-400 transition-colors duration-300">
                &copy; {currentYear} CyFuture. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors duration-300 hover:underline">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors duration-300 hover:underline">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-primary-400 text-sm transition-colors duration-300 hover:underline">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;