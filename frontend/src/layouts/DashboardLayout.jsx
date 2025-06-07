import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext.jsx";

// Component for sidebar links
const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
      active
        ? "bg-primary-700/30 text-white"
        : "text-gray-300 hover:bg-background-light hover:text-white"
    }`}
  >
    <FontAwesomeIcon icon={icon} className={active ? "text-primary-400" : ""} />
    <span>{label}</span>
  </Link>
);

const DashboardLayout = ({ type }) => {
  const { logout, user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(
    "DashboardLayout rendered with type:",
    type,
    "user:",
    user,
    "isAuthenticated:",
    isAuthenticated,
    "path:",
    location.pathname
  );

  // Check if user role matches layout type
  React.useEffect(() => {
    if (user && type) {
      console.log(
        `Checking if user role (${user.role}) matches layout type (${type})`
      );
      if (type === "company" && user.role !== "company") {
        console.log(
          "User is not a company, redirecting to candidate dashboard"
        );
        navigate("/candidate");
      } else if (type === "candidate" && user.role !== "candidate") {
        console.log(
          "User is not a candidate, redirecting to company dashboard"
        );
        navigate("/company");
      }
    }
  }, [user, type, navigate]);

  // Define navigation links based on user type
  const getNavLinks = () => {
    if (type === "candidate") {
      return [
        { to: "/candidate", icon: "tachometer-alt", label: "Dashboard" },
        { to: "/candidate/jobs", icon: "briefcase", label: "Find Jobs" },
        { to: "/candidate/resume", icon: "file-alt", label: "My Resumes" },
        // { to: "/candidate/messages", icon: "envelope", label: "Messages" },
      ];
    } else if (type === "company" || type === "admin") {
      return [
        {
          to: "/company/dashboard",
          icon: "tachometer-alt",
          label: "Dashboard",
        },
        { to: "/company/jobs", icon: "briefcase", label: "Job Management" },
        { to: "/company/candidates", icon: "users", label: "Candidates" },
        // { to: "/company/analytics", icon: "chart-line", label: "Analytics" },
        // { to: "/company/messages", icon: "envelope", label: "Messages" },
        // { to: "/company/profile", icon: "building", label: "Company Profile" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-background-primary">
      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-dark-900 opacity-75"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-background-secondary shadow-custom-dark transition-transform duration-300 transform">
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon="briefcase"
                className="text-primary-500 text-xl mr-2"
              />
              <span className="font-semibold text-white">Medhavi</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <FontAwesomeIcon icon="times" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  active={location.pathname === link.to}
                />
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <FontAwesomeIcon
                  icon={type === "candidate" ? "user" : "building"}
                />
              </div>
              <div className="ml-3">
                <Link
                  to={
                    type === "candidate"
                      ? "/candidate/profile"
                      : "/company/profile"
                  }
                  className="block hover:text-primary-400 transition-colors"
                >
                  <p className="text-sm font-medium text-white hover:text-primary-400">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email || "user@example.com"}
                  </p>
                </Link>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full p-2 text-left text-gray-300 hover:text-white hover:bg-background-light rounded-md"
            >
              <FontAwesomeIcon icon="sign-out-alt" className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 h-0 bg-background-secondary">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-dark-700">
              <FontAwesomeIcon
                icon="briefcase"
                className="text-primary-500 text-xl mr-2"
              />
              <span className="font-semibold text-white">Medhavi</span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <SidebarLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    active={location.pathname === link.to}
                  />
                ))}
              </div>
            </nav>

            {/* User info and logout */}
            <div className="p-4 border-t border-dark-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <FontAwesomeIcon
                    icon={type === "candidate" ? "user" : "building"}
                  />
                </div>{" "}
                <div className="ml-3">
                  <Link
                    to={
                      type === "candidate"
                        ? "/candidate/profile"
                        : "/company/profile"
                    }
                    className="block hover:text-primary-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-white hover:text-primary-400">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.email || "user@example.com"}
                    </p>
                  </Link>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center w-full p-2 text-left text-gray-300 hover:text-white hover:bg-background-light rounded-md"
              >
                <FontAwesomeIcon icon="sign-out-alt" className="mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-background-secondary shadow-custom-dark z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Hamburger menu for mobile */}
              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <FontAwesomeIcon icon="bars" />
              </button>

              {/* Page title - dynamic based on current route */}
              <h1 className="text-lg font-medium text-white">
                {navLinks.find((link) => link.to === location.pathname)
                  ?.label || "Dashboard"}
              </h1>

              {/* User actions */}
              <div className="flex items-center">
                <button className="text-gray-300 hover:text-white p-2">
                  <FontAwesomeIcon icon="bell" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background-primary p-6">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
