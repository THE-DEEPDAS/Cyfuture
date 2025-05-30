import React from 'react';
import { useSelector } from 'react-redux';
import Loader from '../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUsers, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const AdminDashboardPage = () => {
  const { jobs, loading: jobsLoading } = useSelector((state) => state.jobs);
  const { applications, loading: appsLoading } = useSelector((state) => state.applications);
  const { users, loading: usersLoading } = useSelector((state) => state.analytics || {});

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faChartPie} className="text-primary-400" /> Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-800 p-6 rounded-lg shadow flex flex-col items-center">
          <FontAwesomeIcon icon={faBriefcase} className="text-4xl text-primary-400 mb-2" />
          <div className="text-lg font-semibold">Jobs</div>
          {jobsLoading ? <Loader size="sm" /> : <div className="text-2xl">{jobs?.length || 0}</div>}
        </div>
        <div className="bg-dark-800 p-6 rounded-lg shadow flex flex-col items-center">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-primary-400 mb-2" />
          <div className="text-lg font-semibold">Applications</div>
          {appsLoading ? <Loader size="sm" /> : <div className="text-2xl">{applications?.length || 0}</div>}
        </div>
        <div className="bg-dark-800 p-6 rounded-lg shadow flex flex-col items-center">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-primary-400 mb-2" />
          <div className="text-lg font-semibold">Users</div>
          {usersLoading ? <Loader size="sm" /> : <div className="text-2xl">{users?.length || 0}</div>}
        </div>
      </div>
      {/* Add more analytics, charts, and management features as needed */}
    </div>
  );
};

export default AdminDashboardPage;
