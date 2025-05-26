import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { register } from '../actions/userActions';
import FormContainer from '../components/common/FormContainer';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
    } else {
      setMessage(null);
      dispatch(register(name, email, password));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
        
        {message && <Message variant="error">{message}</Message>}
        {error && <Message variant="error">{error}</Message>}
        
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              <FontAwesomeIcon icon="user" className="mr-2" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              <FontAwesomeIcon icon="envelope" className="mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              <FontAwesomeIcon icon="lock" className="mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input pr-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
              <FontAwesomeIcon icon="lock" className="mr-2" />
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span className="ml-2">Creating Account...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="user-plus" className="mr-2" />
                Register
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : '/login'}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-gray-600">
            Looking to hire?{' '}
            <Link
              to="/register-company"
              className="text-blue-600 hover:underline"
            >
              Register as a company
            </Link>
          </p>
        </div>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;