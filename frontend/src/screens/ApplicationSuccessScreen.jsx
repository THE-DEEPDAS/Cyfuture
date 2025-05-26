import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getJobDetails } from '../actions/jobActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const ApplicationSuccessScreen = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading, error, job } = jobDetails;
  
  const jobApplicationCreate = useSelector((state) => state.jobApplicationCreate);
  const { application } = jobApplicationCreate;
  
  useEffect(() => {
    if (!job._id || job._id !== jobId) {
      dispatch(getJobDetails(jobId));
    }
  }, [dispatch, job._id, jobId]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-green-100 text-green-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon="check" className="text-4xl" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
            
            <p className="text-gray-700 mb-6">
              Your application for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.admin && job.admin.companyName}</span> has been successfully submitted.
            </p>
            
            {application && application.matchScore && (
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Your match score:</p>
                <div className="bg-gray-100 rounded-full h-4 mb-2">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${Math.min(100, Math.round(application.matchScore))}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {Math.round(application.matchScore)}% match with job requirements
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
              <ul className="text-blue-700 text-sm space-y-2">
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check-circle" className="text-blue-500 mt-1 mr-2" />
                  <span>The employer will review your application</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check-circle" className="text-blue-500 mt-1 mr-2" />
                  <span>You'll receive notifications about your application status</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check-circle" className="text-blue-500 mt-1 mr-2" />
                  <span>If shortlisted, you'll be contacted for an interview</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/jobs" className="btn btn-primary flex-1">
                <FontAwesomeIcon icon="search" className="mr-2" />
                Browse More Jobs
              </Link>
              <Link to="/profile" className="btn btn-ghost border border-gray-300 flex-1">
                <FontAwesomeIcon icon="user" className="mr-2" />
                View Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationSuccessScreen;