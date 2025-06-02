import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const JobForm = ({ job, onSave, onCancel }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "Full-time",
    experience: "Mid-Level",
    skills: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    shortlistCount: 10,
    expiresAt: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If editing an existing job, populate form
    if (job) {
      // Format requirements array to string
      const requirementsString = job.requirements
        ? job.requirements.join("\n")
        : "";

      // Format skills array to string
      const skillsString = job.skills ? job.skills.join(", ") : "";

      // Format date for input field (YYYY-MM-DD)
      const expiryDate = job.expiresAt ? new Date(job.expiresAt) : new Date();
      const formattedDate = expiryDate.toISOString().split("T")[0];

      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: requirementsString,
        location: job.location || "",
        type: job.type || "Full-time",
        experience: job.experience || "Mid-Level",
        skills: skillsString,
        salaryMin: job.salary?.min || "",
        salaryMax: job.salary?.max || "",
        salaryCurrency: job.salary?.currency || "USD",
        shortlistCount: job.shortlistCount || 10,
        expiresAt: formattedDate,
      });
    } else {
      // Initialize with default expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const formattedDate = expiryDate.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        expiresAt: formattedDate,
      }));
    }
  }, [job]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) newErrors.title = "Job title is required";
    if (!formData.description)
      newErrors.description = "Job description is required";
    if (!formData.requirements)
      newErrors.requirements = "Job requirements are required";
    if (!formData.location) newErrors.location = "Job location is required";
    if (!formData.skills) newErrors.skills = "Required skills are required";

    if (!formData.salaryMin) {
      newErrors.salaryMin = "Minimum salary is required";
    } else if (isNaN(formData.salaryMin)) {
      newErrors.salaryMin = "Salary must be a number";
    }

    if (!formData.salaryMax) {
      newErrors.salaryMax = "Maximum salary is required";
    } else if (isNaN(formData.salaryMax)) {
      newErrors.salaryMax = "Salary must be a number";
    } else if (Number(formData.salaryMax) < Number(formData.salaryMin)) {
      newErrors.salaryMax = "Maximum salary cannot be less than minimum salary";
    }

    if (!formData.expiresAt) newErrors.expiresAt = "Expiry date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit job form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert requirements string to array
      const requirementsArray = formData.requirements
        .split("\n")
        .filter((item) => item.trim() !== "");

      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: requirementsArray,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        skills: skillsArray,
        salary: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: formData.salaryCurrency,
        },
        shortlistCount: Number(formData.shortlistCount),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        isActive: true,
      };

      let result;
      if (job?._id) {
        // Update existing job
        result = await axios.put(`/api/jobs/${job._id}`, jobData);
        toast.success("Job updated successfully");
      } else {
        // Create new job
        result = await axios.post("/api/jobs", jobData);
        toast.success("Job posted successfully");
      }

      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card fade-in">
      <h2 className="text-xl font-semibold text-white mb-6">
        {job ? "Edit Job Posting" : "Create New Job Posting"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full ${errors.title ? "border-error-500" : ""}`}
                placeholder="e.g. Frontend Developer"
              />
              {errors.title && (
                <p className="text-error-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full ${
                  errors.location ? "border-error-500" : ""
                }`}
                placeholder="e.g. New York, NY or Remote"
              />
              {errors.location && (
                <p className="text-error-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Job Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full"
              >
                <option value="Entry">Entry</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="salaryMin"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Min Salary
                </label>
                <input
                  type="number"
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.salaryMin ? "border-error-500" : ""
                  }`}
                  placeholder="e.g. 70000"
                />
                {errors.salaryMin && (
                  <p className="text-error-500 text-xs mt-1">
                    {errors.salaryMin}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="salaryMax"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Max Salary
                </label>
                <input
                  type="number"
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.salaryMax ? "border-error-500" : ""
                  }`}
                  placeholder="e.g. 90000"
                />
                {errors.salaryMax && (
                  <p className="text-error-500 text-xs mt-1">
                    {errors.salaryMax}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="salaryCurrency"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Currency
                </label>
                <select
                  id="salaryCurrency"
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="shortlistCount"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Shortlist Limit
                </label>
                <input
                  type="number"
                  id="shortlistCount"
                  name="shortlistCount"
                  value={formData.shortlistCount}
                  onChange={handleChange}
                  className="w-full"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Expiry Date
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className={`w-full ${
                  errors.expiresAt ? "border-error-500" : ""
                }`}
              />
              {errors.expiresAt && (
                <p className="text-error-500 text-xs mt-1">
                  {errors.expiresAt}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Required Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className={`w-full ${errors.skills ? "border-error-500" : ""}`}
                placeholder="e.g. React, JavaScript, CSS"
              />
              {errors.skills && (
                <p className="text-error-500 text-xs mt-1">{errors.skills}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full ${
                  errors.description ? "border-error-500" : ""
                }`}
                placeholder="Describe the job role, responsibilities, and what you're looking for..."
              ></textarea>
              {errors.description && (
                <p className="text-error-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Requirements (one per line)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="5"
                className={`w-full ${
                  errors.requirements ? "border-error-500" : ""
                }`}
                placeholder="e.g. 3+ years of React experience"
              ></textarea>
              {errors.requirements && (
                <p className="text-error-500 text-xs mt-1">
                  {errors.requirements}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-dark-600 rounded-md text-white hover:bg-background-light transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white transition-colors flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon="circle-notch" spin className="mr-2" />
                {job ? "Updating..." : "Posting..."}
              </>
            ) : job ? (
              "Update Job"
            ) : (
              "Post Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
