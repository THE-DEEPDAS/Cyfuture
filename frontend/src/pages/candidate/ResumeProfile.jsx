import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";

const ResumeProfile = () => {
  const { resumeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        // Get resume data from API
        const response = await api.get(
          resumeId ? `/resumes/${resumeId}` : "/resumes/default"
        );

        console.log("Resume API Response:", {
          fullData: response.data,
          parsedData: response.data?.parsedData,
          skills: response.data?.parsedData?.skills,
          experience: response.data?.parsedData?.experience,
          projects: response.data?.parsedData?.projects,
        });

        // Ensure parsedData exists and has the expected structure
        if (!response.data.parsedData) {
          console.error("Missing parsedData in API response:", response.data);
          response.data.parsedData = {
            skills: [],
            experience: [],
            projects: [],
          };
        }

        // Ensure the experience and projects are in the right format
        let cleanedExperience = [];
        if (Array.isArray(response.data.parsedData.experience)) {
          cleanedExperience = response.data.parsedData.experience
            .filter((exp) => exp && typeof exp === "object")
            .map((exp) => ({
              title: typeof exp.title === "string" ? exp.title : "",
              company: typeof exp.company === "string" ? exp.company : "",
              location: typeof exp.location === "string" ? exp.location : "",
              startDate: typeof exp.startDate === "string" ? exp.startDate : "",
              endDate: exp.endDate ? exp.endDate : "",
              description:
                typeof exp.description === "string" ? exp.description : "",
            }));
        } else if (typeof response.data.parsedData.experience === "string") {
          // If experience is a string (possibly a format issue), create a generic entry
          cleanedExperience = [
            {
              title: "Experience",
              company: "",
              location: "",
              description: response.data.parsedData.experience,
              startDate: "",
              endDate: "",
            },
          ];
        }

        let cleanedProjects = [];
        if (Array.isArray(response.data.parsedData.projects)) {
          cleanedProjects = response.data.parsedData.projects
            .filter((proj) => proj && typeof proj === "object")
            .map((proj) => ({
              name: typeof proj.name === "string" ? proj.name : "",
              description:
                typeof proj.description === "string" ? proj.description : "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies.filter((tech) => typeof tech === "string")
                : [],
              url: typeof proj.url === "string" ? proj.url : "",
            }));
        } else if (typeof response.data.parsedData.projects === "string") {
          // If projects is a string (possibly a format issue), create a generic entry
          cleanedProjects = [
            {
              name: "Project",
              description: response.data.parsedData.projects,
              technologies: [],
              url: "",
            },
          ];
        }

        // Clean up the data before setting it
        const cleanedData = {
          ...response.data,
          parsedData: {
            skills: Array.isArray(response.data.parsedData.skills)
              ? response.data.parsedData.skills.filter(
                  (skill) => typeof skill === "string"
                )
              : [],
            experience: cleanedExperience,
            projects: cleanedProjects,
          },
        };

        console.log("Cleaned resume data:", {
          experience: cleanedData.parsedData.experience,
          projects: cleanedData.parsedData.projects,
        });

        setResumeData(cleanedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching resume data:", err);
        setError("Failed to load resume data. Please try again later.");
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId]);
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "Present";

    try {
      const options = { year: "numeric", month: "short" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString || "Present"; // Return the original string or "Present" if null/undefined
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon="spinner"
            spin
            className="text-4xl text-primary-500 mb-4"
          />
          <p className="text-gray-300">Loading resume data...</p>
        </div>
      </div>
    );
  }

  if (error && !resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon="exclamation-circle"
            className="text-4xl text-error-500 mb-4"
          />
          <p className="text-gray-300 mb-4">{error}</p>
          <Link to="/candidate/resume" className="btn-primary">
            Go to Resume Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Resume Profile
            </h1>
            <p className="text-gray-300">
              Extracted data from: {resumeData.title}
            </p>
          </div>
          <Link to="/candidate/resume" className="btn-secondary">
            <FontAwesomeIcon icon="arrow-left" className="mr-2" />
            Back to Resume Manager
          </Link>
        </div>
      </div>

      {/* Skills section */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon="tools" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Skills</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {resumeData.parsedData.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-primary-900/30 text-primary-300 border border-primary-700/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="briefcase" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">
            Professional Experience
          </h2>
        </div>{" "}
        <div className="space-y-6">
          {Array.isArray(resumeData?.parsedData?.experience) &&
          resumeData.parsedData.experience.length > 0 ? (
            resumeData.parsedData.experience.map((exp, index) => (
              <div
                key={index}
                className="border-l-2 border-primary-700 pl-4 pb-6 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {exp.title || "Role"}
                    </h3>
                    <p className="text-primary-300">
                      {exp.company || "Company"}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-300 mt-2">{exp.description}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">
                No experience data extracted from your resume.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="code" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>{" "}
        <div className="space-y-6">
          {Array.isArray(resumeData?.parsedData?.projects) &&
          resumeData.parsedData.projects.length > 0 ? (
            resumeData.parsedData.projects.map((project, index) => (
              <div
                key={index}
                className="bg-background-secondary rounded-lg p-4"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {project.name || "Project"}
                </h3>
                {project.description && (
                  <p className="text-gray-300 mb-3">{project.description}</p>
                )}
                {Array.isArray(project.technologies) &&
                  project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-0.5 text-xs rounded-full bg-primary-800/30 text-primary-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                {project.url && project.url !== "GitHub" && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon="external-link-alt"
                      className="mr-1"
                    />
                    View Project
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">
                No project data extracted from your resume.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Education section (if available) */}
      {resumeData.parsedData.education &&
        resumeData.parsedData.education.length > 0 && (
          <div className="card">
            <div className="flex items-center mb-6">
              <FontAwesomeIcon
                icon="graduation-cap"
                className="text-primary-500 mr-3"
              />
              <h2 className="text-xl font-semibold text-white">Education</h2>
            </div>

            <div className="space-y-4">
              {resumeData.parsedData.education.map((edu, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-white">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-primary-300">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Match rate info with job requirements */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon
            icon="percentage"
            className="text-primary-500 mr-3"
          />
          <h2 className="text-xl font-semibold text-white">Job Match Rate</h2>
        </div>

        <p className="text-gray-300 mb-4">
          Our system analyzes your resume data against job requirements to
          calculate a match score for each job posting.
        </p>

        <Link
          to="/candidate/jobs"
          className="btn-primary inline-flex items-center"
        >
          <FontAwesomeIcon icon="search" className="mr-2" />
          View Matching Jobs
        </Link>
      </div>
    </div>
  );
};

export default ResumeProfile;
