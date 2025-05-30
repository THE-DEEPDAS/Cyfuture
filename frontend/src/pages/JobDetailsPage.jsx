import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getJobDetails } from '../redux/actions/jobActions';
import Loader from '../components/common/Loader';

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { job, loading, error } = useSelector((state) => state.jobDetails);

  useEffect(() => {
    if (id) {
      dispatch(getJobDetails(id));
    }
  }, [dispatch, id]);

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : job ? (
        <div className="bg-dark-800 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Company:</span> {job.company}</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Location:</span> {job.location}</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Salary:</span> {job.salary}</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold">Description:</span> {job.description}</p>
          {/* Add more job details and apply button as needed */}
        </div>
      ) : (
        <div className="text-gray-400">No job found.</div>
      )}
    </div>
  );
};

export default JobDetailsPage;
