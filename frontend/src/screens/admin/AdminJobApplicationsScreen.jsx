import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getJobDetails, getJobApplications, updateApplicationStatus } from '../../actions/jobActions';
import { APPLICATION_STATUSES } from '../../config';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AdminJobApplicationsScreen = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [sortField, setSortField] = useState('matchScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading: jobLoading, error: jobError, job } = jobDetails;
  
  const jobApplicationsList = useSelector((state) => state.jobApplicationsList);
  const { loading: applicationsLoading, error: applicationsError, applications } = jobApplicationsList;
  
  const jobApplicationUpdate = useSelector((state) => state.jobApplicationUpdate);
  const { loading: updateLoading, error: updateError, success: updateSuccess } = jobApplicationUpdate;
  
  useEffect(() => {
    dispatch(getJobDetails(jobId));
    dispatch(getJobApplications(jobId));
  }, [dispatch, jobId, updateSuccess]);
  
  const sortedApplications = applications && [...applications].sort((a, b) => {
    if (sortField === 'matchScore') {
      return sortDirection === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore;
    } else if (sortField === 'name') {
      return sortDirection === 'desc' 
        ? b.resume.name.localeCompare(a.resume.name)
        : a.resume.name.localeCompare(b.resume.name);
    } else if (sortField === 'appliedAt') {
      return sortDirection === 'desc' 
        ? new Date(b.appliedAt) - new Date(a.appliedAt)
        : new Date(a.appliedAt) - new Date(b.appliedAt);
    }
    return 0;
  });
  
  const filteredApplications = sortedApplications && sortedApplications.filter(app => 
    filterStatus ? app.status === filterStatus : true
  );
  
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const showLLMReasoning = (application) => {
    setSelectedApplication(application);
    setShowReasoningModal(true);
  };
  
  const openStatusModal = (application) => {
    setSelectedApplication(application);
    setStatusToUpdate(application.status);
    setShowStatusModal(true);
  };
  
  const handleStatusUpdate = () => {
    if (selectedApplication && statusToUpdate) {
      dispatch(updateApplicationStatus(
        jobId,
        selectedApplication._id,
        statusToUpdate
      ));
      setShowStatusModal(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <Link to="/admin/jobs" className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <FontAwesomeIcon icon="arrow-left" className="mr-2" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold">Job Applications</h1>
        </div>
        
        {job && (
          <div className="mt-4 md:mt-0">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
          </div>
        )}
        
        <Link to={`/admin/messaging/${jobId}`} className="btn btn-primary mt-4 md:mt-0">
          <FontAwesomeIcon icon="comment" className="mr-2" />
          Message Applicants
        </Link>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="filterStatus" className="block text-sm text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="filterStatus"
              className="input py-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilterStatus('')}
              className="btn btn-ghost border border-gray-300 py-1"
              disabled={!filterStatus}
            >
              <FontAwesomeIcon icon="times" className="mr-2" />
              Clear Filter
            </button>
          </div>
        </div>
      </div>
      
      {jobLoading || applicationsLoading ? (
        <Loader />
      ) : jobError || applicationsError ? (
        <Message variant="error">{jobError || applicationsError}</Message>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FontAwesomeIcon icon="users" className="text-gray-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Applications Yet</h2>
          <p className="text-gray-600">
            There are no applications for this job posting yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => toggleSort('name')}
                    >
                      Candidate
                      {sortField === 'name' && (
                        <FontAwesomeIcon
                          icon={sortDirection === 'asc' ? 'sort-amount-up' : 'sort-amount-down'}
                          className="ml-1"
                        />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => toggleSort('matchScore')}
                    >
                      Match Score
                      {sortField === 'matchScore' && (
                        <FontAwesomeIcon
                          icon={sortDirection === 'asc' ? 'sort-amount-up' : 'sort-amount-down'}
                          className="ml-1"
                        />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => toggleSort('appliedAt')}
                    >
                      Applied On
                      {sortField === 'appliedAt' && (
                        <FontAwesomeIcon
                          icon={sortDirection === 'asc' ? 'sort-amount-up' : 'sort-amount-down'}
                          className="ml-1"
                        />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon="user" className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.resume.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.resume.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, Math.round(application.matchScore))}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {Math.round(application.matchScore)}%
                        </span>
                        <button
                          onClick={() => showLLMReasoning(application)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon="info-circle" />
                        </button>
                      </div>
                      <div className="mt-1">
                        <div className="text-xs text-gray-500">
                          Skills: {Math.round(application.skillMatchScore)}% • 
                          Exp: {Math.round(application.experienceMatchScore)}% • 
                          Edu: {Math.round(application.educationMatchScore)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {application.resume.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="badge badge-accent text-xs">
                            {skill}
                          </span>
                        ))}
                        {application.resume.skills.length > 3 && (
                          <span className="badge badge-accent text-xs">
                            +{application.resume.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                        application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'Interviewing' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openStatusModal(application)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon="edit" className="mr-1" />
                        Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* LLM Reasoning Modal */}
      {showReasoningModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Match Analysis</h2>
              <button
                onClick={() => setShowReasoningModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon="times" size="lg" />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Candidate: {selectedApplication.resume.name}</h3>
              <div className="flex items-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(selectedApplication.matchScore))}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {Math.round(selectedApplication.matchScore)}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Skills Match</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.round(selectedApplication.skillMatchScore))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(selectedApplication.skillMatchScore)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Experience Match</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.round(selectedApplication.experienceMatchScore))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(selectedApplication.experienceMatchScore)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Education Match</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.round(selectedApplication.educationMatchScore))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(selectedApplication.educationMatchScore)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">LLM Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedApplication.llmReasoning}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Candidate Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedApplication.resume.skills.map((skill, index) => (
                      <span key={index} className="badge badge-accent">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Education</h4>
                  <ul className="text-sm text-gray-700">
                    {selectedApplication.resume.education.map((edu, index) => (
                      <li key={index} className="mb-1">
                        <div className="font-medium">{edu.institution}</div>
                        <div>{edu.degree} in {edu.field}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-end">
              <button
                onClick={() => setShowReasoningModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Update Application Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon="times" size="lg" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Updating status for: <span className="font-semibold">{selectedApplication.resume.name}</span>
              </p>
              
              <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                id="statusSelect"
                className="input"
                value={statusToUpdate}
                onChange={(e) => setStatusToUpdate(e.target.value)}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            {updateError && <Message variant="error">{updateError}</Message>}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn btn-ghost border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="btn btn-primary"
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplicationsScreen;