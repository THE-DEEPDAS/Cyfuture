import React, { useState, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import store
import store from "./store";

// Import route guards
import ProtectedRoute from "./components/common/ProtectedRoute";

// Import layouts
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Import pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CandidateDashboard from "./pages/candidate/Dashboard.jsx";
import ResumeManager from "./pages/candidate/ResumeManager.jsx";
import ResumeProfile from "./pages/candidate/ResumeProfile.jsx";
import CandidateMessages from "./pages/candidate/Messages.jsx";
import ApplicationForm from "./pages/candidate/ApplicationForm.jsx";
import ApplicationDetail from "./pages/candidate/ApplicationDetail.jsx";
import CompanyApplicationDetail from "./pages/company/ApplicationDetail.jsx";
import CompanyDashboard from "./pages/company/Dashboard.jsx";
import JobPostings from "./pages/company/JobPostings.jsx";
import CandidateReview from "./pages/company/CandidateReview.jsx";
import CompanyMessages from "./pages/company/Messages.jsx";
import CompanyAnalytics from "./pages/company/Analytics.jsx";
import CandidateAnalysis from "./pages/company/CandidateAnalysis.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Profile from "./pages/candidate/Profile.jsx";
import FindJobs from "./pages/candidate/FindJobs.jsx";

// Add FontAwesome icons to library
library.add(fas, far, fab);

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Candidate routes */}
            <Route
              path="/candidate"
              element={<ProtectedRoute role="candidate" />}
            >
              <Route element={<DashboardLayout type="candidate" />}>
                <Route index element={<CandidateDashboard />} />
                <Route path="jobs" element={<FindJobs />} />
                <Route path="profile" element={<Profile />} />
                <Route path="resume" element={<ResumeManager />} />
                <Route path="resume-profile" element={<ResumeProfile />} />
                <Route
                  path="resume-profile/:resumeId"
                  element={<ResumeProfile />}
                />
                <Route path="messages" element={<CandidateMessages />} />
                <Route path="jobs/:jobId/apply" element={<ApplicationForm />} />
                <Route
                  path="applications/:id"
                  element={<ApplicationDetail />}
                />
              </Route>
            </Route>

            {/* Company/Admin Routes - Company users are admins for their own company */}
            <Route element={<ProtectedRoute role="company" />}>
              <Route element={<DashboardLayout type="company" />}>
                <Route
                  path="/company"
                  element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <CompanyDashboard />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/company/dashboard"
                  element={<CompanyDashboard />}
                />
                <Route path="/company/jobs" element={<JobPostings />} />
                <Route path="/company/jobs/create" element={<JobPostings />} />
                <Route
                  path="/company/jobs/:id/edit"
                  element={<JobPostings />}
                />
                <Route
                  path="/company/candidates"
                  element={<CandidateReview />}
                />
                <Route
                  path="/company/candidates/:id/analysis"
                  element={<CandidateAnalysis />}
                />{" "}
                <Route path="/company/messages" element={<CompanyMessages />} />
                <Route
                  path="/company/analytics"
                  element={<CompanyAnalytics />}
                />{" "}
                <Route
                  path="/company/applications/:id"
                  element={<CompanyApplicationDetail />}
                />
              </Route>
            </Route>

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Provider>
  );
}

export default App;
