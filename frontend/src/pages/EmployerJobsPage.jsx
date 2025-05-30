import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployerJobs } from '../redux/actions/jobActions';
import Loader from '../components/common/Loader';

const EmployerJobsPage = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.employerJobs);

  useEffect(() => {
    dispatch(fetchEmployerJobs());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Posted Jobs</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? jobs.map((job) => (
            <div key={job._id} className="bg-dark-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
              <p className="text-gray-400 mb-1">{job.company}</p>
              <p className="text-gray-400 mb-1">{job.location}</p>
              <p className="text-gray-400 mb-1">{job.salary}</p>
              <p className="text-gray-400 mb-1">{job.description}</p>
            </div>
          )) : <p>No jobs posted yet.</p>}
        </div>
      )}
    </div>
  );
};

export default EmployerJobsPage;
