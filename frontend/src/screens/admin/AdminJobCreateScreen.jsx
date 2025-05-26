import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createJob } from '../../actions/jobActions';
import { JOB_CREATE_RESET } from '../../constants/jobConstants';
import { JOB_TYPES, EXPERIENCE_LEVELS, DEFAULT_CHATBOT_QUESTIONS } from '../../config';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AdminJobCreateScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState(JOB_TYPES[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[0]);
  const [numberOfOpenings, setNumberOfOpenings] = useState(1);
  const [numberOfCandidatesToShortlist, setNumberOfCandidatesToShortlist] = useState(5);
  const [jobRequirements, setJobRequirements] = useState('');
  const [chatbotQuestions, setChatbotQuestions] = useState(DEFAULT_CHATBOT_QUESTIONS);
  const [newQuestion, setNewQuestion] = useState('');
  const [isNewQuestionRequired, setIsNewQuestionRequired] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const jobCreate = useSelector((state) => state.jobCreate);
  const { loading, error, success, job } = jobCreate;
  
  useEffect(() => {
    // Reset job create state when component mounts
    dispatch({ type: JOB_CREATE_RESET });
    
    if (success) {
      navigate(`/admin/jobs/${job._id}/edit`);
    }
  }, [dispatch, navigate, success, job]);
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    const jobData = {
      title,
      description,
      requiredSkills: requiredSkills.split(',').map(skill => skill.trim()),
      location,
      salary,
      jobType,
      experienceLevel,
      numberOfOpenings: parseInt(numberOfOpenings),
      numberOfCandidatesToShortlist: parseInt(numberOfCandidatesToShortlist),
      jobRequirements: jobRequirements.split('\n').filter(req => req.trim() !== ''),
      chatbotQuestions,
    };
    
    dispatch(createJob(jobData));
  };
  
  const addQuestion = () => {
    if (newQuestion.trim() !== '') {
      setChatbotQuestions([
        ...chatbotQuestions,
        {
          question: newQuestion,
          isRequired: isNewQuestionRequired,
        },
      ]);
      setNewQuestion('');
      setIsNewQuestionRequired(true);
    }
  };
  
  const removeQuestion = (index) => {
    setChatbotQuestions(chatbotQuestions.filter((_, i) => i !== index));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/jobs" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FontAwesomeIcon icon="arrow-left" className="mr-2" />
        Back to Jobs
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Create New Job Posting</h1>
        </div>
        
        <div className="p-6">
          {error && <Message variant="error">{error}</Message>}
          
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY or Remote"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the job..."
                rows="6"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="requiredSkills" className="block text-gray-700 font-medium mb-2">
                  Required Skills *
                </label>
                <input
                  type="text"
                  id="requiredSkills"
                  className="input"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. JavaScript, React, Node.js (comma separated)"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="salary" className="block text-gray-700 font-medium mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salary"
                  className="input"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="jobType" className="block text-gray-700 font-medium mb-2">
                  Job Type *
                </label>
                <select
                  id="jobType"
                  className="input"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  required
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="experienceLevel" className="block text-gray-700 font-medium mb-2">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  className="input"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  required
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="numberOfOpenings" className="block text-gray-700 font-medium mb-2">
                  Number of Openings *
                </label>
                <input
                  type="number"
                  id="numberOfOpenings"
                  className="input"
                  value={numberOfOpenings}
                  onChange={(e) => setNumberOfOpenings(e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="numberOfCandidatesToShortlist" className="block text-gray-700 font-medium mb-2">
                  Candidates to Shortlist *
                </label>
                <input
                  type="number"
                  id="numberOfCandidatesToShortlist"
                  className="input"
                  value={numberOfCandidatesToShortlist}
                  onChange={(e) => setNumberOfCandidatesToShortlist(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="jobRequirements" className="block text-gray-700 font-medium mb-2">
                Job Requirements (One per line)
              </label>
              <textarea
                id="jobRequirements"
                className="input"
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                placeholder="e.g. Bachelor's degree in Computer Science or related field&#10;3+ years of experience with JavaScript&#10;Strong communication skills"
                rows="4"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Chatbot Questions
              </label>
              <p className="text-gray-600 mb-3 text-sm">
                These questions will be asked to candidates during the application process.
              </p>
              
              <ul className="mb-4 space-y-2">
                {chatbotQuestions.map((q, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{q.question}</span>
                      {q.isRequired && (
                        <span className="ml-2 text-red-500 text-sm">*Required</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <input
                    type="text"
                    className="input"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add a new question..."
                  />
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={isNewQuestionRequired}
                    onChange={(e) => setIsNewQuestionRequired(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isRequired" className="mr-4">Required</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn btn-secondary"
                    disabled={!newQuestion.trim()}
                  >
                    <FontAwesomeIcon icon="plus" className="mr-2" />
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <Link to="/admin/jobs" className="btn btn-ghost border border-gray-300 mr-4">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="save" className="mr-2" />
                    Create Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminJobCreateScreen;