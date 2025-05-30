import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../redux/actions/jobActions';
import JobCard from '../components/job/JobCard';
import Loader from '../components/common/Loader';

const JobListingPage = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? jobs.map((job) => <JobCard key={job._id} job={job} />) : <p>No jobs found.</p>}
        </div>
      )}
    </div>
  );
};

export default JobListingPage;
