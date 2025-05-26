import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '../../actions/userActions';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Resu<span className="text-teal-600">Match</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
              <FontAwesomeIcon icon="briefcase" className="mr-2" />
              Browse Jobs
            </Link>
            
            {userInfo ? (
              <>
                {userInfo.isAdmin ? (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    <FontAwesomeIcon icon="chart-bar" className="mr-2" />
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/upload-resume" className="text-gray-700 hover:text-blue-600 transition-colors">
                    <FontAwesomeIcon icon="upload" className="mr-2" />
                    Upload Resume
                  </Link>
                )}
                
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={toggleMenu}
                  >
                    <FontAwesomeIcon icon="user" className="mr-2" />
                    {userInfo.name}
                    <FontAwesomeIcon
                      icon={isMenuOpen ? "chevron-up" : "chevron-down"}
                      className="ml-2"
                    />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <FontAwesomeIcon icon="user" className="mr-2" />
                          Profile
                        </Link>
                        
                        {userInfo.isAdmin && (
                          <>
                            <Link
                              to="/admin/jobs"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <FontAwesomeIcon icon="briefcase" className="mr-2" />
                              Manage Jobs
                            </Link>
                            
                            <Link
                              to="/admin/company-profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <FontAwesomeIcon icon="building" className="mr-2" />
                              Company Profile
                            </Link>
                          </>
                        )}
                        
                        <button
                          type="button"
                          onClick={logoutHandler}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <FontAwesomeIcon icon="sign-out-alt" className="mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary rounded-full">
                  <FontAwesomeIcon icon="user-plus" className="mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={toggleMenu}
          >
            <FontAwesomeIcon icon={isMenuOpen ? "times" : "bars"} size="lg" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <Link
              to="/jobs"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon="briefcase" className="mr-2" />
              Browse Jobs
            </Link>
            
            {userInfo ? (
              <>
                {userInfo.isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon="chart-bar" className="mr-2" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/upload-resume"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon="upload" className="mr-2" />
                    Upload Resume
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon="user" className="mr-2" />
                  Profile
                </Link>
                
                {userInfo.isAdmin && (
                  <>
                    <Link
                      to="/admin/jobs"
                      className="block py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon="briefcase" className="mr-2" />
                      Manage Jobs
                    </Link>
                    
                    <Link
                      to="/admin/company-profile"
                      className="block py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon="building" className="mr-2" />
                      Company Profile
                    </Link>
                  </>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    logoutHandler();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
                >
                  <FontAwesomeIcon icon="sign-out-alt" className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
                  Login
                </Link>
                
                <Link
                  to="/register"
                  className="block py-2 text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon="user-plus" className="mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;