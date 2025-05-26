import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faBriefcase,
  faFile,
  faEnvelope,
  faCog,
  faSignOutAlt,
  faChartLine,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

/**
 * Dashboard layout with sidebar navigation
 */
const DashboardLayout = ({ children, activePage = 'dashboard', userType = 'candidate' }) => {
  // Different menu items based on user type
  const menuItems = {
    candidate: [
      { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt, link: '/dashboard' },
      { id: 'profile', label: 'My Profile', icon: faUserCircle, link: '/profile' },
      { id: 'applications', label: 'My Applications', icon: faBriefcase, link: '/applications' },
      { id: 'resumes', label: 'My Resumes', icon: faFile, link: '/resumes' },
      { id: 'messages', label: 'Messages', icon: faEnvelope, link: '/messages' },
      { id: 'settings', label: 'Settings', icon: faCog, link: '/settings' },
    ],
    employer: [
      { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt, link: '/employer/dashboard' },
      { id: 'profile', label: 'Company Profile', icon: faUserCircle, link: '/employer/profile' },
      { id: 'jobs', label: 'Job Listings', icon: faBriefcase, link: '/employer/jobs' },
      { id: 'candidates', label: 'Candidates', icon: faUsers, link: '/employer/candidates' },
      { id: 'analytics', label: 'Analytics', icon: faChartLine, link: '/employer/analytics' },
      { id: 'messages', label: 'Messages', icon: faEnvelope, link: '/employer/messages' },
      { id: 'settings', label: 'Settings', icon: faCog, link: '/employer/settings' },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt, link: '/admin/dashboard' },
      { id: 'users', label: 'User Management', icon: faUsers, link: '/admin/users' },
      { id: 'companies', label: 'Companies', icon: faUserCircle, link: '/admin/companies' },
      { id: 'jobs', label: 'Job Listings', icon: faBriefcase, link: '/admin/jobs' },
      { id: 'analytics', label: 'Analytics', icon: faChartLine, link: '/admin/analytics' },
      { id: 'settings', label: 'Settings', icon: faCog, link: '/admin/settings' },
    ]
  };
  
  const navItems = menuItems[userType] || menuItems.candidate;
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            CyFuture
          </span>
        </div>
        
        <div className="flex flex-col justify-between flex-1 overflow-y-auto">
          <nav className="px-2 py-4">
            {navItems.map(item => (
              <a
                key={item.id}
                href={item.link}
                className={`flex items-center px-4 py-3 mt-1 rounded-lg transition-colors ${
                  activePage === item.id 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="mx-4 font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <a
              href="/logout"
              className="flex items-center px-4 py-3 mt-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
              <span className="mx-4 font-medium">Logout</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-500 focus:outline-none">
              <FontAwesomeIcon icon="bars" className="h-6 w-6" />
            </button>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-md sm:ml-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FontAwesomeIcon icon="search" />
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                type="text"
                placeholder="Search..."
              />
            </div>
            
            {/* User Menu */}
            <div className="flex items-center">
              <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
                <FontAwesomeIcon icon="bell" className="h-6 w-6 mx-2" />
              </button>
              <div className="relative ml-4">
                <button className="flex items-center focus:outline-none">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    U
                  </div>
                  <span className="ml-2 text-gray-700">User Name</span>
                  <FontAwesomeIcon icon="chevron-down" className="h-4 w-4 ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
