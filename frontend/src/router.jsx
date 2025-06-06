import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayout from "./layouts/DashboardLayout";
import CandidateDashboard from "./pages/candidate/Dashboard";
import CompanyDashboard from "./pages/company/Dashboard";
import FindJobs from "./pages/candidate/FindJobs";
import JobPostings from "./pages/company/JobPostings";
import Profile from "./pages/common/Profile";
import ResumeManager from "./pages/candidate/ResumeManager";
import ResumeProfile from "./pages/candidate/ResumeProfile";
import CandidateMessages from "./pages/candidate/Messages";
import CompanyMessages from "./pages/company/Messages";
import CandidateReview from "./pages/company/CandidateReview";
import CandidateAnalysis from "./pages/company/CandidateAnalysis";
import CompanyAnalytics from "./pages/company/Analytics";
import ApplicationForm from "./pages/candidate/ApplicationForm";
import ApplicationDetail from "./pages/candidate/ApplicationDetail";
import CompanyApplicationDetail from "./pages/company/ApplicationDetail";
import ProtectedRoute from "./components/common/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/candidate",
    element: <ProtectedRoute role="candidate" />,
    children: [
      {
        element: <DashboardLayout type="candidate" />,
        children: [
          { index: true, element: <CandidateDashboard /> },
          { path: "jobs", element: <FindJobs /> },
          { path: "profile", element: <Profile /> },
          { path: "resume", element: <ResumeManager /> },
          { path: "resume-profile", element: <ResumeProfile /> },
          { path: "resume-profile/:resumeId", element: <ResumeProfile /> },
          { path: "messages", element: <CandidateMessages /> },
          { path: "jobs/:jobId/apply", element: <ApplicationForm /> },
          { path: "applications/:id", element: <ApplicationDetail /> },
        ],
      },
    ],
  },
  {
    path: "/company",
    element: <ProtectedRoute role="company" />,
    children: [
      {
        element: <DashboardLayout type="company" />,
        children: [
          { index: true, element: <CompanyDashboard /> },
          { path: "dashboard", element: <CompanyDashboard /> },
          { path: "jobs", element: <JobPostings /> },
          { path: "jobs/create", element: <JobPostings /> },
          { path: "jobs/:id/edit", element: <JobPostings /> },
          { path: "candidates", element: <CandidateReview /> },
          { path: "candidates/:id/analysis", element: <CandidateAnalysis /> },
          { path: "messages", element: <CompanyMessages /> },
          { path: "analytics", element: <CompanyAnalytics /> },
          { path: "applications/:id", element: <CompanyApplicationDetail /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
