import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../redux/actions/jobActions';
import Loader from '../components/common/Loader';

const CreateJobPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.jobs);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createJob(form));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Job</h1>
      <div className="bg-dark-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300">Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="form-input mt-1 block w-full" required />
          </div>
          <div>
            <label className="block text-gray-300">Company</label>
            <input type="text" name="company" value={form.company} onChange={handleChange} className="form-input mt-1 block w-full" required />
          </div>
          <div>
            <label className="block text-gray-300">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} className="form-input mt-1 block w-full" required />
          </div>
          <div>
            <label className="block text-gray-300">Salary</label>
            <input type="text" name="salary" value={form.salary} onChange={handleChange} className="form-input mt-1 block w-full" />
          </div>
          <div>
            <label className="block text-gray-300">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-input mt-1 block w-full" rows={4} required />
          </div>
          <div className="mt-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader size="sm" /> : 'Create Job'}
            </button>
          </div>
          {error && <div className="alert-danger mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
