import React from "react";
import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

// Import layouts
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Import pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CandidateDashboard from "./pages/candidate/Dashboard.jsx";
import JobSearch from "./pages/candidate/JobSearch.jsx";
import ResumeManager from "./pages/candidate/ResumeManager.jsx";
import ResumeProfile from "./pages/candidate/ResumeProfile.jsx";
import CandidateMessages from "./pages/candidate/Messages.jsx";
import ApplicationForm from "./pages/candidate/ApplicationForm.jsx";
import ApplicationDetail from "./pages/candidate/ApplicationDetail.jsx";
import CompanyDashboard from "./pages/company/Dashboard.jsx";
import JobPostings from "./pages/company/JobPostings.jsx";
import CandidateReview from "./pages/company/CandidateReview.jsx";
import CompanyMessages from "./pages/company/Messages.jsx";
import CompanyAnalytics from "./pages/company/Analytics.jsx";
import CandidateAnalysis from "./pages/company/CandidateAnalysis.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Add FontAwesome icons to library
library.add(fas, far, fab);

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Candidate routes */}
        <Route element={<ProtectedRoute role="candidate" />}>
          <Route element={<DashboardLayout type="candidate" />}>
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/candidate/jobs" element={<JobSearch />} />
            <Route path="/candidate/resume" element={<ResumeManager />} />
            <Route
              path="/candidate/resume-profile"
              element={<ResumeProfile />}
            />
            <Route
              path="/candidate/resume-profile/:resumeId"
              element={<ResumeProfile />}
            />
            <Route path="/candidate/messages" element={<CandidateMessages />} />
            <Route
              path="/candidate/jobs/:jobId/apply"
              element={<ApplicationForm />}
            />
            <Route
              path="/candidate/applications/:id"
              element={<ApplicationDetail />}
            />
          </Route>
        </Route>

        {/* Company routes */}
        <Route element={<ProtectedRoute role="company" />}>
          <Route element={<DashboardLayout type="company" />}>
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/jobs" element={<JobPostings />} />
            <Route path="/company/candidates" element={<CandidateReview />} />
            <Route
              path="/company/candidates/:id/analysis"
              element={<CandidateAnalysis />}
            />
            <Route path="/company/messages" element={<CompanyMessages />} />
            <Route path="/company/analytics" element={<CompanyAnalytics />} />
          </Route>
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
