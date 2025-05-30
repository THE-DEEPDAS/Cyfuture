import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserApplications } from '../redux/actions/applicationActions';
import Loader from '../components/common/Loader';

const ApplicationsPage = () => {
  const dispatch = useDispatch();
  const { applications, loading, error } = useSelector((state) => state.userApplications);

  useEffect(() => {
    dispatch(fetchUserApplications());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : (
        <div className="bg-dark-800 p-6 rounded-lg shadow-md">
          {applications && applications.length > 0 ? (
            <ul className="divide-y divide-dark-700">
              {applications.map((app) => (
                <li key={app._id} className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-primary-400">{app.jobTitle}</p>
                      <p className="text-gray-400">Status: {app.status}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="text-sm text-gray-500">Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">You have not applied to any jobs yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
