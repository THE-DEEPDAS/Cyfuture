import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applyForJob } from '../../actions/jobActions';
import Message from '../common/Message';
import Loader from '../common/Loader';

const ApplicationForm = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(
    job.screeningQuestions?.map(q => ({ question: q._id, response: '' })) || []
  );
  const [selectedResume, setSelectedResume] = useState('');

  const userResumes = useSelector((state) => state.userResumes);
  const { loading: resumesLoading, error: resumesError, resumes } = userResumes;

  const jobApplication = useSelector((state) => state.jobApplication);
  const { loading, error, success } = jobApplication;

  const handleResponseChange = (e) => {
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex].response = e.target.value;
    setResponses(updatedResponses);
  };

  const isCurrentAnswerValid = () => {
    const currentQuestion = job.screeningQuestions[currentQuestionIndex];
    const currentResponse = responses[currentQuestionIndex].response;
    return !currentQuestion.required || (currentResponse && currentResponse.trim() !== '');
  };

  const handleNext = () => {
    if (isCurrentAnswerValid()) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      toast.error('Please answer the required question before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    // Check if all required questions are answered
    const hasUnansweredRequired = job.screeningQuestions.some(
      (q, i) => q.required && (!responses[i].response || !responses[i].response.trim())
    );

    if (hasUnansweredRequired) {
      toast.error('Please answer all required questions');
      return;
    }

    dispatch(applyForJob({
      jobId: job._id,
      resumeId: selectedResume,
      screeningResponses: responses
    }));
  };

  if (success) {
    navigate(`/applications/${job._id}/success`);
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon="times" size="lg" />
          </button>
        </div>

        {error && <Message variant="error">{error}</Message>}
        {resumesError && <Message variant="error">{resumesError}</Message>}

        <div className="prose max-w-none mb-6">
          <p className="text-gray-600">
            Please complete all required questions and select your resume to apply for this position.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resume *
            </label>
            {resumesLoading ? (
              <Loader size="sm" />
            ) : resumes?.length > 0 ? (
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Choose a resume...</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title || 'Untitled Resume'} ({new Date(resume.updatedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">No resumes found</p>
                <button
                  type="button"
                  onClick={() => navigate('/resume/upload')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>

          {/* Screening Questions */}
          {job.screeningQuestions && job.screeningQuestions.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    Screening Questions
                    <span className="text-sm text-gray-500 ml-2">
                      {currentQuestionIndex + 1} of {job.screeningQuestions.length}
                    </span>
                  </h3>
                  <div className="text-sm text-gray-500">
                    {Math.round(((currentQuestionIndex + 1) / job.screeningQuestions.length) * 100)}% Complete
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: \`\${((currentQuestionIndex + 1) / job.screeningQuestions.length) * 100}%\`
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div key={currentQuestionIndex} className="animate-fadeIn">
                  <div className="mb-2 flex items-start">
                    <span className="text-gray-800 font-medium">
                      {job.screeningQuestions[currentQuestionIndex].question}
                    </span>
                    {job.screeningQuestions[currentQuestionIndex].required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  {job.screeningQuestions[currentQuestionIndex].expectedResponseType === 'choice' ? (
                    <select
                      value={responses[currentQuestionIndex].response}
                      onChange={handleResponseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required={job.screeningQuestions[currentQuestionIndex].required}
                    >
                      <option value="">Select an answer...</option>
                      {job.screeningQuestions[currentQuestionIndex].choices.map((choice, i) => (
                        <option key={i} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  ) : job.screeningQuestions[currentQuestionIndex].expectedResponseType === 'multiline' ? (
                    <textarea
                      value={responses[currentQuestionIndex].response}
                      onChange={handleResponseChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your answer..."
                      required={job.screeningQuestions[currentQuestionIndex].required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={responses[currentQuestionIndex].response}
                      onChange={handleResponseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your answer..."
                      required={job.screeningQuestions[currentQuestionIndex].required}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={currentQuestionIndex === 0}
            >
              <FontAwesomeIcon icon="arrow-left" className="mr-2" />
              Back
            </button>

            {currentQuestionIndex < job.screeningQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                disabled={!isCurrentAnswerValid()}
              >
                Next
                <FontAwesomeIcon icon="arrow-right" className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                disabled={loading || !isCurrentAnswerValid()}
              >
                {loading ? (
                  <>
                    <Loader size="sm" light />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    Submit Application
                    <FontAwesomeIcon icon="paper-plane" className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
