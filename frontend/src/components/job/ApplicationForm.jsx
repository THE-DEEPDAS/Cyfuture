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
import ResumeSelector from "../common/ResumeSelector";
import ChatbotAssistant from "../common/ChatbotAssistant";
import api from "../../api";

const ApplicationForm = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedResume: "",
    responses: [],
    chatbotComplete: false,
  });
  const [chatbotAnalysis, setChatbotAnalysis] = useState(null);

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
  }, [formData.responses, formData.selectedResume]);

  const validateForm = () => {
    if (resumesLoading) return false;

    const isValid =
      formData.selectedResume &&
      (!job?.screeningQuestions?.length ||
        formData.responses.every((response) => response.isValid));

    setFormData((prev) => ({ ...prev, isFormValid: isValid }));
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
      job?.screeningQuestions?.[formData.currentQuestionIndex];

    if (!currentQuestion) return;

    const isValid = validateResponse(response, currentQuestion);

    const updatedResponses = [...formData.responses];
    updatedResponses[formData.currentQuestionIndex] = {
      ...updatedResponses[formData.currentQuestionIndex],
      response,
      isValid,
    };

    setFormData((prev) => ({
      ...prev,
      responses: updatedResponses,
    }));
  };

  const handleNext = () => {
    const currentResponse = formData.responses[formData.currentQuestionIndex];
    const currentQuestion =
      job?.screeningQuestions?.[formData.currentQuestionIndex];

    if (!currentQuestion) return;

    if (!currentResponse?.isValid) {
      toast.error(
        currentQuestion.validationMessage ||
          "Please provide a valid answer before proceeding."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  };

  const handleBack = () => {
    setFormData((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  };

  const handleResumeSelect = (resumeId) => {
    if (!resumeId) {
      toast.error("Please select a valid resume");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      selectedResume: resumeId,
    }));
  };

  const handleChatbotComplete = async (responses) => {
    try {
      // Analyze responses using the job's screening criteria
      const analysis = await api.post(`/jobs/${job._id}/analyze-responses`, {
        responses,
        resumeId: formData.selectedResume,
      });

      setChatbotAnalysis(analysis.data);
      setFormData((prev) => ({
        ...prev,
        responses,
        chatbotComplete: true,
      }));

      if (!analysis.data.isRecommended) {
        toast.info(
          "Based on the analysis, this role might not be the best fit. Consider reviewing the job requirements."
        );
      }
    } catch (error) {
      console.error("Chatbot analysis error:", error);
      toast.error("Error analyzing your responses. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedResume) {
      toast.error("Please select a resume");
      return;
    }

    if (!formData.chatbotComplete) {
      toast.error("Please complete the screening questions");
      return;
    }

    try {
      const response = await dispatch(
        applyForJob({
          jobId: job._id,
          resumeId: formData.selectedResume,
          screeningResponses: formData.responses.map((r) => ({
            question: r.question,
            response: r.response,
          })),
          analysis: chatbotAnalysis,
        })
      );

      if (response.success) {
        toast.success("Application submitted successfully!");
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error submitting application"
      );
    }
  };

  if (success) {
    navigate(`/applications/${job._id}/success`);
    return null;
  }

  const currentQuestion =
    job?.screeningQuestions?.[formData.currentQuestionIndex];
  const currentResponse = formData.responses[formData.currentQuestionIndex] || {
    response: "",
    isValid: true,
  };

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
            {step === 1 ? (
              // Resume selection
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
                    value={formData.selectedResume}
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
            ) : (
              // Chatbot screening
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Screening Questions
                </h3>
                {job.screeningQuestions?.length > 0 ? (
                  <ChatbotAssistant
                    questions={job.screeningQuestions}
                    onComplete={handleChatbotComplete}
                    onAnalysisComplete={(responses) =>
                      handleChatbotComplete(responses)
                    }
                    jobTitle={job.title}
                  />
                ) : (
                  <p>No screening questions for this position.</p>
                )}

                {formData.chatbotComplete && (
                  <div className="mt-6">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Submit Application
                    </button>
                  </div>
                )}
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
