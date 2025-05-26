import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAdminJobs, deleteJob } from '../../actions/adminActions';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AdminJobListScreen = () => {
  const dispatch = useDispatch();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);
  
  const adminJobs = useSelector((state) => state.adminJobs);
  const { loading, error, jobs } = adminJobs;
  
  const jobDelete = useSelector((state) => state.jobDelete);
  const { loading: deleteLoading, error: deleteError, success: deleteSuccess } = jobDelete;
  
  useEffect(() => {
    dispatch(getAdminJobs());
  }, [dispatch, deleteSuccess]);
  
  const openDeleteModal = (id) => {
    setDeleteJobId(id);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteJobId(null);
  };
  
  const confirmDelete = () => {
    dispatch(deleteJob(deleteJobId));
    closeDeleteModal();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Manage Jobs</h1>
        
        <Link to="/admin/jobs/create" className="btn btn-primary">
          <FontAwesomeIcon icon="plus" className="mr-2" />
          Post New Job
        </Link>
      </div>
      
      {deleteError && <Message variant="error">{deleteError}</Message>}
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FontAwesomeIcon icon="briefcase" className="text-gray-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Job Postings</h2>
          <p className="text-gray-600 mb-6">You haven't posted any jobs yet.</p>
          <Link to="/admin/jobs/create" className="btn btn-primary">
            <FontAwesomeIcon icon="plus" className="mr-2" />
            Create Your First Job Posting
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.jobType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{job.applicationCount}</span>
                        {job.shortlistedCount > 0 && (
                          <span className="text-green-600 ml-2">
                            ({job.shortlistedCount} shortlisted)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/jobs/${job._id}/applications`} className="text-blue-600 hover:text-blue-900 mr-3">
                        <FontAwesomeIcon icon="users" className="mr-1" />
                        Applications
                      </Link>
                      <Link to={`/admin/messaging/${job._id}`} className="text-purple-600 hover:text-purple-900 mr-3">
                        <FontAwesomeIcon icon="comment" className="mr-1" />
                        Message
                      </Link>
                      <Link to={`/admin/jobs/${job._id}/edit`} className="text-amber-600 hover:text-amber-900 mr-3">
                        <FontAwesomeIcon icon="edit" className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(job._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon="trash" className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this job posting? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="btn btn-ghost border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-600 text-white hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobListScreen;