import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { login } from '../actions/userActions';
import FormContainer from '../components/common/FormContainer';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
        
        {error && <Message variant="error">{error}</Message>}
        
        <form onSubmit={submitHandler}>
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

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              <FontAwesomeIcon icon="lock" className="mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input pr-10"
                placeholder="Enter your password"
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

          <button
            type="submit"
            className="btn btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span className="ml-2">Signing In...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            New user?{' '}
            <Link
              to={redirect ? `/register?redirect=${redirect}` : '/register'}
              className="text-blue-600 hover:underline"
            >
              Register here
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

export default LoginScreen;