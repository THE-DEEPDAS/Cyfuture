import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext.jsx";
import JobForm from "../../components/company/JobForm.jsx";
import api from "../../utils/api";
import { toast } from "react-toastify";

const JobPostings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("Fetching company jobs...");
      const response = await api.get("/jobs/company/me");
      console.log("Fetched jobs:", response.data);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setLoading(false);

      // For development, use mock data if API fails
      setJobs([
        {
          _id: "201",
          title: "Frontend Developer",
          description:
            "We are looking for a talented Frontend Developer to join our team...",
          requirements: [
            "3+ years of experience with React",
            "Strong JavaScript skills",
            "CSS expertise",
            "Experience with frontend build tools",
          ],
          location: "New York, NY",
          type: "Full-time",
          experience: "Mid-Level",
          skills: ["React", "JavaScript", "HTML", "CSS", "Webpack"],
          salary: {
            min: 90000,
            max: 120000,
            currency: "USD",
          },
          shortlistCount: 10,
          isActive: true,
          applicationCount: 32,
          createdAt: "2025-03-10T08:00:00Z",
          expiresAt: "2025-04-10T23:59:59Z",
        },
        {
          _id: "202",
          title: "Backend Developer",
          description:
            "Join our backend team to build scalable and robust APIs...",
          requirements: [
            "Experience with Node.js",
            "Knowledge of database systems",
            "Understanding of RESTful APIs",
            "Basic DevOps knowledge",
          ],
          location: "Remote",
          type: "Full-time",
          experience: "Mid-Level",
          skills: ["Node.js", "Express", "MongoDB", "REST API", "Docker"],
          salary: {
            min: 85000,
            max: 115000,
            currency: "USD",
          },
          shortlistCount: 8,
          isActive: true,
          applicationCount: 28,
          createdAt: "2025-03-08T10:30:00Z",
          expiresAt: "2025-04-08T23:59:59Z",
        },
      ]);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining until expiry
  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Initialize new job form
  const initNewJobForm = () => {
    setShowNewJobForm(true);
    setEditingJob(null);
  };

  // Initialize edit job form
  const initEditJobForm = (job) => {
    setEditingJob(job);
    setShowNewJobForm(true);
  };

  // Handle job form save
  const handleJobSave = (savedJob) => {
    if (editingJob) {
      // Update existing job in the list
      setJobs(jobs.map((job) => (job._id === savedJob._id ? savedJob : job)));
    } else {
      // Add new job to the list
      setJobs([savedJob, ...jobs]);
    }
    setShowNewJobForm(false);
    setEditingJob(null);
  };

  // Toggle job active status
  const toggleJobStatus = async (jobId) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      if (!job) return;

      const newStatus = !job.isActive;

      await api.put(`/jobs/${jobId}`, { isActive: newStatus });

      // Update job in state
      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, isActive: newStatus } : j))
      );

      toast.success(
        `Job ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Failed to update job status");
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await api.delete(`/jobs/${jobId}`);

        // Remove job from state
        setJobs(jobs.filter((job) => job._id !== jobId));

        toast.success("Job deleted successfully");
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FontAwesomeIcon
          icon="circle-notch"
          spin
          className="text-4xl text-primary-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white mb-2">Job Postings</h1>
        <p className="text-gray-300">
          Manage your job listings and view applications
        </p>
      </div>

      {/* Action buttons */}
      {!showNewJobForm && (
        <div className="flex justify-end">
          <button
            onClick={initNewJobForm}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors"
          >
            <FontAwesomeIcon icon="plus" className="mr-2" />
            Post New Job
          </button>
        </div>
      )}

      {/* Job form */}
      {showNewJobForm && (
        <JobForm
          job={editingJob}
          onSave={handleJobSave}
          onCancel={() => {
            setShowNewJobForm(false);
            setEditingJob(null);
          }}
        />
      )}

      {/* Jobs list */}
      {!showNewJobForm && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="card hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-white">
                      {job.title}
                    </h3>
                    {!job.isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-dark-700 text-gray-400 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <FontAwesomeIcon
                        icon="map-marker-alt"
                        className="text-primary-500 mr-2"
                      />
                      {job.location}
                    </div>

                    <div className="flex items-center text-gray-300">
                      <FontAwesomeIcon
                        icon="briefcase"
                        className="text-primary-500 mr-2"
                      />
                      {job.type}
                    </div>

                    <div className="flex items-center text-gray-300">
                      <FontAwesomeIcon
                        icon="user-tie"
                        className="text-primary-500 mr-2"
                      />
                      {job.experience}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center text-gray-300">
                    <FontAwesomeIcon
                      icon="clock"
                      className="text-primary-500 mr-2"
                    />
                    Posted on {formatDate(job.createdAt)} - Expires in{" "}
                    {getDaysRemaining(job.expiresAt)} days
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                  <div className="text-white">
                    <span className="font-medium">
                      {job.applicationCount || 0}
                    </span>{" "}
                    applications
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleJobStatus(job._id)}
                      className={`px-3 py-1 rounded-md border transition-colors ${
                        job.isActive
                          ? "border-warning-500 text-warning-500 hover:bg-warning-900/20"
                          : "border-success-500 text-success-500 hover:bg-success-900/20"
                      }`}
                    >
                      {job.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => initEditJobForm(job)}
                      className="px-3 py-1 rounded-md border border-primary-500 text-primary-400 hover:bg-primary-900/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job._id)}
                      className="px-3 py-1 rounded-md border border-error-500 text-error-500 hover:bg-error-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <Link
                    to={`/company/candidates?job=${job._id}`}
                    className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                  >
                    View Candidates
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="bg-background-secondary rounded-lg p-8 text-center">
              <FontAwesomeIcon
                icon="briefcase"
                className="text-4xl text-gray-600 mb-4"
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Job Postings Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Get started by posting your first job to attract candidates.
              </p>
              <button
                onClick={initNewJobForm}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors"
              >
                Post Your First Job
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPostings;
