import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getJobDetails } from '../actions/jobActions';
import { getResumeDetails, addChatbotResponse } from '../actions/resumeActions';
import { applyForJob } from '../actions/jobActions';
import { RESUME_CHATBOT_RESPONSE_RESET } from '../constants/resumeConstants';
import { JOB_APPLICATION_CREATE_RESET } from '../constants/jobConstants';
import { SUPPORTED_LANGUAGES } from '../config';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const ChatbotScreen = () => {
  const { resumeId, jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const chatEndRef = useRef(null);
  
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading: jobLoading, error: jobError, job } = jobDetails;
  
  const resumeDetails = useSelector((state) => state.resumeDetails);
  const { loading: resumeLoading, error: resumeError, resume } = resumeDetails;
  
  const resumeChatbotResponse = useSelector((state) => state.resumeChatbotResponse);
  const { loading: responseLoading, error: responseError, success: responseSuccess } = resumeChatbotResponse;
  
  const jobApplicationCreate = useSelector((state) => state.jobApplicationCreate);
  const { loading: applyLoading, error: applyError, success: applySuccess } = jobApplicationCreate;
  
  // Fetch job and resume details on component mount
  useEffect(() => {
    dispatch({ type: RESUME_CHATBOT_RESPONSE_RESET });
    dispatch({ type: JOB_APPLICATION_CREATE_RESET });
    
    dispatch(getJobDetails(jobId));
    dispatch(getResumeDetails(resumeId));
    
    // Set default language if resume has a preferred language
    if (resume && resume.preferredLanguage) {
      setSelectedLanguage(resume.preferredLanguage);
    }
  }, [dispatch, jobId, resumeId, resume]);
  
  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userResponses, currentQuestion]);
  
  // Navigate to success page when application is submitted
  useEffect(() => {
    if (applySuccess) {
      navigate(`/application-success/${jobId}`);
    }
  }, [navigate, applySuccess, jobId]);
  
  // Get questions from job or use default ones
  const getQuestions = () => {
    if (job && job.chatbotQuestions && job.chatbotQuestions.length > 0) {
      return job.chatbotQuestions;
    }
    
    // Default questions if none are provided by the job
    return [
      { question: 'When are you available to start?', isRequired: true },
      { question: 'Do you have a preferred work location?', isRequired: true },
      { question: 'What are your salary expectations?', isRequired: true },
    ];
  };
  
  const questions = getQuestions();
  
  // Handler for submitting responses to individual questions
  const handleResponseSubmit = async () => {
    if (!currentResponse.trim() && questions[currentQuestion].isRequired) {
      return; // Don't submit empty responses for required questions
    }
    
    const newResponses = [...userResponses];
    newResponses[currentQuestion] = currentResponse;
    setUserResponses(newResponses);
    
    // Save response to the backend
    await dispatch(addChatbotResponse(
      resumeId,
      questions[currentQuestion].question,
      currentResponse,
      selectedLanguage
    ));
    
    setCurrentResponse('');
    
    // Move to next question or finish chatbot interaction
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, submit application
      setIsSubmitting(true);
      dispatch(applyForJob(jobId, resumeId));
    }
  };
  
  // Handler for pressing Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleResponseSubmit();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Application</h1>
        
        {(jobLoading || resumeLoading) ? (
          <Loader />
        ) : (jobError || resumeError) ? (
          <Message variant="error">{jobError || resumeError}</Message>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {job && job.title}
                </h2>
                <p className="text-gray-600">
                  {job && job.admin && job.admin.companyName}
                </p>
              </div>
              
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-700">
                  <span className="font-medium">Resume:</span> {resume && resume.name}
                </p>
                
                <div className="flex items-center">
                  <label htmlFor="language" className="mr-2 text-gray-700">
                    <FontAwesomeIcon icon="language" className="mr-1" />
                    Language:
                  </label>
                  <select
                    id="language"
                    className="border border-gray-300 rounded-md p-1 text-sm"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    disabled={isSubmitting}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="border rounded-lg bg-gray-50 p-4 mb-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                    <FontAwesomeIcon icon="robot" />
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-gray-800">
                      Please answer a few questions to complete your application for this position.
                    </p>
                  </div>
                </div>
                
                {/* Display chat history */}
                {userResponses.map((response, index) => (
                  <div key={index}>
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                        <FontAwesomeIcon icon="robot" />
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-gray-800">{questions[index].question}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start mb-4 justify-end">
                      <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                        <p className="text-gray-800">{response}</p>
                      </div>
                      <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 ml-3">
                        <FontAwesomeIcon icon="user" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Current question */}
                {!isSubmitting && currentQuestion < questions.length && (
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                      <FontAwesomeIcon icon="robot" />
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                      <p className="text-gray-800">{questions[currentQuestion].question}</p>
                      {questions[currentQuestion].isRequired && (
                        <span className="text-red-500 text-sm">*Required</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Submission message */}
                {isSubmitting && (
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                      <FontAwesomeIcon icon="robot" />
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                      <p className="text-gray-800">
                        Thank you for your responses! Your application is being submitted...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              {!isSubmitting && currentQuestion < questions.length && (
                <div className="relative">
                  <textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your answer here..."
                    rows="3"
                    disabled={responseLoading}
                  ></textarea>
                  
                  <button
                    className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-800"
                    onClick={handleResponseSubmit}
                    disabled={responseLoading || (questions[currentQuestion].isRequired && !currentResponse.trim())}
                  >
                    <FontAwesomeIcon icon="paper-plane" size="lg" />
                  </button>
                </div>
              )}
              
              {(responseError || applyError) && (
                <Message variant="error" className="mt-4">
                  {responseError || applyError}
                </Message>
              )}
              
              <div className="mt-6 text-sm text-gray-500">
                <p>
                  <FontAwesomeIcon icon="info-circle" className="mr-1" />
                  Your responses will be saved and shared with the employer as part of your application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotScreen;