import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResume } from '../redux/actions/resumeActions';
import Loader from '../components/common/Loader';

const ResumePage = () => {
  const dispatch = useDispatch();
  const { resume, loading, error } = useSelector((state) => state.resume);

  useEffect(() => {
    dispatch(fetchResume());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Resume</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : resume ? (
        <div className="bg-dark-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Resume Details</h2>
          <p className="text-gray-400 mb-1">Name: {resume.name}</p>
          <p className="text-gray-400 mb-1">Email: {resume.email}</p>
          {/* Add more resume fields as needed */}
          <a href={resume.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 inline-block">Download Resume</a>
        </div>
      ) : (
        <p className="text-gray-400">No resume uploaded yet.</p>
      )}
    </div>
  );
};

export default ResumePage;
