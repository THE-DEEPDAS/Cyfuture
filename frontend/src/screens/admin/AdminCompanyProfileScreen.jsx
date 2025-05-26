import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateCompanyProfile } from '../../actions/adminActions';
import { ADMIN_COMPANY_PROFILE_UPDATE_RESET } from '../../constants/adminConstants';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AdminCompanyProfileScreen = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  
  const dispatch = useDispatch();
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  const adminCompanyProfileUpdate = useSelector((state) => state.adminCompanyProfileUpdate);
  const { loading, error, success } = adminCompanyProfileUpdate;
  
  useEffect(() => {
    if (userInfo) {
      setCompanyName(userInfo.companyName || '');
      setCompanyLogo(userInfo.companyLogo || '');
      setCompanyDescription(userInfo.companyDescription || '');
    }
    
    // Reset the success state when component mounts or unmounts
    return () => {
      dispatch({ type: ADMIN_COMPANY_PROFILE_UPDATE_RESET });
    };
  }, [dispatch, userInfo]);
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    dispatch(updateCompanyProfile({
      companyName,
      companyLogo,
      companyDescription,
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FontAwesomeIcon icon="arrow-left" className="mr-2" />
        Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Company Profile</h1>
        </div>
        
        <div className="p-6">
          {error && <Message variant="error">{error}</Message>}
          {success && <Message variant="success">Company profile updated successfully!</Message>}
          
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label htmlFor="companyName" className="block text-gray-700 font-medium mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="companyLogo" className="block text-gray-700 font-medium mb-2">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  id="companyLogo"
                  className="input"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  placeholder="Enter URL to your company logo"
                />
                <p className="mt-1 text-sm text-gray-500">
                  For best results, use a square image (e.g., 200x200 pixels)
                </p>
              </div>
              
              {companyLogo && (
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Logo Preview
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                    <img 
                      src={companyLogo} 
                      alt="Company Logo Preview" 
                      className="max-h-32 max-w-full"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Logo+Error';
                        e.target.alt = 'Invalid logo URL';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label htmlFor="companyDescription" className="block text-gray-700 font-medium mb-2">
                  Company Description
                </label>
                <textarea
                  id="companyDescription"
                  className="input"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Enter a brief description of your company"
                  rows="6"
                ></textarea>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !companyName}
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="save" className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyProfileScreen;