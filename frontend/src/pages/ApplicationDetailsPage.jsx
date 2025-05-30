import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchApplicationDetails } from '../redux/actions/applicationActions';
import Loader from '../components/common/Loader';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { application, loading, error } = useSelector((state) => state.jobApplications);

  useEffect(() => {
    if (id) {
      dispatch(fetchApplicationDetails(id));
    }
  }, [dispatch, id]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Application Details</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : application ? (
        <div className="bg-dark-800 p-6 rounded-lg shadow-md">
          <p className="text-gray-300 mb-2"><span className="font-semibold">Job Title:</span> {application.jobTitle}</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Status:</span> {application.status}</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Applied On:</span> {new Date(application.createdAt).toLocaleDateString()}</p>
          {/* Add more application details as needed */}
        </div>
      ) : (
        <p className="text-gray-400">No application found.</p>
      )}
    </div>
  );
};

export default ApplicationDetailsPage;
