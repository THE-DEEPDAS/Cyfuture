import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const { register, isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    companyName: "",
    industry: "",
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    return (
      <Navigate to={user.role === "candidate" ? "/candidate" : "/company"} />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.password === formData.confirmPassword
    );
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (formData.role === "company" && !formData.companyName) ||
      !formData.role
    ) {
      return;
    }

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(formData.role === "company" && {
        companyName: formData.companyName,
        industry: formData.industry,
      }),
    };

    setLoading(true);
    try {
      await register(registrationData);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full mt-1"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full mt-1"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full mt-1"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-300"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full mt-1"
          placeholder="••••••••"
        />
        {formData.password &&
          formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-sm text-error-500">
              Passwords do not match
            </p>
          )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!validateStep1()}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed transition-colors"
      >
        Next Step
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          I am a:
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`p-4 rounded-lg border ${
              formData.role === "candidate"
                ? "border-primary-500 bg-primary-700/20"
                : "border-dark-600 hover:border-primary-400"
            } transition-colors flex flex-col items-center justify-center`}
            onClick={() =>
              handleChange({ target: { name: "role", value: "candidate" } })
            }
          >
            <FontAwesomeIcon
              icon="user"
              className={`text-2xl ${
                formData.role === "candidate"
                  ? "text-primary-400"
                  : "text-gray-400"
              }`}
            />
            <span className="mt-2">Job Seeker</span>
          </button>

          <button
            type="button"
            className={`p-4 rounded-lg border ${
              formData.role === "company"
                ? "border-primary-500 bg-primary-700/20"
                : "border-dark-600 hover:border-primary-400"
            } transition-colors flex flex-col items-center justify-center`}
            onClick={() =>
              handleChange({ target: { name: "role", value: "company" } })
            }
          >
            <FontAwesomeIcon
              icon="building"
              className={`text-2xl ${
                formData.role === "company"
                  ? "text-primary-400"
                  : "text-gray-400"
              }`}
            />
            <span className="mt-2">Employer</span>
          </button>
        </div>
      </div>

      {formData.role === "company" && (
        <>
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-300"
            >
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full mt-1"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-300"
            >
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full mt-1"
              required
            >
              <option value="">Select an industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 flex justify-center py-3 px-4 border border-dark-600 rounded-md shadow-sm text-white bg-transparent hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            (formData.role === "company" && !formData.companyName) ||
            !formData.role
          }
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon="spinner" spin className="mr-2" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full space-y-8 slide-up">
        <div>
          <div className="flex justify-center">
            <FontAwesomeIcon
              icon="briefcase"
              className="text-primary-500 text-4xl"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            {step === 1 ? "Create your account" : "Complete your profile"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-500 hover:text-primary-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {step === 1 ? renderStep1() : renderStep2()}
          </div>
        </form>

        {/* Step indicator */}
        <div className="flex justify-center items-center space-x-2 pt-4">
          <div
            className={`h-2 w-8 rounded-full ${
              step === 1 ? "bg-primary-500" : "bg-primary-800"
            }`}
          ></div>
          <div
            className={`h-2 w-8 rounded-full ${
              step === 2 ? "bg-primary-500" : "bg-primary-800"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
