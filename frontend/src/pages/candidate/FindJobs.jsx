import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { selectUserInfo } from "../../../src/slices/authSlice";
import { toast } from "react-toastify";
import api from "../../../src/utils/api";
import {
  formatSalary,
  calculateMatchScore,
  fetchJobsWithFilters,
  getMatchScoreStyle,
  formatDate,
} from "../../services/jobService";
import { applyWithScreening } from "../../services/applicationService";

const FindJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    industry: "",
    remote: "all",
    skills: [],
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [matchScores, setMatchScores] = useState({});
  const [calculatingMatch, setCalculatingMatch] = useState(false);
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Add new state for tracking applied jobs
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Define available filter options
  const availableFilters = {
    jobTypes: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
    experienceLevels: [
      "Entry Level",
      "Mid-Level",
      "Senior",
      "Lead",
      "Executive",
    ],
    industries: [
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Marketing",
      "Manufacturing",
      "Retail",
      "Consulting",
      "Media",
      "Non-profit",
    ],
  };
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();

  // Initialize filters with user skills when userInfo changes
  useEffect(() => {
    if (userInfo?.skills?.length > 0) {
      setFilters((prev) => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...userInfo.skills])), // Merge existing and new skills
      }));
    }
  }, [userInfo]);

  // Fetch jobs on component mount and retry if needed
  useEffect(() => {
    fetchJobs();
  }, [retryCount]);
  // Track both applied job IDs and their application IDs
  const [applications, setApplications] = useState(new Map());

  // Fetch user's applications
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await api.get("/applications/candidate");
        // Create a Map of job ID to application data
        const applicationsMap = new Map();
        const appliedJobIds = new Set();

        response.data.forEach((app) => {
          if (app.job?._id) {
            appliedJobIds.add(app.job._id);
            applicationsMap.set(app.job._id, app);
          }
        });

        setApplications(applicationsMap);
        setAppliedJobs(appliedJobIds);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };

    if (userInfo) {
      fetchAppliedJobs();
    }
  }, [userInfo]);

  // Filter jobs when search term or filters change
  useEffect(() => {
    if (Array.isArray(jobs)) {
      filterJobs();
    }
  }, [filters, jobs, searchTerm]);
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs");

      // Determine the structure of the response and extract jobs array
      let jobsData;
      if (Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (Array.isArray(response.data?.jobs)) {
        jobsData = response.data.jobs;
      } else if (typeof response.data === "object" && response.data !== null) {
        jobsData = Object.values(response.data).filter(
          (item) => typeof item === "object"
        );
      } else {
        jobsData = [];
      }

      // Log the raw response and processed jobs for debugging
      console.log("Jobs API response:", response.data);
      console.log("Processed jobs data:", jobsData);

      // Validate and normalize job data
      const normalizedJobs = jobsData
        .map((job) => {
          if (!job) return null;

          // Ensure all jobs have required fields with fallbacks
          return {
            ...job,
            title: job.title || "Untitled Position",
            company: job.company || { companyName: "Unknown Company" },
            description: job.description || "No description available",
            location: job.location || "Location not specified",
            requiredSkills: Array.isArray(job.requiredSkills)
              ? job.requiredSkills
              : [],
          };
        })
        .filter(Boolean); // Remove any null entries

      console.log("Normalized jobs:", normalizedJobs);
      setJobs(normalizedJobs);
      setFilteredJobs(normalizedJobs);

      // Only calculate AI matches if enabled
      if (aiMatchingEnabled && Array.isArray(jobsData)) {
        setCalculatingMatch(true);
        try {
          const resumeResponse = await api.get("/resumes/default");
          const matchResponse = await api.get("/jobs/matching", {
            params: { resumeId: resumeResponse.data._id },
          });

          const matchData = matchResponse.data.reduce((acc, match) => {
            acc[match.jobId] = match.score;
            return acc;
          }, {});
          setMatchScores(matchData);
          toast.success("AI matching completed!");
        } catch (matchError) {
          console.error("Error fetching job matches:", matchError);

          if (matchError.code === "ECONNABORTED" && retryCount < 3) {
            toast.info("Retrying AI match calculation...");
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 2000);
          } else {
            toast.warning(
              "Unable to calculate AI matches. Using basic matching instead."
            );
          }
        } finally {
          setCalculatingMatch(false);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setFilteredJobs([]);
      toast.error(error.response?.data?.message || "Error fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSkillAdd = (skill) => {
    if (!filters.skills.includes(skill)) {
      setFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleSkillRemove = (skill) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };
  const filterJobs = () => {
    // Return early if jobs is not an array or is empty
    if (!Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }

    // Validate job objects to ensure they have required properties
    let validJobs = jobs.filter(
      (job) => job && typeof job === "object" && job._id // Ensure job has an ID
    );

    let result = [...validJobs];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (job) =>
          (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.company?.companyName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (job.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    } // First separate jobs into matching and non-matching based on skills
    // Use both user profile skills and filter skills
    const userSkills = new Set([
      ...(userInfo?.skills || []),
      ...filters.skills,
    ]);

    // Skip skill matching if the user has no skills
    let matchingJobs = [];
    let nonMatchingJobs = [];

    if (userSkills.size > 0) {
      [matchingJobs, nonMatchingJobs] = result.reduce(
        ([matching, nonMatching], job) => {
          // Skip jobs that don't have requiredSkills
          if (
            !job ||
            !Array.isArray(job.requiredSkills) ||
            job.requiredSkills.length === 0
          ) {
            nonMatching.push(job);
            return [matching, nonMatching];
          }

          // Filter out any null or undefined skill entries
          const validJobSkills = job.requiredSkills.filter((skill) => skill);
          if (validJobSkills.length === 0) {
            nonMatching.push(job);
            return [matching, nonMatching];
          }

          const jobSkills = new Set(validJobSkills);

          // Check if any of the job's required skills match the user's skills
          try {
            const hasMatchingSkills = Array.from(jobSkills).some((skill) =>
              Array.from(userSkills).some((userSkill) => {
                if (!skill || !userSkill) return false;
                return (
                  userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(userSkill.toLowerCase())
                );
              })
            );

            if (hasMatchingSkills) {
              matching.push(job);
            } else {
              nonMatching.push(job);
            }
          } catch (error) {
            console.error("Error in skill matching:", error);
            nonMatching.push(job);
          }
          return [matching, nonMatching];
        },
        [[], []]
      );
    } else {
      // If no user skills, treat all jobs as non-matching
      nonMatchingJobs = result;
    } // Apply filters with null checks, ensure we only filter when both filter and job data are valid
    if (filters.location) {
      result = result.filter(
        (job) =>
          job.location &&
          job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      result = result.filter(
        (job) => job.jobType && job.jobType === filters.jobType
      );
    }

    if (filters.experienceLevel) {
      result = result.filter(
        (job) =>
          job.experience && job.experience.level === filters.experienceLevel
      );
    }

    if (filters.salaryMin) {
      result = result.filter(
        (job) =>
          job.salary &&
          job.salary.min &&
          job.salary.min >= parseInt(filters.salaryMin)
      );
    }

    if (filters.salaryMax) {
      result = result.filter(
        (job) =>
          job.salary &&
          job.salary.max &&
          job.salary.max <= parseInt(filters.salaryMax)
      );
    }

    if (filters.industry) {
      result = result.filter(
        (job) => job.industry && job.industry === filters.industry
      );
    }

    if (filters.remote !== "all") {
      result = result.filter(
        (job) => job.workType && job.workType === filters.remote
      );
    }

    if (filters.skills.length > 0) {
      result = result.filter(
        (job) =>
          Array.isArray(job.requiredSkills) &&
          filters.skills.every(
            (skill) =>
              skill &&
              job.requiredSkills.some(
                (jobSkill) =>
                  jobSkill &&
                  jobSkill.toLowerCase().includes(skill.toLowerCase())
              )
          )
      );
    }

    // Within each group (matching and non-matching), sort by match score
    matchingJobs.sort(
      (a, b) => calculateMatchScore(b) - calculateMatchScore(a)
    );
    nonMatchingJobs.sort(
      (a, b) => calculateMatchScore(b) - calculateMatchScore(a)
    );

    // Combine the sorted groups, with matching jobs first
    result = [...matchingJobs, ...nonMatchingJobs];

    setFilteredJobs(result);
  };
  const calculateMatchScore = (job) => {
    // If AI matching is enabled and we have an AI score, use it
    if (aiMatchingEnabled && matchScores[job._id]) {
      return matchScores[job._id];
    }

    // Otherwise calculate basic match score
    const weights = {
      skills: 0.35,
      location: 0.15,
      experience: 0.2,
      industry: 0.1,
      workType: 0.1,
    };

    let score = 0;

    // Skills match
    if (filters.skills.length > 0 && Array.isArray(job.requiredSkills)) {
      const matchedSkills = filters.skills.filter((skill) =>
        job.requiredSkills.some((jobSkill) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      score +=
        (matchedSkills.length / filters.skills.length) * weights.skills * 100;
    }

    // Location match
    if (filters.location && job.location) {
      if (job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        score += weights.location * 100;
      }
    }

    // Industry match
    if (filters.industry && job.industry) {
      if (job.industry === filters.industry) {
        score += weights.industry * 100;
      }
    }

    // Work type match
    if (filters.remote !== "all" && job.workType) {
      if (job.workType === filters.remote) {
        score += weights.workType * 100;
      }
    }
    return Math.round(score);
  };

  const renderMatchScore = (job) => {
    // If we're calculating matches, show a loading indicator
    if (calculatingMatch) {
      return (
        <div className="text-sm text-gray-500 italic">Calculating match...</div>
      );
    }

    // Calculate the match score for this job
    const score = calculateMatchScore(job);

    // Return a default score if calculation fails
    if (!score && score !== 0) {
      return <div className="text-sm text-gray-500">No match data</div>;
    }

    let colorClass = "text-red-500";
    if (score >= 85) colorClass = "text-green-500"; // High match (85%+)
    else if (score >= 70) colorClass = "text-yellow-500"; // Good match (70-84%)
    else if (score >= 50) colorClass = "text-orange-500"; // Moderate match (50-69%)

    return (
      <div className={`text-sm font-semibold ${colorClass}`}>
        {score}% Match
      </div>
    );
  }; // Format salary range with currency
  const formatSalary = (salaryObj) => {
    if (!salaryObj || !salaryObj.min || !salaryObj.max || !salaryObj.currency)
      return "Salary not specified";

    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: salaryObj.currency || "INR",
        maximumFractionDigits: 0,
      });

      return `${formatter.format(salaryObj.min)} - ${formatter.format(
        salaryObj.max
      )}`;
    } catch (error) {
      console.error("Error formatting salary:", error);
      return `${salaryObj.min} - ${salaryObj.max} ${
        salaryObj.currency || "INR"
      }`;
    }
  };
  const handleApply = async (job) => {
    try {
      if (!job || !job._id) {
        toast.error("Invalid job data. Please refresh the page and try again.");
        return;
      }

      // Set the selected job and open the application modal
      setSelectedJob(job);
      setApplying(true);
    } catch (error) {
      console.error("Error preparing application:", error);
      toast.error("Failed to prepare application form");
    }
  };

  // New function to handle the actual submission
  const handleSubmitApplication = async () => {
    if (!selectedJob || !selectedJob._id) {
      toast.error("Invalid job selection");
      return;
    }

    // Validate all required fields first
    const coverLetterInput = document.getElementById("cover-letter");
    const coverLetter = coverLetterInput ? coverLetterInput.value.trim() : "";

    // Collect and validate screening responses
    const invalidQuestions = [];
    const screeningResponses =
      selectedJob.screeningQuestions?.map((question, index) => {
        const responseInput = document.getElementById(`screening-${index}`);
        const response = responseInput ? responseInput.value.trim() : "";

        if (question.required && !response) {
          invalidQuestions.push(question.question);
        }

        return {
          question: question._id,
          response: response,
        };
      }) || [];

    if (invalidQuestions.length > 0) {
      toast.error(
        "Please answer all required questions:\n" + invalidQuestions.join("\n")
      );
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Submitting your application...");

    try {
      const resumeResponse = await api.get("/resumes/default");
      if (!resumeResponse.data?._id) {
        toast.dismiss(loadingToast);
        toast.error("Please create a resume before applying");
        navigate("/candidate/resume");
        return;
      }

      // Submit application with all data
      const response = await applyWithScreening(
        selectedJob._id,
        resumeResponse.data._id,
        coverLetter,
        screeningResponses
      );

      toast.dismiss(loadingToast);

      if (response?._id) {
        toast.success("Application submitted successfully!");

        // Update job counts locally
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j._id === selectedJob._id
              ? { ...j, applicationCount: (j.applicationCount || 0) + 1 }
              : j
          )
        );

        setFilteredJobs((prevFiltered) =>
          prevFiltered.map((j) =>
            j._id === selectedJob._id
              ? { ...j, applicationCount: (j.applicationCount || 0) + 1 }
              : j
          )
        );

        // Close modal
        setApplying(false);
        setSelectedJob(null);

        // Navigate to application detail
        navigate(`/candidate/applications/${response._id}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Application error:", error);

      // Handle specific error cases
      if (
        error.message?.includes("already applied") ||
        error.response?.data?.message?.includes("already applied")
      ) {
        toast.error(
          "You have already submitted an application for this position. You can view your application status in your dashboard.",
          {
            autoClose: 5000,
          }
        );
        setTimeout(async () => {
          setApplying(false);
          setSelectedJob(null);

          try {
            // Refresh applications list to include the new application
            const response = await api.get("/applications/candidate");
            const newApplicationsMap = new Map();
            const newAppliedJobIds = new Set();

            response.data.forEach((app) => {
              if (app.job?._id) {
                newAppliedJobIds.add(app.job._id);
                newApplicationsMap.set(app.job._id, app);
              }
            });

            setApplications(newApplicationsMap);
            setAppliedJobs(newAppliedJobIds);

            navigate("/candidate/applications");
          } catch (refreshError) {
            console.error("Error refreshing applications:", refreshError);
            // Still navigate even if refresh fails
            navigate("/candidate/applications");
          }
        }, 2000);
      } else if (error.response?.status === 404) {
        toast.error("Job posting no longer available");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to submit application"
        );
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          {/* AI Matching Toggle */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={aiMatchingEnabled}
                onChange={(e) => {
                  setAiMatchingEnabled(e.target.checked);
                  fetchJobs(); // Refetch jobs with AI matching if enabled
                }}
                className="form-checkbox"
              />
              <span>Enable AI Matching</span>
            </label>
            {calculatingMatch && (
              <div className="text-sm text-gray-600 mt-1">
                Calculating AI matches...
              </div>
            )}
          </div>

          {/* Location filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter location"
            />
          </div>

          {/* Industry filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, industry: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Industries</option>
              {availableFilters.industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Remote work filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Type
            </label>
            <select
              value={filters.remote}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, remote: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Skills filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {skill}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== index),
                      }))
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a skill"
              className="w-full px-3 py-2 border rounded-md mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  setFilters((prev) => ({
                    ...prev,
                    skills: [...prev.skills, e.target.value.trim()],
                  }));
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>

        {/* Jobs list */}
        <div className="w-full md:w-3/4">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <FontAwesomeIcon
                icon="search"
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search jobs by title, company, or keywords..."
              />
            </div>
          </div>{" "}
          {/* AI Matching Button */}
          {userInfo && !aiMatchingEnabled && (
            <div className="mb-6 text-center">
              <button
                onClick={() => setAiMatchingEnabled(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <FontAwesomeIcon icon="robot" />
                Calculate AI Match Score
              </button>
            </div>
          )}
          {/* AI Matching Progress */}
          {calculatingMatch && (
            <div className="mb-6 flex items-center justify-center gap-3 text-primary-600">
              <FontAwesomeIcon icon="spinner" spin />
              <span>Calculating AI match scores...</span>
            </div>
          )}
          {/* Jobs grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FontAwesomeIcon
                icon="spinner"
                spin
                size="2x"
                className="text-blue-500"
              />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-700">
              <FontAwesomeIcon
                icon="search"
                className="text-gray-400 text-5xl mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) =>
                job && job._id ? (
                  <div
                    key={job._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title || "Untitled Position"}
                        </h3>
                        <p className="text-gray-600">
                          {job.company?.companyName || "Unknown Company"}
                        </p>
                      </div>
                      {renderMatchScore(job)}
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700">
                        {job.description || "No description available."}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.requiredSkills && job.requiredSkills.length > 0 ? (
                          job.requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No skills specified
                          </span>
                        )}
                      </div>
                    </div>{" "}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span>{job.location || "Remote/Flexible"}</span>
                        {job.salary &&
                        job.salary.min &&
                        job.salary.max &&
                        job.salary.currency ? (
                          <span className="ml-2 pl-2 border-l">
                            {formatSalary(job.salary)}
                          </span>
                        ) : (
                          <span className="ml-2 pl-2 border-l">
                            Salary not specified
                          </span>
                        )}
                      </div>{" "}
                      {appliedJobs.has(job._id) ? (
                        <button
                          onClick={() => {
                            const application = applications.get(job._id);
                            if (application?._id) {
                              navigate(
                                `/candidate/applications/${application._id}`
                              );
                            } else {
                              // Fallback to applications list if specific ID not found
                              navigate("/candidate/applications");
                              toast.info("Loading your applications...");
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          View Application
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(job)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>{" "}
      {/* Application Modal */}
      {applying && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">
              Apply for {selectedJob.title}
            </h2>

            <div className="mb-6">
              <p className="text-gray-700">
                {selectedJob.description || "No description available."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Company:</span>{" "}
                  {selectedJob.company?.companyName}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {selectedJob.location || "Remote"}
                </div>
                <div>
                  <span className="font-medium">Experience:</span>{" "}
                  {selectedJob.experience || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Job Type:</span>{" "}
                  {selectedJob.jobType || "Full-time"}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <h3 className="text-lg font-semibold mb-3">
                Cover Letter (Optional)
              </h3>
              <textarea
                id="cover-letter"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a personalized message to the employer..."
              ></textarea>
            </div>

            {/* Screening Questions Section */}
            {selectedJob.screeningQuestions &&
              selectedJob.screeningQuestions.length > 0 && (
                <div className="border-t border-gray-200 my-4 pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Screening Questions
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please answer the following questions to complete your
                    application. Questions marked with * are required.
                  </p>

                  <div className="space-y-4">
                    {selectedJob.screeningQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <label className="block text-gray-700 font-medium mb-2">
                          {index + 1}. {question.question}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {question.expectedResponseType === "multiline" ? (
                          <textarea
                            id={`screening-${index}`}
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                            required={question.required}
                          ></textarea>
                        ) : question.expectedResponseType === "choice" &&
                          question.choices?.length > 0 ? (
                          <select
                            id={`screening-${index}`}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required={question.required}
                          >
                            <option value="">Select an answer...</option>
                            {question.choices.map((choice, idx) => (
                              <option key={idx} value={choice}>
                                {choice}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            id={`screening-${index}`}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                            required={question.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={() => setApplying(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindJobs;
