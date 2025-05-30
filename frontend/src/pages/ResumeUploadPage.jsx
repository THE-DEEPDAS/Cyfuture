import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadResume } from '../redux/actions/resumeActions';
import Loader from '../components/common/Loader';

const ResumeUploadPage = () => {
  const dispatch = useDispatch();
  const { loading, error, resume } = useSelector((state) => state.resume);
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      await dispatch(uploadResume(file));
      setSuccess(true);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Resume</h1>
      <div className="bg-dark-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300">Select Resume (PDF or DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="form-input mt-1 block w-full bg-dark-700 text-white"
              required
            />
          </div>
          <div className="mt-4">
            <button type="submit" className="btn-primary" disabled={loading || !file}>
              {loading ? <Loader size="sm" /> : 'Upload Resume'}
            </button>
          </div>
          {error && <div className="alert-danger mt-2">{error}</div>}
          {success && <div className="alert-success mt-2">Resume uploaded successfully!</div>}
        </form>
        {resume && resume.url && (
          <div className="mt-6">
            <a href={resume.url} target="_blank" rel="noopener noreferrer" className="btn-outline">View Uploaded Resume</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
