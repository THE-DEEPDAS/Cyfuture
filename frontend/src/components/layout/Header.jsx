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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/80">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold transform transition-all duration-300 group-hover:scale-110 shadow-lg shadow-primary-600/20">
                CF
                <div className="absolute inset-0 rounded-xl bg-primary-600 mix-blend-multiply opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="absolute inset-0 rounded-xl bg-primary-600 opacity-20 blur-xl transform scale-150 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-primary-700 transition-all duration-300">
              CyFuture
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative mx-4 flex-grow max-w-xs group">
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder:text-gray-400"
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300"
              />
            </div>
            
            <Link 
              to="/jobs" 
              className="relative px-4 py-2 text-gray-700 font-medium group hover:text-primary-600 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                <FontAwesomeIcon 
                  icon={faBriefcase} 
                  className="mr-2 transform group-hover:scale-110 transition-transform duration-300" 
                />
                Jobs
              </span>
              <span className="absolute inset-0 bg-gray-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
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
                  className="relative px-4 py-2 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center text-primary-600 font-medium">
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="mr-2 transform group-hover:scale-110 transition-transform duration-300" 
                    />
                    Sign In
                  </span>
                  <span className="absolute inset-0 border border-primary-600 rounded-lg group-hover:bg-primary-50 transition-colors duration-300"></span>
                </Link>
                <Link 
                  to="/register" 
                  className="relative px-6 py-2 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center text-white font-medium">
                    Get Started
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg transform transition-transform duration-300 group-hover:scale-105"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden relative p-2 rounded-lg text-gray-600 group focus:outline-none"
          >
            <span className="absolute inset-0 bg-gray-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                  className="transform transition-transform duration-300 origin-center"
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16m-7 6h7" 
                  className="transform transition-transform duration-300 origin-center"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pb-4">
              <div className="relative mx-auto w-full mb-2 group">
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder:text-gray-400"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300"
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
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link 
                    to="/login" 
                    className="relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center px-3 py-2.5 text-primary-600 font-medium">
                      <FontAwesomeIcon 
                        icon={faUser} 
                        className="mr-2 transform group-hover:scale-110 transition-transform duration-300" 
                      />
                      Sign In
                    </span>
                    <span className="absolute inset-0 border border-primary-600 rounded-lg group-hover:bg-primary-50 transition-colors duration-300"></span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center px-3 py-2.5 text-white font-medium">
                      Get Started
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg transform transition-transform duration-300 group-hover:scale-105"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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