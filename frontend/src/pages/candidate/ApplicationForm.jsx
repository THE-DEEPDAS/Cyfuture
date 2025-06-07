import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getJobDetails } from "../../actions/jobActions";
import { getCandidateResumes } from "../../actions/resumeActions";
import { submitJobApplication } from "../../actions/applicationActions";
import Loading from "../../components/common/Loading";
import Message from "../../components/common/Message";
import ChatbotAssistant from "../../components/common/ChatbotAssistant";

const ApplicationForm = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedResume, setSelectedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [chatbotResponses, setChatbotResponses] = useState([]);
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Redux state
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading: jobLoading, error: jobError, job } = jobDetails;

  const candidateResumes = useSelector((state) => state.candidateResumes);
  const {
    loading: resumesLoading,
    error: resumesError,
    resumes,
  } = candidateResumes;

  const applicationSubmit = useSelector((state) => state.applicationSubmit);
  const {
    loading: submitLoading,
    error: submitError,
    success: submitSuccess,
  } = applicationSubmit;

  // Load job details and candidate's resumes
  useEffect(() => {
    dispatch(getJobDetails(jobId));
    dispatch(getCandidateResumes());
  }, [dispatch, jobId]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!selectedResume) {
      errors.resume = "Please select a resume";
    }

    if (!coverLetter.trim()) {
      errors.coverLetter = "Cover letter is required";
    } else if (coverLetter.length < 150) {
      errors.coverLetter = "Cover letter must be at least 150 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        submitJobApplication({
          jobId,
          resumeId: selectedResume,
          coverLetter,
          responses: chatbotResponses,
        })
      );
    } catch (error) {
      if (
        error?.response?.data?.message
          ?.toLowerCase()
          .includes("already applied")
      ) {
        toast.error(
          "You have already submitted an application for this position. You can view your application status in your dashboard.",
          {
            autoClose: 5000,
          }
        );
        setTimeout(() => {
          navigate("/candidate/applications");
        }, 2000);
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading states
  if (jobLoading || resumesLoading) {
    return <Loading />;
  }

  if (jobError || resumesError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Message variant="error">
          {jobError || resumesError}
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Go Back
          </button>
        </Message>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Message variant="error">
          Job not found
          <button
            onClick={() => navigate("/jobs")}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse Jobs
          </button>
        </Message>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Application Progress
          </span>
          <span className="text-sm font-medium text-primary-400">
            Step {step} of 3
          </span>
        </div>
        <div className="bg-background-secondary rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-background-secondary rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-400">{job.company?.name}</p>
        </div>

        {submitError && <Message variant="error">{submitError}</Message>}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Resume Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Select Resume
                </h2>
                {resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon
                      icon="file-upload"
                      className="text-4xl text-gray-400 mb-4"
                    />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No Resumes Found
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Upload a resume to start applying for jobs
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/candidate/resume")}
                      className="btn btn-primary"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes.map((resume) => (
                      <div
                        key={resume._id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedResume === resume._id
                            ? "border-primary-500 bg-primary-900/20"
                            : "border-gray-700 hover:border-primary-500/50"
                        }`}
                        onClick={() => setSelectedResume(resume._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white">
                              {resume.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Last updated:{" "}
                              {new Date(resume.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {selectedResume === resume._id && (
                            <FontAwesomeIcon
                              icon="check-circle"
                              className="text-primary-500 text-xl"
                            />
                          )}
                        </div>
                        {selectedResume === resume._id && (
                          <div className="mt-3 text-sm text-gray-400">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong className="text-gray-300">
                                  Skills:
                                </strong>{" "}
                                {resume.parsedData?.skills
                                  ?.slice(0, 3)
                                  .join(", ")}
                                {resume.parsedData?.skills?.length > 3 && "..."}
                              </div>
                              <div>
                                <strong className="text-gray-300">
                                  Experience:
                                </strong>{" "}
                                {resume.parsedData?.experience?.length} years
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedResume}
                  className="btn btn-primary"
                >
                  Next: Cover Letter
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Cover Letter
                </h2>
                <div className="mb-4 p-4 bg-background-light rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Tips for a Great Cover Letter
                  </h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li>Address why you're interested in this specific role</li>
                    <li>Highlight relevant experience and skills</li>
                    <li>Show how you align with the company's values</li>
                    <li>Keep it concise and professional</li>
                  </ul>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a personalized cover letter explaining why you're a great fit for this role..."
                  className="w-full min-h-[200px] bg-background-light rounded-lg border border-gray-700 p-4 text-white resize-y"
                  required
                />
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-400">Minimum: 150 characters</span>
                  <span
                    className={`${
                      coverLetter.length < 150
                        ? "text-error-500"
                        : "text-success-500"
                    }`}
                  >
                    {coverLetter.length} characters
                  </span>
                </div>
                {validationErrors.coverLetter && (
                  <p className="text-error-500 text-sm mt-2">
                    {validationErrors.coverLetter}
                  </p>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-ghost"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={coverLetter.length < 150}
                  className="btn btn-primary"
                >
                  Next: Questions
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Chatbot Questions */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Additional Questions
                </h2>
                <ChatbotAssistant
                  questions={job.chatbotQuestions}
                  onComplete={(responses) => {
                    setChatbotResponses(responses);
                    setPreviewMode(true);
                  }}
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-ghost"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {previewMode && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Review Your Application
                </h2>

                <div className="space-y-6">
                  {/* Resume Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Selected Resume
                    </h3>
                    <p className="text-gray-400">
                      {resumes.find((r) => r._id === selectedResume)?.title}
                    </p>
                  </div>

                  {/* Cover Letter Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cover Letter
                    </h3>
                    <div className="bg-background-light rounded p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Responses Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Your Responses
                    </h3>
                    <div className="space-y-4">
                      {chatbotResponses.map((response, index) => (
                        <div
                          key={index}
                          className="bg-background-light rounded p-4"
                        >
                          <p className="text-sm font-medium text-primary-400 mb-1">
                            {response.question}
                          </p>
                          <p className="text-gray-300">{response.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className="btn btn-ghost"
                    >
                      Edit Application
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitLoading}
                    >
                      {" "}
                      {submitLoading ? (
                        <>
                          <Loading size="sm" />
                          <span className="ml-2">Submitting...</span>
                        </>
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
