import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBriefcase,
  faUserCircle,
  faClipboardList,
  faBookmark,
  faFileAlt,
  faChartBar,
  faEnvelope,
  faUsers,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const location = useLocation();
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  
  // If sidebar is not open on mobile, don't render
  if (!sidebarOpen && window.innerWidth < 1024) {
    return null;
  }
  
  return (
    <div className={`bg-dark-800 border-r border-dark-700 z-20 lg:block ${sidebarOpen ? 'block fixed inset-y-0 left-0 w-64 mt-16' : 'hidden'} lg:static lg:h-auto lg:mt-0`}>
      <nav className="mt-5 px-4">
        <div className="space-y-1">
          <Link
            to="/"
            className={`nav-link flex items-center ${
              location.pathname === '/' ? 'nav-link-active' : ''
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="mr-3" />
            <span>Home</span>
          </Link>
          
          <Link
            to="/jobs"
            className={`nav-link flex items-center ${
              location.pathname === '/jobs' ? 'nav-link-active' : ''
            }`}
          >
            <FontAwesomeIcon icon={faBriefcase} className="mr-3" />
            <span>Browse Jobs</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className={`nav-link flex items-center ${
                  location.pathname === '/profile' ? 'nav-link-active' : ''
                }`}
              >
                <FontAwesomeIcon icon={faUserCircle} className="mr-3" />
                <span>Profile</span>
              </Link>
              
              <Link
                to="/applications"
                className={`nav-link flex items-center ${
                  location.pathname === '/applications' ? 'nav-link-active' : ''
                }`}
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-3" />
                <span>Applications</span>
              </Link>
              
              <Link
                to="/saved-jobs"
                className={`nav-link flex items-center ${
                  location.pathname === '/saved-jobs' ? 'nav-link-active' : ''
                }`}
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-3" />
                <span>Saved Jobs</span>
              </Link>
              
              <Link
                to="/resume-upload"
                className={`nav-link flex items-center ${
                  location.pathname === '/resume-upload' ? 'nav-link-active' : ''
                }`}
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-3" />
                <span>Resume</span>
              </Link>
              
              <Link
                to="/chat"
                className={`nav-link flex items-center ${
                  location.pathname === '/chat' ? 'nav-link-active' : ''
                }`}
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
                <span>Messages</span>
              </Link>
              
              {userInfo && userInfo.role === 'employer' && (
                <>
                  <hr className="border-dark-700 my-4" />
                  
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Employer
                  </h3>
                  
                  <Link
                    to="/employer/dashboard"
                    className={`nav-link flex items-center ${
                      location.pathname === '/employer/dashboard' ? 'nav-link-active' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faChartBar} className="mr-3" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/employer/jobs/create"
                    className={`nav-link flex items-center ${
                      location.pathname === '/employer/jobs/create' ? 'nav-link-active' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faBriefcase} className="mr-3" />
                    <span>Post a Job</span>
                  </Link>
                </>
              )}
              
              {userInfo && userInfo.role === 'admin' && (
                <>
                  <hr className="border-dark-700 my-4" />
                  
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                  
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link flex items-center ${
                      location.pathname === '/admin/dashboard' ? 'nav-link-active' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faChartBar} className="mr-3" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/admin/users"
                    className={`nav-link flex items-center ${
                      location.pathname === '/admin/users' ? 'nav-link-active' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-3" />
                    <span>Users</span>
                  </Link>
                  
                  <Link
                    to="/admin/settings"
                    className={`nav-link flex items-center ${
                      location.pathname === '/admin/settings' ? 'nav-link-active' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={faCog} className="mr-3" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;