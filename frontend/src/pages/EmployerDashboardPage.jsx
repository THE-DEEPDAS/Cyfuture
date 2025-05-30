import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployerJobs } from '../redux/actions/jobActions';
import Loader from '../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faBriefcase, faUserCheck } from '@fortawesome/free-solid-svg-icons';

const EmployerDashboardPage = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.employerJobs);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEmployerJobs());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faChartBar} className="text-primary-400" /> Employer Dashboard
      </h1>
      <div className="bg-dark-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faBriefcase} /> My Jobs
        </h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="alert-danger">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs && jobs.length > 0 ? jobs.map((job) => (
              <div key={job._id} className="bg-dark-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-1">{job.title}</h3>
                <p className="text-gray-400 mb-1">{job.company}</p>
                <p className="text-gray-400 mb-1">{job.location}</p>
                <p className="text-gray-400 mb-1">{job.salary}</p>
                <p className="text-gray-400 mb-1">{job.description}</p>
                {/* Add more job details and links to applications as needed */}
              </div>
            )) : <p className="text-gray-400">No jobs posted yet.</p>}
          </div>
        )}
      </div>
      {/* Add analytics, application stats, and messaging features here as needed */}
    </div>
  );
};

export default EmployerDashboardPage;
