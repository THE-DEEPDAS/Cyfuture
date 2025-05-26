import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;
  
  useEffect(() => {
    if (!userInfo) {
      return;
    }
    
    if (!user || !user.name || success) {
      dispatch(getUserDetails());
    } else {
      setName(user.name);
      setEmail(user.email);
    }
  }, [dispatch, userInfo, user, success]);
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      toast.error('Passwords do not match');
    } else {
      setMessage(null);
      dispatch(
        updateUserProfile({
          id: user._id,
          name,
          email,
          password: password ? password : undefined,
        })
      );
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="w-full md:w-1/3 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-4">
                    {user?.name?.charAt(0) || <FontAwesomeIcon icon="user" />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                  <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                </div>
                
                <nav className="space-y-1">
                  <a href="#profile" className="flex items-center px-3 py-2 text-primary-600 bg-primary-50 rounded-lg font-medium">
                    <FontAwesomeIcon icon="user-circle" className="mr-3" />
                    Personal Information
                  </a>
                  <a href="#applications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FontAwesomeIcon icon="clipboard-list" className="mr-3" />
                    Applications
                  </a>
                  <a href="#resumes" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FontAwesomeIcon icon="file-alt" className="mr-3" />
                    Resumes
                  </a>
                  <a href="#settings" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FontAwesomeIcon icon="cog" className="mr-3" />
                    Settings
                  </a>
                </nav>
              </div>
              
              {/* Main Content */}
              <div className="w-full md:w-2/3 p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 pb-2 border-b border-gray-100">Personal Information</h1>
                
                {loading ? (
                  <Loader />
                ) : error ? (
                  <Message variant="error">{error}</Message>
                ) : (
                  <>
                    {message && <Message variant="error">{message}</Message>}
                    {success && <Message variant="success">Profile Updated Successfully</Message>}
                    
                    <form onSubmit={submitHandler} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon="user" className="mr-2 text-primary-500" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon="envelope" className="mr-2 text-primary-500" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon="lock" className="mr-2 text-primary-500" />
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 flex items-center"
                            onClick={togglePasswordVisibility}
                          >
                            <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon="lock" className="mr-2 text-primary-500" />
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center">
                        <FontAwesomeIcon icon="save" className="mr-2" />
                        Update Profile
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;