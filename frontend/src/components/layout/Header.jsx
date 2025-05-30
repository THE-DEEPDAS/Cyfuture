import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faSignOutAlt, faUser, faEnvelope, faBriefcase, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { setSidebarOpen } from '../../redux/actions/uiActions';
import { logout } from '../../redux/actions/authActions';
import Logo from '../common/Logo';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  
  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 text-gray-300 hover:text-white focus:outline-none lg:hidden"
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
            </button>
            
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-white">TalentMatch</span>
            </Link>
          </div>
          
          {/* Right side - Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                to="/jobs"
                className="nav-link"
              >
                Jobs
              </Link>
              
              {isAuthenticated ? (
                <>
                  {userInfo.role === 'employer' && (
                    <Link
                      to="/employer/dashboard"
                      className="nav-link"
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  {userInfo.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="nav-link"
                    >
                      Admin
                    </Link>
                  )}
                  
                  <div className="relative ml-3">
                    <div>
                      <button
                        onClick={toggleProfile}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-primary-500"
                        id="user-menu"
                        aria-expanded="false"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Open user menu</span>
                        {userInfo.profileImage ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={userInfo.profileImage}
                            alt={userInfo.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {userInfo.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {/* Profile dropdown */}
                    {isProfileOpen && (
                      <div
                        className="dropdown-menu"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="dropdown-item flex items-center"
                          >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Profile
                          </Link>
                          
                          <Link
                            to="/applications"
                            className="dropdown-item flex items-center"
                          >
                            <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                            Applications
                          </Link>
                          
                          <Link
                            to="/chat"
                            className="dropdown-item flex items-center"
                          >
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                            Messages
                          </Link>
                          
                          {userInfo.role === 'employer' && (
                            <Link
                              to="/employer/dashboard"
                              className="dropdown-item flex items-center"
                            >
                              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                              Dashboard
                            </Link>
                          )}
                          
                          <button
                            onClick={handleLogout}
                            className="dropdown-item flex items-center w-full text-left"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-link"
                  >
                    Sign in
                  </Link>
                  
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/jobs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
              onClick={toggleMenu}
            >
              Jobs
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                
                <Link
                  to="/applications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                  onClick={toggleMenu}
                >
                  Applications
                </Link>
                
                <Link
                  to="/chat"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                  onClick={toggleMenu}
                >
                  Messages
                </Link>
                
                {userInfo.role === 'employer' && (
                  <Link
                    to="/employer/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                )}
                
                {userInfo.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                    onClick={toggleMenu}
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
                
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;