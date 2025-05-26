import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBuilding, faBriefcase } from '@fortawesome/free-solid-svg-icons';
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
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              CyFuture
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
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
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-medium transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
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
          <div className="md:hidden mt-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/jobs" className="text-gray-600 hover:text-primary-600 font-medium">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Jobs
              </Link>
              {userInfo ? (
                <>
                  {userInfo.isAdmin ? (
                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                      <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                      Admin
                    </Link>
                  ) : (
                    <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;