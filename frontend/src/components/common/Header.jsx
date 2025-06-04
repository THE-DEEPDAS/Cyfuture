import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Determine where to redirect the user based on role
  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";
    return user.role === "candidate" ? "/candidate" : "/company";
  };

  return (
    <header className="bg-background-secondary shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-white text-xl font-semibold"
          >
            <FontAwesomeIcon
              icon="briefcase"
              className="text-primary-500 mr-2"
            />
            <span>Medhavi</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm text-white hover:text-primary-400 transition-colors ${
                location.pathname === "/" ? "font-medium text-primary-400" : ""
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-sm text-white hover:text-primary-400 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-white hover:text-primary-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm text-white hover:text-primary-400 transition-colors ${
                    location.pathname === "/login"
                      ? "font-medium text-primary-400"
                      : ""
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <FontAwesomeIcon icon="bars" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
