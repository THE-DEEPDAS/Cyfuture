import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext.jsx";
import Footer from "../components/common/Footer.jsx";

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  console.log("MainLayout rendered, path:", location.pathname, "user:", user);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Determine where to redirect the user based on role
  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";
    return user.role === "candidate" ? "/candidate" : "/company";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-primary">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background-primary shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm text-white hover:text-primary-400 transition-colors ${
                  location.pathname === "/"
                    ? "font-medium text-primary-400"
                    : ""
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
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? "times" : "bars"}
                className="text-xl"
              />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-4 transition-all">
              <Link
                to="/"
                className={`block text-white hover:text-primary-400 transition-colors ${
                  location.pathname === "/"
                    ? "font-medium text-primary-400"
                    : ""
                }`}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block text-white hover:text-primary-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left text-white hover:text-primary-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block text-white hover:text-primary-400 transition-colors ${
                      location.pathname === "/login"
                        ? "font-medium text-primary-400"
                        : ""
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
