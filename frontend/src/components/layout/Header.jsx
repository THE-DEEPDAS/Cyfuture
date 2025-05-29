import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBuilding, faBriefcase, faSearch } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../actions/userActions';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white font-bold">
              CF
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              CyFuture
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div className="relative mx-4 flex-grow max-w-xs">
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            
            <Link to="/jobs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              Jobs
            </Link>

            {userInfo ? (
              <>
                {userInfo.isAdmin ? (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
                    <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                    Admin
                  </Link>
                ) : (
                  <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Profile
                  </Link>
                )}
                <button
                  onClick={logoutHandler}
                  className="flex items-center px-4 py-2 rounded-lg text-primary-600 hover:bg-primary-50 font-medium transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col space-y-4 pb-4">
              <div className="relative mx-auto w-full mb-2">
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              <Link to="/jobs" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg font-medium transition-colors">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2 w-5" />
                Jobs
              </Link>
              {userInfo ? (
                <>
                  {userInfo.isAdmin ? (
                    <Link to="/admin/dashboard" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg font-medium transition-colors">
                      <FontAwesomeIcon icon={faBuilding} className="mr-2 w-5" />
                      Admin
                    </Link>
                  ) : (
                    <Link to="/profile" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg font-medium transition-colors">
                      <FontAwesomeIcon icon={faUser} className="mr-2 w-5" />
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="flex items-center px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium w-full text-left"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link to="/login" className="flex items-center justify-center px-3 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;