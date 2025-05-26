import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      setPassword('');
      setConfirmPassword('');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6">
              <Loader />
            </div>
          ) : error ? (
            <div className="p-6">
              <Message variant="error">{error}</Message>
            </div>
          ) : (
            <div className="p-6">
              {message && <Message variant="error">{message}</Message>}
              {success && <Message variant="success">Profile Updated Successfully</Message>}
              
              <form onSubmit={submitHandler}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    <FontAwesomeIcon icon="user" className="mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    <FontAwesomeIcon icon="envelope" className="mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    <FontAwesomeIcon icon="lock" className="mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="input pr-10"
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
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    <FontAwesomeIcon icon="lock" className="mr-2" />
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-full py-3">
                  <FontAwesomeIcon icon="save" className="mr-2" />
                  Update Profile
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;