import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getJobDetails } from '../actions/jobActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const JobDetailScreen = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading, error, job } = jobDetails;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  const resumeUpload = useSelector((state) => state.resumeUpload);
  const { resume } = resumeUpload;
  
  useEffect(() => {
    if (!job._id || job._id !== jobId) {
      dispatch(getJobDetails(jobId));
    }
  }, [dispatch, job._id, jobId]);
  
  const applyHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=upload-resume');
    } else if (resume) {
      navigate(`/chatbot/${resume._id}/${jobId}`);
    } else {
      navigate('/upload-resume');
    }
  };
  
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/jobs" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FontAwesomeIcon icon="arrow-left" className="mr-2" />
        Back to Jobs
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-xl text-gray-600">
                    {job.admin && job.admin.companyName}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="badge badge-primary">
                    <FontAwesomeIcon icon="briefcase" className="mr-1" />
                    {job.jobType}
                  </span>
                  <span className="badge badge-secondary">
                    <FontAwesomeIcon icon="user-tie" className="mr-1" />
                    {job.experienceLevel}
                  </span>
                  <span className="badge badge-accent">
                    <FontAwesomeIcon icon="clock" className="mr-1" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon="map-marker-alt" className="text-gray-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Location</h3>
                      <p className="text-gray-700">{job.location}</p>
                    </div>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-start">
                      <FontAwesomeIcon icon="money-bill-wave" className="text-gray-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Salary</h3>
                        <p className="text-gray-700">{job.salary}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <FontAwesomeIcon icon="users" className="text-gray-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Openings</h3>
                      <p className="text-gray-700">{job.numberOfOpenings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                  <div className={`prose text-gray-700 ${!showFullDescription && 'max-h-60 overflow-hidden relative'}`}>
                    <p>{job.description}</p>
                    {!showFullDescription && job.description.length > 300 && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                    )}
                  </div>
                  {job.description.length > 300 && (
                    <button
                      onClick={toggleDescription}
                      className="text-blue-600 hover:text-blue-800 mt-2 font-medium focus:outline-none"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                      <FontAwesomeIcon 
                        icon={showFullDescription ? 'chevron-up' : 'chevron-down'} 
                        className="ml-1" 
                      />
                    </button>
                  )}
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge badge-accent py-2 px-3">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {job.jobRequirements && job.jobRequirements.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Job Requirements</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {job.jobRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Company Info & Application */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Company Information</h2>
                {job.admin && (
                  <>
                    <div className="flex items-center mb-4">
                      {job.admin.companyLogo ? (
                        <img 
                          src={job.admin.companyLogo} 
                          alt={job.admin.companyName} 
                          className="w-16 h-16 object-contain rounded mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon="building" className="text-gray-500 text-2xl" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{job.admin.companyName}</h3>
                      </div>
                    </div>
                    
                    {job.admin.companyDescription && (
                      <p className="text-gray-700 mb-4">{job.admin.companyDescription}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Apply for this job</h2>
                <p className="text-gray-700 mb-6">
                  To apply for this position, you'll need to upload your resume and answer a few questions.
                </p>
                
                <button
                  onClick={applyHandler}
                  className="btn btn-primary w-full py-3"
                >
                  <FontAwesomeIcon icon="paper-plane" className="mr-2" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailScreen;