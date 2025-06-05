import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

const ResumeProfile = () => {
  const { resumeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        // Try to get data from local storage first
        const savedData = localStorage.getItem("defaultResumeData");
        if (savedData) {
          const parsedSavedData = JSON.parse(savedData);
          console.log("============ LOCAL STORAGE DATA ============");
          console.log("Full data:", parsedSavedData);
          console.log("parsedData:", parsedSavedData?.parsedData);
          console.log("skills:", parsedSavedData?.parsedData?.skills);
          console.log("experience:", parsedSavedData?.parsedData?.experience);
          console.log("projects:", parsedSavedData?.parsedData?.projects);
          console.log("=========================================");
          setResumeData(parsedSavedData);
          setLoading(false);
        }

        // Then fetch fresh data from API
        let response;
        if (resumeId) {
          response = await axios.get(`/api/resumes/${resumeId}`);
        } else {
          response = await axios.get("/api/resumes/default");
        }

        console.log("============ API RESPONSE DATA ============");
        console.log("Full data:", response.data);
        console.log("parsedData:", response.data?.parsedData);
        console.log("skills:", response.data?.parsedData?.skills);
        console.log("experience:", response.data?.parsedData?.experience);
        console.log("projects:", response.data?.parsedData?.projects);
        console.log("=========================================");

        // Update the state and local storage with fresh data
        setResumeData(response.data);
        localStorage.setItem(
          "defaultResumeData",
          JSON.stringify(response.data)
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching resume data:", err);
        setError("Failed to load resume data. Please try again later.");

        // If we haven't already loaded data from local storage
        if (!resumeData) {
          const savedData = localStorage.getItem("defaultResumeData");
          if (savedData) {
            const parsedSavedData = JSON.parse(savedData);
            console.log("Fallback data from localStorage:", parsedSavedData);
            setResumeData(parsedSavedData);
            setError(null);
          }
        }
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId]);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const options = { year: "numeric", month: "short" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon="spinner"
            spin
            className="text-4xl text-blue-600 mb-4"
          />
          <p className="text-gray-600">Loading resume data...</p>
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
            className="text-4xl text-red-600 mb-4"
          />
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/candidate/resume"
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Resume Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
      {/* Header section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Resume Profile
            </h1>
            <p className="text-gray-600">Extracted data from your resume</p>
          </div>
          <Link
            to="/candidate/resume"
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <FontAwesomeIcon icon="arrow-left" className="mr-2" />
            Back to Resume Manager
          </Link>
        </div>
      </div>

      {/* Skills section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon="tools" className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {resumeData?.parsedData?.skills?.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="briefcase" className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">
            Professional Experience
          </h2>
        </div>
        <div className="space-y-6">
          {console.log(
            "Rendering experience section, data:",
            resumeData?.parsedData?.experience
          )}
          {(() => {
            const experienceData = resumeData?.parsedData?.experience;
            console.log("Experience type:", typeof experienceData);

            if (!experienceData) {
              console.log("No experience data found");
              return (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    No experience data extracted from your resume.
                  </p>
                </div>
              );
            }

            const expArray = Array.isArray(experienceData)
              ? experienceData
              : typeof experienceData === "object"
              ? [experienceData]
              : [];

            console.log("Processed experience array:", expArray);

            return expArray.length > 0 ? (
              expArray.map((exp, index) => {
                console.log("Processing exp item:", exp, "at index:", index);

                // Handle both object and string formats
                const expData =
                  typeof exp === "object" && exp !== null
                    ? exp
                    : { title: exp };

                const {
                  title = "",
                  company = "",
                  location = "",
                  description = "",
                  startDate = "",
                  endDate = "",
                } = expData;

                return (
                  <div
                    key={index}
                    className="border-b last:border-0 pb-4 last:pb-0"
                  >
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {company && <p className="text-gray-600 mt-1">{company}</p>}
                    {location && (
                      <p className="text-gray-500 text-sm">{location}</p>
                    )}
                    {(startDate || endDate) && (
                      <p className="text-gray-500 text-sm mt-1">
                        {startDate}
                        {endDate ? ` - ${endDate}` : " - Present"}
                      </p>
                    )}
                    {description && (
                      <p className="mt-2 text-gray-700">{description}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  No experience data extracted from your resume.
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Projects section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="code" className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
        </div>
        <div className="space-y-6">
          {console.log(
            "Rendering projects section, data:",
            resumeData?.parsedData?.projects
          )}
          {(() => {
            const projectsData = resumeData?.parsedData?.projects;
            console.log("Projects type:", typeof projectsData);

            if (!projectsData) {
              console.log("No projects data found");
              return (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    No project data extracted from your resume.
                  </p>
                </div>
              );
            }

            const projArray = Array.isArray(projectsData)
              ? projectsData
              : typeof projectsData === "object"
              ? [projectsData]
              : [];

            console.log("Processed projects array:", projArray);

            return projArray.length > 0 ? (
              projArray.map((project, index) => {
                console.log(
                  "Processing project item:",
                  project,
                  "at index:",
                  index
                );

                // Handle both object and string formats
                const projectData =
                  typeof project === "object" && project !== null
                    ? project
                    : { name: project };

                const {
                  name = "",
                  description = "",
                  technologies = [],
                  url = "",
                } = projectData;

                return (
                  <div
                    key={index}
                    className="border-b last:border-0 pb-4 last:pb-0"
                  >
                    <h3 className="font-semibold text-lg">{name}</h3>
                    {description && (
                      <p className="mt-2 text-gray-700">{description}</p>
                    )}
                    {Array.isArray(technologies) && technologies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Technologies: {technologies.join(", ")}
                        </p>
                      </div>
                    )}
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2"
                      >
                        Project Link
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  No project data extracted from your resume.
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Education section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon
            icon="graduation-cap"
            className="text-blue-600 mr-3"
          />
          <h2 className="text-xl font-semibold text-gray-800">Education</h2>
        </div>
        <div className="space-y-4">
          {resumeData?.parsedData?.education?.map((edu, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-800">
                  {edu.degree} in {edu.field}
                </h3>
                <p className="text-gray-600">{edu.institution}</p>
              </div>
              <div className="text-sm text-gray-600 md:ml-4 whitespace-nowrap">
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </div>
            </div>
          ))}
          {!resumeData?.parsedData?.education?.length && (
            <div className="text-center py-4">
              <p className="text-gray-600">
                No education data extracted from your resume.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeProfile;
