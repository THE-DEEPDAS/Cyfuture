import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-secondary mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex items-center text-white text-xl font-semibold">
                <FontAwesomeIcon
                  icon="briefcase"
                  className="text-primary-500 mr-2 h-6 w-6"
                />
                <span>Medhavi</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your AI-powered career platform. Connecting top talent with
              opportunities through intelligent matching and career guidance.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={["fab", "linkedin"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={["fab", "twitter"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={["fab", "facebook"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={["fab", "instagram"]} />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-medium text-lg mb-4">
              For Job Seekers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Create an Account
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Resume Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white font-medium text-lg mb-4">
              For Employers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/post-job"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  to="/talent-search"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Talent Sourcing
                </Link>
              </li>
              <li>
                <Link
                  to="/employers"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Recruitment Solutions
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-medium text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon="envelope"
                  className="text-primary-500 mt-1 mr-3"
                />
                <span className="text-sm text-gray-400">
                  support@medhavi.com
                </span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon="phone"
                  className="text-primary-500 mt-1 mr-3"
                />
                <span className="text-sm text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon="map-marker-alt"
                  className="text-primary-500 mt-1 mr-3"
                />
                <span className="text-sm text-gray-400">
                  1234 Innovation Way
                  <br />
                  Tech City, CA 90210
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Medhavi. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/contact"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
