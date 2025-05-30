import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { login } from '../redux/actions/authActions';
import Loader from '../components/common/Loader';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const redirect = location.search ? location.search.split('=')[1] : '/';
  
  useEffect(() => {
    // If user is already authenticated, redirect
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [navigate, isAuthenticated, redirect]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mt-6">Sign in to your account</h1>
          <p className="mt-2 text-gray-400">
            Or{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400">
              create a new account
            </Link>
          </p>
        </div>
        
        {error && <div className="alert-danger">{error}</div>}
        
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="form-input pl-10 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-gray-500 hover:text-gray-400 focus:outline-none"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="text-primary-500 hover:text-primary-400">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                      Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-900 text-gray-400">Or continue with</span>
          </div>
        </div>
        
        {/* Remove Google and GitHub login options */}
      </div>
    </div>
  );
};

export default LoginPage;