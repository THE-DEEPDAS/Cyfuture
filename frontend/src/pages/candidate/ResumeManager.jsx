import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([
    {
      id: '1',
      title: 'Software Developer Resume',
      fileUrl: '#',
      fileType: 'pdf',
      lastUpdated: '2025-02-15T10:30:00Z',
      isDefault: true
    },
    {
      id: '2',
      title: 'Frontend Specialist Resume',
      fileUrl: '#',
      fileType: 'docx',
      lastUpdated: '2025-01-20T14:45:00Z',
      isDefault: false
    }
  ]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle resume upload
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Simulate file upload with progress
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Add the new resume to the list
          const newResume = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            fileUrl: '#',
            fileType: file.name.split('.').pop().toLowerCase(),
            lastUpdated: new Date().toISOString(),
            isDefault: false
          };
          
          setResumes(prev => [...prev, newResume]);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });
  
  const handleSetDefault = (id) => {
    setResumes(
      resumes.map(resume => ({
        ...resume,
        isDefault: resume.id === id
      }))
    );
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      setResumes(resumes.filter(resume => resume.id !== id));
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white mb-2">
          Resume Manager
        </h1>
        <p className="text-gray-300">
          Upload and manage your resumes for job applications
        </p>
      </div>
      
      {/* Upload area */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Upload New Resume</h2>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-900/20' : 'border-dark-600 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          
          <FontAwesomeIcon icon="file-upload" className="text-4xl text-gray-400 mb-3" />
          
          <p className="text-white mb-2">
            {isDragActive
              ? 'Drop your resume here'
              : 'Drag & drop your resume here, or click to select'
            }
          </p>
          <p className="text-sm text-gray-400">
            Supports PDF, DOCX (Max 5MB)
          </p>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Resume list */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">My Resumes</h2>
        
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-background-secondary rounded-lg p-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-primary-700/30 p-3 mr-4">
                  <FontAwesomeIcon 
                    icon={resume.fileType === 'pdf' ? 'file-pdf' : 'file-word'} 
                    className="text-primary-500" 
                  />
                </div>
                
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-white">{resume.title}</h3>
                    {resume.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-700/50 text-primary-300">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Last updated {formatDate(resume.lastUpdated)}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!resume.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(resume.id)} 
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                    title="Set as Default"
                  >
                    <FontAwesomeIcon icon="star" />
                  </button>
                )}
                
                <button 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  title="Preview"
                >
                  <FontAwesomeIcon icon="eye" />
                </button>
                
                <button 
                  onClick={() => handleDelete(resume.id)} 
                  className="text-gray-400 hover:text-error-500 transition-colors"
                  title="Delete"
                >
                  <FontAwesomeIcon icon="trash-alt" />
                </button>
              </div>
            </div>
          ))}
          
          {resumes.length === 0 && (
            <div className="text-center py-6">
              <FontAwesomeIcon icon="file-alt" className="text-3xl text-gray-500 mb-2" />
              <p className="text-gray-400">You haven't uploaded any resumes yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Tips section */}
      <div className="bg-background-secondary rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Resume Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background-primary/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon="check-circle" className="text-success-500 mr-2" />
              <h3 className="font-medium text-white">Do's</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <FontAwesomeIcon icon="check" className="text-success-500 mt-1 mr-2" />
                <span>Tailor your resume to each job application</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="check" className="text-success-500 mt-1 mr-2" />
                <span>Quantify achievements with metrics</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="check" className="text-success-500 mt-1 mr-2" />
                <span>Use keywords from the job description</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="check" className="text-success-500 mt-1 mr-2" />
                <span>Keep formatting clean and consistent</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-background-primary/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon="times-circle" className="text-error-500 mr-2" />
              <h3 className="font-medium text-white">Don'ts</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <FontAwesomeIcon icon="times" className="text-error-500 mt-1 mr-2" />
                <span>Include irrelevant experience</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="times" className="text-error-500 mt-1 mr-2" />
                <span>Use generic phrases like "team player"</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="times" className="text-error-500 mt-1 mr-2" />
                <span>Make spelling or grammar mistakes</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon="times" className="text-error-500 mt-1 mr-2" />
                <span>Exceed 2 pages for most positions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;