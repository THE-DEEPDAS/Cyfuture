import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  calculateMatchScore,
  getUserResumeData,
  getLLMMatchAnalysis,
} from "../../utils/jobMatching.js";
import { useNavigate } from "react-router-dom";

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    experience: "",
    salary: "",
  });
  const [jobs, setJobs] = useState([
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "New York, NY",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      experience: "Senior",
      skills: ["React", "TypeScript", "CSS", "HTML", "Redux"],
      description:
        "We are looking for an experienced Frontend Developer to join our team...",
      postedDate: "2025-03-15T10:00:00Z",
      matchScore: 94,
    },
    {
      id: "2",
      title: "Backend Developer",
      company: "DataSystems",
      location: "Remote",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      experience: "Mid-Level",
      skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker"],
      description: "Join our team to build robust backend systems...",
      postedDate: "2025-03-14T15:30:00Z",
      matchScore: 87,
    },
    {
      id: "3",
      title: "Full Stack Developer",
      company: "GrowthStartup",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$130,000 - $160,000",
      experience: "Mid-Level",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL"],
      description:
        "Looking for a talented Full Stack Developer to help us grow...",
      postedDate: "2025-03-12T09:15:00Z",
      matchScore: 91,
    },
    {
      id: "4",
      title: "Mobile App Developer",
      company: "AppWorks",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      experience: "Mid-Level",
      skills: ["React Native", "iOS", "Android", "JavaScript", "Firebase"],
      description: "Join our mobile team to build cutting-edge applications...",
      postedDate: "2025-03-10T14:20:00Z",
      matchScore: 82,
    },
    {
      id: "5",
      title: "UI/UX Designer",
      company: "DesignHub",
      location: "Remote",
      type: "Contract",
      salary: "$70-90/hour",
      experience: "Mid-Level",
      skills: [
        "Figma",
        "Adobe XD",
        "UI Design",
        "User Research",
        "Prototyping",
      ],
      description:
        "We need a creative designer to help us create amazing user experiences...",
      postedDate: "2025-03-08T11:45:00Z",
      matchScore: 76,
    },
    {
      id: "6",
      title: "DevOps Engineer",
      company: "CloudSystems",
      location: "Chicago, IL",
      type: "Full-time",
      salary: "$125,000 - $155,000",
      experience: "Senior",
      skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
      description:
        "Join our DevOps team to build and maintain our cloud infrastructure...",
      postedDate: "2025-03-05T13:30:00Z",
      matchScore: 79,
    },
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedResume, setSelectedResume] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [matchExplanations, setMatchExplanations] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const navigate = useNavigate(); // Add navigate hook

  // Fetch resume data and jobs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingJobs(true);

        // Get resume data
        const resume = await getUserResumeData();
        setResumeData(resume);

        // Fetch jobs from API
        try {
          const response = await axios.get("/api/jobs");
          const jobsData = response.data;

          // Calculate match scores if we have resume data
          if (resume) {
            const jobsWithScores = jobsData.map((job) => ({
              ...job,
              matchScore: calculateMatchScore(job, resume),
            }));

            // Sort by match score (highest first)
            jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
            setJobs(jobsWithScores);
          } else {
            setJobs(jobsData);
          }
        } catch (error) {
          console.error("Error fetching jobs:", error);
          // Keep the sample data if API fails
        }
      } catch (error) {
        console.error("Error initializing job search:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchData();
  }, []);

  // Resumes for the dropdown
  const resumes = [
    { id: "1", title: "Software Developer Resume" },
    { id: "2", title: "Frontend Specialist Resume" },
  ];

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      location: "",
      jobType: "",
      experience: "",
      salary: "",
    });
    setSearchTerm("");
  };

  // Handle job selection
  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    setIsApplying(false);

    // Get detailed match analysis from LLM if not already cached
    if (resumeData && !matchExplanations[job.id]) {
      try {
        const analysis = await getLLMMatchAnalysis(job, resumeData);
        setMatchExplanations((prev) => ({
          ...prev,
          [job.id]: analysis.explanation,
        }));
      } catch (error) {
        console.error("Error getting match analysis:", error);
      }
    }
  };

  // Start application process
  const startApplication = () => {
    setIsApplying(true);
    setSelectedResume(resumes[0]?.id || "");
    setCoverLetter("");
  };

  // Submit application
  const submitApplication = (e) => {
    e.preventDefault();
    alert("Application submitted successfully!");
    setIsApplying(false);
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesLocation =
      !filters.location || job.location.includes(filters.location);
    const matchesJobType = !filters.jobType || job.type === filters.jobType;
    const matchesExperience =
      !filters.experience || job.experience === filters.experience;

    return (
      matchesSearch && matchesLocation && matchesJobType && matchesExperience
    );
  });

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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left sidebar - filters */}
      <div className="lg:w-1/4">
        <div className="card sticky top-24">
          <h2 className="text-xl font-semibold text-white mb-6">Filters</h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Austin">Austin</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="jobType"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">All Levels</option>
                <option value="Entry">Entry</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Salary Range
              </label>
              <select
                id="salary"
                name="salary"
                value={filters.salary}
                onChange={handleFilterChange}
                className="w-full"
              >
                <option value="">Any Salary</option>
                <option value="0-50000">$0 - $50,000</option>
                <option value="50000-100000">$50,000 - $100,000</option>
                <option value="100000-150000">$100,000 - $150,000</option>
                <option value="150000+">$150,000+</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 border border-dark-600 rounded-md text-gray-300 hover:bg-background-light transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Middle section - job list */}
      <div className="lg:w-2/5">
        <div className="card mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs, skills, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <FontAwesomeIcon
              icon="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-background-secondary rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
                selectedJob?.id === job.id ? "ring-2 ring-primary-500" : ""
              }`}
              onClick={() => handleJobSelect(job)}
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-white">{job.title}</h3>
                <span className={getMatchScoreBadge(job.matchScore)}>
                  {job.matchScore}% Match
                </span>
              </div>

              <div className="mt-2 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="building" className="mr-1" />
                {job.company}
              </div>

              <div className="mt-1 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="map-marker-alt" className="mr-1" />
                {job.location}
              </div>

              <div className="mt-1 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="briefcase" className="mr-1" />
                {job.type}
              </div>

              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-1 bg-dark-700 text-gray-400 text-xs rounded-full">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Posted {formatDate(job.postedDate)}
                </span>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-background-secondary rounded-lg p-8 text-center">
              <FontAwesomeIcon
                icon="search"
                className="text-3xl text-gray-500 mb-2"
              />
              <p className="text-gray-400">
                No jobs match your search criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right section - job details */}
      <div className="lg:w-1/3">
        {selectedJob ? (
          <div className="card sticky top-24">
            {isApplying ? (
              <div className="fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Apply for Job
                  </h2>
                  <button
                    onClick={() => setIsApplying(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon="times" />
                  </button>
                </div>

                <form onSubmit={submitApplication} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Resume
                    </label>
                    <select
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="w-full"
                      required
                    >
                      <option value="">Select a resume</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={6}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full"
                      placeholder="Explain why you're a good fit for this position..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 rounded-md text-white font-medium transition-colors"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            ) : (
              <div className="fade-in">
                <div className="flex justify-between mb-1">
                  <h2 className="text-2xl font-semibold text-white">
                    {selectedJob.title}
                  </h2>
                  <span className={getMatchScoreBadge(selectedJob.matchScore)}>
                    {selectedJob.matchScore}% Match
                  </span>
                </div>

                <div className="flex items-center text-lg text-gray-300 mb-4">
                  {selectedJob.company}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon="map-marker-alt"
                      className="text-primary-500 mr-2"
                    />
                    <span className="text-gray-300">
                      {selectedJob.location}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon="briefcase"
                      className="text-primary-500 mr-2"
                    />
                    <span className="text-gray-300">{selectedJob.type}</span>
                  </div>

                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon="money-bill-wave"
                      className="text-primary-500 mr-2"
                    />
                    <span className="text-gray-300">{selectedJob.salary}</span>
                  </div>

                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon="user-tie"
                      className="text-primary-500 mr-2"
                    />
                    <span className="text-gray-300">
                      {selectedJob.experience}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-900/30 text-primary-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match explanation section */}
                {matchExplanations[selectedJob.id] && (
                  <div className="mb-6 p-4 border border-primary-700/30 rounded-lg bg-primary-900/20">
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                      <FontAwesomeIcon
                        icon="chart-bar"
                        className="text-primary-500 mr-2"
                      />
                      Match Analysis
                    </h3>
                    <p className="text-gray-300">
                      {matchExplanations[selectedJob.id]}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300">{selectedJob.description}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Posted {formatDate(selectedJob.postedDate)}
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/candidate/jobs/${selectedJob.id}/apply`)
                    }
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 rounded-md text-white font-medium transition-colors flex items-center justify-center mt-6"
                  >
                    <FontAwesomeIcon icon="paper-plane" className="mr-2" />
                    Apply Now
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FontAwesomeIcon
              icon="file-alt"
              className="text-5xl text-gray-600 mb-4"
            />
            <h3 className="text-lg font-medium text-white">No Job Selected</h3>
            <p className="text-gray-400 mt-2">
              Select a job from the list to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
