import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { applyForJob } from "../../actions/jobActions";
import Message from "../common/Message";
import Loader from "../common/Loader";
import ErrorBoundary from "../common/ErrorBoundary";

const ApplicationForm = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form state with validation
  const [formState, setFormState] = useState({
    currentQuestionIndex: 0,
    responses:
      job?.screeningQuestions?.map((q) => ({
        question: q._id,
        response: "",
        isValid: !q.required,
      })) || [],
    selectedResume: "",
    isFormValid: false,
  });

  // Get user resumes from Redux
  const userResumes = useSelector((state) => state.userResumes);
  const { loading: resumesLoading, error: resumesError, resumes } = userResumes;

  const jobApplication = useSelector((state) => state.jobApplication);
  const {
    loading: submitLoading,
    error: submitError,
    success,
  } = jobApplication;

  // Validate form whenever responses change
  useEffect(() => {
    validateForm();
  }, [formState.responses, formState.selectedResume]);

  const validateForm = () => {
    if (resumesLoading) return false;

    const isValid =
      formState.selectedResume &&
      (!job?.screeningQuestions?.length ||
        formState.responses.every((response) => response.isValid));

    setFormState((prev) => ({ ...prev, isFormValid: isValid }));
  };

  const validateResponse = (response, question) => {
    if (!question) return true;
    if (!question.required) return true;

    if (question.minLength && response.length < question.minLength) {
      return false;
    }

    if (question.maxLength && response.length > question.maxLength) {
      return false;
    }

    if (question.pattern && !new RegExp(question.pattern).test(response)) {
      return false;
    }

    return response && response.trim() !== "";
  };

  const handleResponseChange = (e) => {
    const response = e.target.value;
    const currentQuestion =
      job?.screeningQuestions?.[formState.currentQuestionIndex];

    if (!currentQuestion) return;

    const isValid = validateResponse(response, currentQuestion);

    const updatedResponses = [...formState.responses];
    updatedResponses[formState.currentQuestionIndex] = {
      ...updatedResponses[formState.currentQuestionIndex],
      response,
      isValid,
    };

    setFormState((prev) => ({
      ...prev,
      responses: updatedResponses,
    }));
  };

  const handleNext = () => {
    const currentResponse = formState.responses[formState.currentQuestionIndex];
    const currentQuestion =
      job?.screeningQuestions?.[formState.currentQuestionIndex];

    if (!currentQuestion) return;

    if (!currentResponse?.isValid) {
      toast.error(
        currentQuestion.validationMessage ||
          "Please provide a valid answer before proceeding."
      );
      return;
    }

    setFormState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  };

  const handleBack = () => {
    setFormState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  };

  const handleResumeSelect = (resumeId) => {
    if (!resumeId) {
      toast.error("Please select a valid resume");
      return;
    }

    setFormState((prev) => ({
      ...prev,
      selectedResume: resumeId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.isFormValid) {
      toast.error("Please complete all required fields before submitting");
      return;
    }

    if (!job?._id) {
      toast.error("Invalid job data");
      return;
    }

    try {
      await dispatch(
        applyForJob({
          jobId: job._id,
          resumeId: formState.selectedResume,
          screeningResponses: formState.responses.map((r) => ({
            question: r.question,
            response: r.response,
          })),
        })
      );
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  if (success) {
    navigate(`/applications/${job._id}/success`);
    return null;
  }

  const currentQuestion =
    job?.screeningQuestions?.[formState.currentQuestionIndex];
  const currentResponse = formState.responses[
    formState.currentQuestionIndex
  ] || { response: "", isValid: true };

  const renderQuestionInput = (question, response) => {
    if (!question) return null;

    switch (question.expectedResponseType) {
      case "choice":
        return (
          <select
            value={response.response}
            onChange={handleResponseChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required={question.required}
          >
            <option value="">Select an answer...</option>
            {question.choices?.map((choice, i) => (
              <option key={i} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );

      case "multiline":
        return (
          <textarea
            value={response.response}
            onChange={handleResponseChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your answer..."
            required={question.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={response.response}
            onChange={handleResponseChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your answer..."
            required={question.required}
          />
        );
    }
  };

  if (!job) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <Message variant="error">
          Invalid job data. Please refresh the page and try again.
        </Message>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={<Message variant="error">Something went wrong</Message>}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto">
        {submitLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <Loader />
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Apply for {job.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={submitLoading}
            >
              <FontAwesomeIcon icon="times" size="lg" />
            </button>
          </div>

          {(submitError || resumesError) && (
            <Message variant="error">{submitError || resumesError}</Message>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume *
              </label>
              {resumesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader size="sm" />
                </div>
              ) : resumes?.length > 0 ? (
                <select
                  value={formState.selectedResume}
                  onChange={(e) => handleResumeSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={submitLoading}
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.title || "Untitled Resume"} (
                      {new Date(resume.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">No resumes found</p>
                  <button
                    type="button"
                    onClick={() => navigate("/resume/upload")}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    disabled={submitLoading}
                  >
                    Upload Resume
                  </button>
                </div>
              )}
            </div>

            {/* Screening Questions */}
            {currentQuestion && (
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      Screening Questions
                      <span className="text-sm text-gray-500 ml-2">
                        {formState.currentQuestionIndex + 1} of{" "}
                        {job.screeningQuestions?.length || 0}
                      </span>
                    </h3>
                    <div className="text-sm text-gray-500">
                      {Math.round(
                        ((formState.currentQuestionIndex + 1) /
                          (job.screeningQuestions?.length || 1)) *
                          100
                      )}
                      % Complete
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((formState.currentQuestionIndex + 1) /
                            (job.screeningQuestions?.length || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div
                  key={formState.currentQuestionIndex}
                  className="space-y-4 animate-fadeIn"
                >
                  <div className="mb-2 flex items-start">
                    <span className="text-gray-800 font-medium">
                      {currentQuestion.question}
                    </span>
                    {currentQuestion.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>

                  {renderQuestionInput(currentQuestion, currentResponse)}

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn-secondary"
                      disabled={
                        formState.currentQuestionIndex === 0 || submitLoading
                      }
                    >
                      <FontAwesomeIcon icon="arrow-left" className="mr-2" />
                      Back
                    </button>

                    {formState.currentQuestionIndex ===
                    (job.screeningQuestions?.length || 0) - 1 ? (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitLoading || !formState.isFormValid}
                      >
                        {submitLoading ? (
                          <Loader size="sm" />
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon="paper-plane"
                              className="mr-2"
                            />
                            Submit Application
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="btn btn-primary"
                        disabled={!currentResponse.isValid || submitLoading}
                      >
                        Next
                        <FontAwesomeIcon icon="arrow-right" className="ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

ApplicationForm.propTypes = {
  job: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApplicationForm;
