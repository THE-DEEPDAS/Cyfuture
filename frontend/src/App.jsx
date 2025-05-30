import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import JobListingPage from './pages/JobListingPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CreateJobPage from './pages/CreateJobPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import ChatPage from './pages/ChatPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SavedJobsPage from './pages/SavedJobsPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Components
import PrivateRoute from './components/auth/PrivateRoute';
import EmployerRoute from './components/auth/EmployerRoute';
import AdminRoute from './components/auth/AdminRoute';

// Actions
import { checkAuth } from './redux/actions/authActions';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-900 text-gray-100">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobListingPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />

              {/* Private Routes (Any authenticated user) */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/resume-upload" element={<ResumeUploadPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
                <Route path="/saved-jobs" element={<SavedJobsPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Route>

              {/* Employer Routes */}
              <Route element={<EmployerRoute />}>
                <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
                <Route path="/employer/jobs/create" element={<CreateJobPage />} />
                <Route path="/employer/jobs/:id/edit" element={<CreateJobPage />} />
                <Route path="/employer/jobs/:id/applications" element={<ApplicationsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              </Route>

              {/* Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;