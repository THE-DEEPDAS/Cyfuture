import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uploadResume } from '../actions/resumeActions';
import { RESUME_UPLOAD_RESET } from '../constants/resumeConstants';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_URL } from '../config';

const ResumeUploadScreen = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  const resumeUpload = useSelector((state) => state.resumeUpload);
  const { loading, error, success, resume } = resumeUpload;
  
  useEffect(() => {
    // Reset resume upload state when component mounts
    dispatch({ type: RESUME_UPLOAD_RESET });
    
    if (success && resume) {
      navigate(`/jobs`);
    }
  }, [dispatch, navigate, success, resume]);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateFile(selectedFile);
    }
  };
  
  const validateFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(selectedFile.type)) {
      setUploadError('Please upload a PDF or DOCX file');
      setFile(null);
      setFileName('');
      setFilePreview('');
      return;
    }
    
    if (selectedFile.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      setFile(null);
      setFileName('');
      setFilePreview('');
      return;
    }
    
    setUploadError('');
    setFile(selectedFile);
    setFileName(selectedFile.name);
    
    // Create file preview URL
    if (selectedFile.type === 'application/pdf') {
      setFilePreview('/pdf-icon.png'); // Replace with actual path to PDF icon
    } else {
      setFilePreview('/docx-icon.png'); // Replace with actual path to DOCX icon
    }
  };
  
  const uploadFileToCloudinary = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    setUploading(true);
    
    try {
      const response = await fetch(CLOUDINARY_API_URL, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      setUploading(false);
      
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadError('Failed to upload file. Please try again.');
      return null;
    }
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    try {
      const fileUrl = await uploadFileToCloudinary();
      
      if (fileUrl) {
        dispatch(uploadResume(fileUrl));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setUploadError('An error occurred during submission');
    }
  };
  
  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Your Resume</h1>
        
        {error && <Message variant="error">{error}</Message>}
        {uploadError && <Message variant="error">{uploadError}</Message>}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              Upload your resume to apply for jobs. We'll extract your skills, experience, and education to match you with the right opportunities.
            </p>
            
            <form onSubmit={submitHandler}>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center mb-6 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="text-center">
                    {filePreview && (
                      <img 
                        src={filePreview} 
                        alt="File preview" 
                        className="w-20 h-20 mx-auto mb-3"
                      />
                    )}
                    <p className="font-medium text-gray-900 mb-1">{fileName}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileName('');
                        setFilePreview('');
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon="times" className="mr-1" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <FontAwesomeIcon icon="upload" className="text-gray-400 text-3xl mb-3" />
                    <p className="text-gray-700 mb-2">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Supported formats: PDF, DOCX (Max 5MB)
                    </p>
                    <label className="btn btn-primary cursor-pointer">
                      <FontAwesomeIcon icon="file-alt" className="mr-2" />
                      Browse Files
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      />
                    </label>
                  </>
                )}
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full py-3"
                disabled={loading || uploading || !file}
              >
                {loading || uploading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">
                      {uploading ? 'Uploading...' : 'Processing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="paper-plane" className="mr-2" />
                    Upload and Process Resume
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check" className="text-green-500 mt-1 mr-2" />
                  <span>Our AI will extract your skills, experience, and education</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check" className="text-green-500 mt-1 mr-2" />
                  <span>You'll be matched with suitable job opportunities</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon="check" className="text-green-500 mt-1 mr-2" />
                  <span>Apply to jobs with a simple click and answer a few questions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadScreen;