import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
  return (
    <footer className="bg-background-dark py-12 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center text-white text-xl font-semibold mb-4">
              <FontAwesomeIcon
                icon="briefcase"
                className="text-primary-500 mr-2"
              />
              <span>Medhavi</span>
            </div>
            <p className="text-sm mb-6">
              Connecting top talent with leading companies through AI-powered
              resume matching.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={["fab", "linkedin"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={["fab", "twitter"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={["fab", "facebook"]} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={["fab", "instagram"]} />
              </a>
            </div>
          </div>

          {/* For job seekers */}
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
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Browse Jobs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Resume Tips
                </a>
              </li>
            </ul>
          </div>

          {/* For employers */}
          <div>
            <h3 className="text-white font-medium text-lg mb-4">
              For Employers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Talent Sourcing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Recruitment Solutions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>
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
                  support@Medhavi.com
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

        <div className="border-t border-dark-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Medhavi. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
