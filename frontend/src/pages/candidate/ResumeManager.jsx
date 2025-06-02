import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFileUpload,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faFilePdf,
  faFileWord,
  faTrash,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { uploadToCloudinary } from "../../utils/cloudinary";

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const navigate = useNavigate();

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadProgress(0);

      // First upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      setUploadProgress(100);

      // Then send to our backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.split(".")[0]);
      formData.append("cloudinaryUrl", cloudinaryUrl);

      const response = await api.post("/api/resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update resumes list and show parsed data
      setResumes((prev) => [...prev, response.data]);
      setParsedData(response.data.parsedData);

      // Show success message
      setError("Resume uploaded successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Error uploading resume");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/resumes");
        setResumes(response.data);
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  // Set default resume
  const handleSetDefault = async (resumeId) => {
    try {
      await api.patch(`/api/resumes/${resumeId}/default`);
      setResumes((prev) =>
        prev.map((resume) => ({
          ...resume,
          isDefault: resume._id === resumeId,
        }))
      );
    } catch (error) {
      console.error("Error setting default resume:", error);
      setError("Failed to set default resume");
    }
  };

  // Delete resume
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/api/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((resume) => resume._id !== resumeId));
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get icon for file type
  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return faFilePdf;
      case "docx":
        return faFileWord;
      default:
        return faFileAlt;
    }
  };

  return (
    <div className="max-w 4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Resume Manager</h1>
        <Link
          to="/candidate/profile"
          className="text-blue-600 hover:text-blue-700"
        >
          View Profile
        </Link>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
      >
        <input {...getInputProps()} />
        <FontAwesomeIcon
          icon={uploading ? faSpinner : faFileUpload}
          className={`text-4xl mb-4 ${
            uploading ? "animate-spin" : ""
          } text-gray-400`}
        />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop your resume here..."
            : "Drag and drop your resume here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports PDF and DOCX files
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div
          className={`p-4 rounded-lg ${
            error.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      {/* Resumes List */}
      {loading ? (
        <div className="text-center py-8">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-3xl text-gray-400"
          />
          <p className="text-gray-600 mt-2">Loading resumes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 relative"
            >
              {resume.isDefault && (
                <div className="absolute top-4 right-4">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                </div>
              )}
              <div className="flex items-start space-x-4">
                <FontAwesomeIcon
                  icon={getFileIcon(resume.fileType)}
                  className="text-2xl text-gray-400"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {resume.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Updated {formatDate(resume.updatedAt)}
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => handleSetDefault(resume._id)}
                      disabled={resume.isDefault}
                      className={`text-sm ${
                        resume.isDefault
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      Set as Default
                    </button>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Parsed Resume Data
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {parsedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Experience</h3>
              <div className="mt-2 space-y-4">
                {parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <div className="mt-2 space-y-4">
                {parsedData.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium text-gray-900">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {project.description}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeManager;
