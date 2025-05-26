import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { registerCompany } from '../actions/userActions';
import FormContainer from '../components/common/FormContainer';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const RegisterCompanyScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate, userInfo]);

  const nextStep = () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    } else if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    } else {
      setMessage(null);
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
    } else {
      if (!companyName) {
        setMessage('Company name is required');
      } else {
        dispatch(registerCompany(
          name,
          email,
          password,
          companyName,
          companyLogo,
          companyDescription
        ));
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register Company</h1>
        
        {message && <Message variant="error">{message}</Message>}
        {error && <Message variant="error">{error}</Message>}
        
        <div className="mb-6">
          <div className="flex justify-between">
            <div 
              className={`w-1/2 p-2 text-center ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              } rounded-l-lg`}
            >
              <span className="font-medium">Account Info</span>
            </div>
            <div 
              className={`w-1/2 p-2 text-center ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              } rounded-r-lg`}
            >
              <span className="font-medium">Company Details</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={submitHandler}>
          {step === 1 ? (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  <FontAwesomeIcon icon="user" className="mr-2" />
                  Admin Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input"
                  placeholder="Enter admin name"
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
                  placeholder="Enter company email"
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
                type="button"
                onClick={nextStep}
                className="btn btn-primary w-full py-3"
              >
                <FontAwesomeIcon icon="arrow-right" className="mr-2" />
                Next
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-gray-700 mb-2">
                  <FontAwesomeIcon icon="building" className="mr-2" />
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="input"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="companyLogo" className="block text-gray-700 mb-2">
                  <FontAwesomeIcon icon="image" className="mr-2" />
                  Company Logo URL (Optional)
                </label>
                <input
                  type="url"
                  id="companyLogo"
                  className="input"
                  placeholder="Enter logo URL"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="companyDescription" className="block text-gray-700 mb-2">
                  <FontAwesomeIcon icon="file-alt" className="mr-2" />
                  Company Description (Optional)
                </label>
                <textarea
                  id="companyDescription"
                  className="input"
                  placeholder="Enter company description"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-ghost border border-gray-300 w-1/2 py-3"
                >
                  <FontAwesomeIcon icon="arrow-left" className="mr-2" />
                  Back
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary w-1/2 py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size="sm" />
                      <span className="ml-2">Registering...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="user-plus" className="mr-2" />
                      Register
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </FormContainer>
  );
};

export default RegisterCompanyScreen;