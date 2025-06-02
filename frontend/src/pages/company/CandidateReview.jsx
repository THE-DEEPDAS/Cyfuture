import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BulkMessageModal from "../../components/company/BulkMessageModal";

const CandidateReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("job");

  const [selectedJob, setSelectedJob] = useState("all");
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulated loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if testing empty state
        const urlParams = new URLSearchParams(window.location.search);
        const testEmpty = urlParams.get("empty") === "true";

        if (testEmpty) {
          // Empty state for testing
          setJobs([]);
          setApplications([]);
          setLoading(false);
          return;
        }

        // Simulated jobs data
        const jobsData = [
          {
            _id: "201",
            title: "Frontend Developer",
            location: "New York, NY",
            applicants: 32,
          },
          {
            _id: "202",
            title: "Backend Developer",
            location: "Remote",
            applicants: 28,
          },
          {
            _id: "203",
            title: "Full Stack Developer",
            location: "San Francisco, CA",
            applicants: 18,
          },
          {
            _id: "204",
            title: "UX Designer",
            location: "Chicago, IL",
            applicants: 9,
          },
        ];

        // Simulated applications data
        const applicationsData = [
          {
            _id: "1",
            candidate: {
              _id: "101",
              name: "John Smith",
              email: "john.smith@example.com",
              phone: "(555) 123-4567",
            },
            job: {
              _id: "201",
              title: "Frontend Developer",
            },
            resume: {
              _id: "r1",
              fileUrl: "#",
              parsedData: {
                skills: [
                  "JavaScript",
                  "React",
                  "HTML",
                  "CSS",
                  "Redux",
                  "TypeScript",
                ],
                experience: [
                  {
                    title: "Frontend Developer",
                    company: "TechCorp",
                    startDate: "2022-01-01",
                    endDate: null,
                    description:
                      "Developing modern web applications using React",
                  },
                  {
                    title: "Junior Developer",
                    company: "WebSolutions",
                    startDate: "2020-03-01",
                    endDate: "2021-12-31",
                    description: "Worked on various frontend projects",
                  },
                ],
                education: [
                  {
                    institution: "University of Technology",
                    degree: "BS",
                    field: "Computer Science",
                    endDate: "2020-05-01",
                  },
                ],
              },
            },
            coverLetter: "I am excited to apply for this position...",
            matchScore: 92,
            llmRationale:
              "The candidate has strong React skills and relevant experience in frontend development. Their projects demonstrate capability with modern web technologies.",
            status: "shortlisted",
            messages: [
              {
                _id: "m1",
                sender: "company",
                content:
                  "Hi John, we were impressed with your application. Are you available for an interview next week?",
                createdAt: "2025-03-16T10:00:00Z",
              },
              {
                _id: "m2",
                sender: "candidate",
                content:
                  "Hello, yes I am available. I can do Monday or Wednesday afternoon.",
                createdAt: "2025-03-16T10:30:00Z",
              },
            ],
            createdAt: "2025-03-15T10:00:00Z",
          },
          {
            _id: "2",
            candidate: {
              _id: "102",
              name: "Sarah Johnson",
              email: "sarah.johnson@example.com",
              phone: "(555) 987-6543",
            },
            job: {
              _id: "201",
              title: "Frontend Developer",
            },
            resume: {
              _id: "r2",
              fileUrl: "#",
              parsedData: {
                skills: [
                  "JavaScript",
                  "React",
                  "CSS",
                  "SASS",
                  "Webpack",
                  "Jest",
                ],
                experience: [
                  {
                    title: "UI Developer",
                    company: "DesignCo",
                    startDate: "2021-06-01",
                    endDate: null,
                    description: "Creating responsive user interfaces",
                  },
                  {
                    title: "Web Developer",
                    company: "CreativeAgency",
                    startDate: "2019-09-01",
                    endDate: "2021-05-31",
                    description: "Built websites for various clients",
                  },
                ],
                education: [
                  {
                    institution: "Design Institute",
                    degree: "BA",
                    field: "Interactive Design",
                    endDate: "2019-06-01",
                  },
                ],
              },
            },
            coverLetter:
              "I believe my design background and development skills make me a great fit...",
            matchScore: 88,
            llmRationale:
              "The candidate has solid React experience with a good design background, which is valuable for a frontend role. Their portfolio shows clean code and attention to UI details.",
            status: "reviewing",
            messages: [],
            createdAt: "2025-03-14T14:30:00Z",
          },
          {
            _id: "3",
            candidate: {
              _id: "103",
              name: "Michael Brown",
              email: "michael.brown@example.com",
              phone: "(555) 456-7890",
            },
            job: {
              _id: "202",
              title: "Backend Developer",
            },
            resume: {
              _id: "r3",
              fileUrl: "#",
              parsedData: {
                skills: [
                  "Node.js",
                  "Express",
                  "MongoDB",
                  "PostgreSQL",
                  "AWS",
                  "Docker",
                ],
                experience: [
                  {
                    title: "Backend Engineer",
                    company: "DataSystems",
                    startDate: "2020-08-01",
                    endDate: null,
                    description: "Building scalable APIs and microservices",
                  },
                  {
                    title: "Full Stack Developer",
                    company: "TechStart",
                    startDate: "2018-05-01",
                    endDate: "2020-07-31",
                    description:
                      "Worked on both frontend and backend development",
                  },
                ],
                education: [
                  {
                    institution: "Tech University",
                    degree: "MS",
                    field: "Computer Engineering",
                    endDate: "2018-05-01",
                  },
                ],
              },
            },
            coverLetter: "I specialize in building robust backend systems...",
            matchScore: 95,
            llmRationale:
              "The candidate has exceptional experience with Node.js and database technologies that perfectly align with our requirements. Their background in building scalable systems is particularly valuable.",
            status: "shortlisted",
            messages: [],
            createdAt: "2025-03-14T09:15:00Z",
          },
        ];

        setJobs(jobsData);

        // If a job ID is provided in the URL, filter applications for that job
        if (jobId) {
          setSelectedJob(jobId);
          setApplications(
            applicationsData.filter((app) => app.job._id === jobId)
          );
        } else {
          setApplications(applicationsData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for messages
  const formatMessageTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Handle job filter change
  const handleJobFilterChange = (e) => {
    const jobId = e.target.value;
    setSelectedJob(jobId);

    // Simulated API call to filter applications by job
    setLoading(true);
    setTimeout(() => {
      if (jobId === "all") {
        // Get all applications
        setApplications([
          // This would be an API call in a real application
          // For demo purposes, we'll just use our mock data
        ]);
      } else {
        // Filter applications by job ID
        setApplications(applications.filter((app) => app.job._id === jobId));
      }
      setLoading(false);
    }, 500);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Get filtered applications based on status
  const getFilteredApplications = () => {
    if (filterStatus === "all") {
      return applications;
    } else {
      return applications.filter((app) => app.status === filterStatus);
    }
  };

  // View application details
  const viewApplication = (application) => {
    setSelectedApplication(application);
  };

  // Update application status
  const updateStatus = (applicationId, newStatus) => {
    setApplications(
      applications.map((app) =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    if (selectedApplication && selectedApplication._id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
  };

  // Send message to candidate
  const sendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const newMessage = {
      _id: Date.now().toString(),
      sender: "company",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    // Add message to selected application
    const updatedApplication = {
      ...selectedApplication,
      messages: [...selectedApplication.messages, newMessage],
    };

    // Update application in the list
    setApplications(
      applications.map((app) =>
        app._id === selectedApplication._id ? updatedApplication : app
      )
    );

    // Update selected application
    setSelectedApplication(updatedApplication);

    // Clear message input
    setMessageText("");
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

    switch (status) {
      case "pending":
        return `${baseClasses} bg-warning-100 text-warning-800`;
      case "reviewing":
        return `${baseClasses} bg-primary-100 text-primary-800`;
      case "shortlisted":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "rejected":
        return `${baseClasses} bg-error-100 text-error-800`;
      case "hired":
        return `${baseClasses} bg-accent-100 text-accent-800`;
      default:
        return baseClasses;
    }
  };

  // Get match score badge styling
  const getMatchScoreBadge = (score) => {
    const baseClasses = "text-sm font-medium";

    if (score >= 90) {
      return `${baseClasses} text-success-500`;
    } else if (score >= 75) {
      return `${baseClasses} text-primary-500`;
    } else if (score >= 60) {
      return `${baseClasses} text-warning-500`;
    } else {
      return `${baseClasses} text-error-500`;
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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left sidebar - filters */}
      <div className="lg:w-1/4">
        <div className="card sticky top-24">
          <h2 className="text-xl font-semibold text-white mb-6">Filters</h2>

          {jobs.length > 0 ? (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="jobFilter"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Job Posting
                </label>
                <select
                  id="jobFilter"
                  value={selectedJob}
                  onChange={handleJobFilterChange}
                  className="w-full"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} - {job.applicants} applicants
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="statusFilter"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Application Status
                </label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                  className="w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-400 text-sm mb-4">
                You need to create job postings before you can filter
                applications.
              </p>
              <Link
                to="/company/jobs"
                className="text-primary-400 hover:text-primary-300"
              >
                <FontAwesomeIcon icon="plus-circle" className="mr-2" />
                Create Job Posting
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Middle section - applications list */}
      <div className="lg:w-2/5">
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Applications{" "}
              {selectedJob !== "all"
                ? `for ${jobs.find((j) => j._id === selectedJob)?.title}`
                : ""}
            </h2>

            {jobs.length > 0 && selectedJob !== "all" && (
              <button
                onClick={() => setShowBulkMessageModal(true)}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors flex items-center"
              >
                <FontAwesomeIcon icon="envelope" className="mr-2" />
                Bulk Message
              </button>
            )}
          </div>

          {jobs.length > 0 ? (
            <>
              <div className="text-sm text-gray-400 mb-4">
                Showing {getFilteredApplications().length} applications
              </div>

              <div className="space-y-4">
                {getFilteredApplications().length > 0 ? (
                  getFilteredApplications().map((application) => (
                    <div
                      key={application._id}
                      className={`bg-background-secondary rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedApplication?._id === application._id
                          ? "ring-2 ring-primary-500"
                          : ""
                      }`}
                      onClick={() => viewApplication(application)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-white">
                          {application.candidate.name}
                        </h3>
                        <div className="relative group">
                          <span
                            className={getMatchScoreBadge(
                              application.matchScore
                            )}
                          >
                            {application.matchScore}% Match
                          </span>
                          {application.analysisDetails?.summary && (
                            <div className="absolute z-10 right-0 mt-2 w-64 p-3 bg-background-light rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              <div className="text-xs text-white">
                                <strong>Analysis:</strong>{" "}
                                {application.analysisDetails.summary}
                              </div>
                              {application.analysisDetails.strengths?.length >
                                0 && (
                                <div className="mt-2 text-xs">
                                  <strong className="text-success-500">
                                    Strengths:
                                  </strong>{" "}
                                  {application.analysisDetails.strengths[0]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-gray-400 text-sm">
                        {application.job.title}
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Applied {formatDate(application.createdAt)}
                        </span>
                        <span className={getStatusBadge(application.status)}>
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-background-secondary rounded-lg p-6 text-center">
                    <FontAwesomeIcon
                      icon="filter"
                      className="text-3xl text-gray-600 mb-2"
                    />
                    <p className="text-gray-400">
                      No applications found for the selected filters.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-background-secondary rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <FontAwesomeIcon
                  icon="briefcase"
                  className="text-4xl text-gray-600 mb-4"
                />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Job Postings Yet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You need to create job postings before you can review
                  candidates. Once jobs are created, candidates can apply and
                  will appear here.
                </p>
                <Link
                  to="/company/jobs"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon="plus-circle" className="mr-2" />
                  Create Your First Job
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right section - application details */}
      <div className="lg:w-1/3">
        {selectedApplication ? (
          <div className="card sticky top-24 overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedApplication.candidate.name}
                  </h2>
                  <p className="text-gray-400">
                    {selectedApplication.job.title}
                  </p>
                </div>
                <div>
                  <span
                    className={getMatchScoreBadge(
                      selectedApplication.matchScore
                    )}
                  >
                    {selectedApplication.matchScore}% Match
                  </span>
                  <div className="mt-1 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/company/candidates/${selectedApplication._id}/analysis`
                        )
                      }
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      View Full Analysis
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedApplication.resume.parsedData.skills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

              {/* Analysis Summary */}
              {selectedApplication.analysisDetails && (
                <div className="mt-4 p-4 bg-background-secondary rounded-lg">
                  <h3 className="font-medium text-white mb-2">AI Analysis</h3>

                  {selectedApplication.analysisDetails.summary && (
                    <p className="text-gray-300 text-sm mb-3">
                      {selectedApplication.analysisDetails.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedApplication.analysisDetails.strengths?.length >
                      0 && (
                      <div>
                        <h4 className="text-xs font-medium text-success-500 mb-2">
                          Strengths
                        </h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {selectedApplication.analysisDetails.strengths
                            .slice(0, 2)
                            .map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <FontAwesomeIcon
                                  icon="check-circle"
                                  className="text-success-500 mt-0.5 mr-1 flex-shrink-0"
                                />
                                <span>{strength}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {selectedApplication.analysisDetails.gaps?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-warning-500 mb-2">
                          Gaps
                        </h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {selectedApplication.analysisDetails.gaps
                            .slice(0, 2)
                            .map((gap, index) => (
                              <li key={index} className="flex items-start">
                                <FontAwesomeIcon
                                  icon="exclamation-circle"
                                  className="text-warning-500 mt-0.5 mr-1 flex-shrink-0"
                                />
                                <span>{gap}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact info */}
            <div className="p-4 bg-background-secondary rounded-lg mb-6">
              <h3 className="font-medium text-white mb-2">
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon="envelope"
                    className="text-primary-500 mt-1 mr-3"
                  />
                  <span className="text-gray-300">
                    {selectedApplication.candidate.email}
                  </span>
                </div>
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon="phone"
                    className="text-primary-500 mt-1 mr-3"
                  />
                  <span className="text-gray-300">
                    {selectedApplication.candidate.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="font-medium text-white mb-3">Experience</h3>
              <div className="space-y-4">
                {selectedApplication.resume.parsedData.experience.map(
                  (exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary-700 pl-4 ml-2"
                    >
                      <div className="font-medium text-white">{exp.title}</div>
                      <div className="text-gray-300">{exp.company}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(exp.startDate).getFullYear()} -{" "}
                        {exp.endDate
                          ? new Date(exp.endDate).getFullYear()
                          : "Present"}
                      </div>
                      <div className="mt-1 text-sm text-gray-300">
                        {exp.description}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <h3 className="font-medium text-white mb-3">Education</h3>
              <div className="space-y-4">
                {selectedApplication.resume.parsedData.education.map(
                  (edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary-700 pl-4 ml-2"
                    >
                      <div className="font-medium text-white">
                        {edu.degree} in {edu.field}
                      </div>
                      <div className="text-gray-300">{edu.institution}</div>
                      <div className="text-sm text-gray-400">
                        Graduated {new Date(edu.endDate).getFullYear()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* LLM Analysis */}
            <div className="p-4 bg-background-secondary rounded-lg mb-6">
              <h3 className="font-medium text-white mb-2">AI Analysis</h3>
              <p className="text-gray-300 text-sm">
                {selectedApplication.llmRationale}
              </p>
            </div>

            {/* Status controls */}
            <div className="mb-6">
              <h3 className="font-medium text-white mb-3">
                Application Status
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    updateStatus(selectedApplication._id, "pending")
                  }
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedApplication.status === "pending"
                      ? "bg-warning-700/30 text-warning-300"
                      : "bg-background-secondary hover:bg-background-light text-gray-300"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() =>
                    updateStatus(selectedApplication._id, "reviewing")
                  }
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedApplication.status === "reviewing"
                      ? "bg-primary-700/30 text-primary-300"
                      : "bg-background-secondary hover:bg-background-light text-gray-300"
                  }`}
                >
                  Reviewing
                </button>
                <button
                  onClick={() =>
                    updateStatus(selectedApplication._id, "shortlisted")
                  }
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedApplication.status === "shortlisted"
                      ? "bg-success-700/30 text-success-300"
                      : "bg-background-secondary hover:bg-background-light text-gray-300"
                  }`}
                >
                  Shortlist
                </button>
                <button
                  onClick={() =>
                    updateStatus(selectedApplication._id, "rejected")
                  }
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedApplication.status === "rejected"
                      ? "bg-error-700/30 text-error-300"
                      : "bg-background-secondary hover:bg-background-light text-gray-300"
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(selectedApplication._id, "hired")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedApplication.status === "hired"
                      ? "bg-accent-700/30 text-accent-300"
                      : "bg-background-secondary hover:bg-background-light text-gray-300"
                  }`}
                >
                  Hire
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="mb-6">
              <h3 className="font-medium text-white mb-3">Messages</h3>

              <div className="bg-background-secondary rounded-lg p-4 h-60 overflow-y-auto flex flex-col space-y-4">
                {selectedApplication.messages.length > 0 ? (
                  selectedApplication.messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender === "company"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          message.sender === "company"
                            ? "bg-primary-700 text-white"
                            : "bg-dark-700 text-gray-200"
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="mt-4 flex">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-grow rounded-l-md"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-r-md transition-colors"
                >
                  <FontAwesomeIcon icon="paper-plane" />
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <a
                href={selectedApplication.resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-background-secondary hover:bg-background-light rounded-md text-white transition-colors flex items-center"
              >
                <FontAwesomeIcon icon="file-alt" className="mr-2" />
                View Resume
              </a>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    navigate(
                      `/company/candidates/${selectedApplication._id}/analysis`
                    )
                  }
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white transition-colors flex items-center"
                >
                  <FontAwesomeIcon icon="chart-bar" className="mr-2" />
                  View Analysis
                </button>

                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors flex items-center">
                  <FontAwesomeIcon icon="calendar-alt" className="mr-2" />
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <FontAwesomeIcon
              icon="user"
              className="text-5xl text-gray-600 mb-4"
            />
            <h3 className="text-lg font-medium text-white">
              No Candidate Selected
            </h3>
            <p className="text-gray-400 mt-2">
              Select a candidate from the list to view their details
            </p>
          </div>
        )}
      </div>
      {/* Bulk Message Modal */}
      {showBulkMessageModal && selectedJob !== "all" && (
        <BulkMessageModal
          jobId={selectedJob}
          jobTitle={
            jobs.find((j) => j._id === selectedJob)?.title || "Selected Job"
          }
          onClose={() => setShowBulkMessageModal(false)}
          onSuccess={() => {
            setShowBulkMessageModal(false);
            // You could refresh application data here if needed
          }}
        />
      )}
    </div>
  );
};

export default CandidateReview;
