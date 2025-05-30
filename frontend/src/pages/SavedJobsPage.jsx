import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSavedJobs } from '../redux/actions/authActions';
import JobCard from '../components/job/JobCard';
import Loader from '../components/common/Loader';

const SavedJobsPage = () => {
  const dispatch = useDispatch();
  const { savedJobs, loadingSavedJobs, errorSavedJobs } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getSavedJobs());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      {loadingSavedJobs ? (
        <Loader />
      ) : errorSavedJobs ? (
        <div className="alert-danger">{errorSavedJobs}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs && savedJobs.length > 0 ? savedJobs.map((job) => <JobCard key={job._id} job={job} />) : <p>No saved jobs found.</p>}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
