import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HomePage = () => {
  return (
    <div className="bg-background-primary text-white">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-background-primary to-background-primary opacity-70"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-20"></div>

        <div className="relative container mx-auto px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered{" "}
              <span className="text-primary-500">Talent Matching</span> Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Connect the right talent with the right opportunities using our
              advanced resume parsing and matching technology.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="btn px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-center transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn px-8 py-3 rounded-lg bg-transparent border border-white hover:bg-white/10 text-white font-medium text-center transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Powerful Features</h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our platform streamlines the hiring process with advanced
              AI-powered tools for both employers and job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card hover:shadow-lg hover:-translate-y-1 duration-300 flex flex-col">
              <div className="text-primary-500 text-3xl mb-6">
                <FontAwesomeIcon icon="file-alt" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Resume Parsing
              </h3>
              <p className="text-gray-300 mb-4 flex-grow">
                Upload your resume in PDF or DOCX format and our AI will
                automatically extract and organize your information.
              </p>
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 inline-flex items-center"
              >
                Learn more
                <FontAwesomeIcon icon="arrow-right" className="ml-2 text-xs" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="card hover:shadow-lg hover:-translate-y-1 duration-300 flex flex-col">
              <div className="text-primary-500 text-3xl mb-6">
                <FontAwesomeIcon icon="bullseye" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Precision Matching</h3>
              <p className="text-gray-300 mb-4 flex-grow">
                Our algorithm analyzes skills, experience, and more to create
                accurate match scores between candidates and job postings.
              </p>
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 inline-flex items-center"
              >
                Learn more
                <FontAwesomeIcon icon="arrow-right" className="ml-2 text-xs" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="card hover:shadow-lg hover:-translate-y-1 duration-300 flex flex-col">
              <div className="text-primary-500 text-3xl mb-6">
                <FontAwesomeIcon icon="comments" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Multi-lingual Support
              </h3>
              <p className="text-gray-300 mb-4 flex-grow">
                Communicate with candidates in their preferred language with our
                integrated translation and AI-powered chatbot.
              </p>
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 inline-flex items-center"
              >
                Learn more
                <FontAwesomeIcon icon="arrow-right" className="ml-2 text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our platform makes it easy for both employers and job seekers to
              find their perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left side - Process steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-700 text-primary-100">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    Create Your Profile
                  </h3>
                  <p className="mt-1 text-gray-300">
                    Sign up and create your profile as a job seeker or employer.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-700 text-primary-100">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    Upload Resume or Post Jobs
                  </h3>
                  <p className="mt-1 text-gray-300">
                    Job seekers upload their resumes while employers post job
                    openings.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-700 text-primary-100">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    AI-Powered Matching
                  </h3>
                  <p className="mt-1 text-gray-300">
                    Our system automatically matches candidates with suitable
                    job openings.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-700 text-primary-100">
                  4
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    Connect and Hire
                  </h3>
                  <p className="mt-1 text-gray-300">
                    Review matches, communicate with potential candidates, and
                    make hiring decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative rounded-xl overflow-hidden h-96 shadow-custom-dark">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-900 to-background-primary opacity-75"></div>
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Hiring process"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background-secondary/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center max-w-xs">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Streamlined Hiring
                  </h3>
                  <p className="text-gray-300">
                    Our platform reduces time-to-hire by up to 60% and improves
                    match quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              What People Are Saying
            </h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              See how Medhavi has helped companies find the perfect candidates
              and job seekers land their dream jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card hover:-translate-y-2 duration-300">
              <div className="flex items-center mb-4">
                <div className="text-primary-500 text-xl">
                  <FontAwesomeIcon icon="quote-left" />
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                "Medhavi's AI matching technology helped us find qualified
                candidates in half the time. The resume parsing feature saved us
                countless hours of manual review."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center">
                  <FontAwesomeIcon icon="user" className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-400">HR Director, TechCorp</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card hover:-translate-y-2 duration-300">
              <div className="flex items-center mb-4">
                <div className="text-primary-500 text-xl">
                  <FontAwesomeIcon icon="quote-left" />
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                "I uploaded my resume and within a week, I was matched with
                three companies that perfectly aligned with my skills and career
                goals. I'm now working at my dream job!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center">
                  <FontAwesomeIcon icon="user" className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Michael Chen</p>
                  <p className="text-sm text-gray-400">Software Developer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card hover:-translate-y-2 duration-300">
              <div className="flex items-center mb-4">
                <div className="text-primary-500 text-xl">
                  <FontAwesomeIcon icon="quote-left" />
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                "The multi-lingual support allowed us to hire international
                talent without language barriers. The matching algorithm
                consistently brings us candidates who are a great cultural fit."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center">
                  <FontAwesomeIcon icon="user" className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Elena Rodriguez</p>
                  <p className="text-sm text-gray-400">CEO, Global Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-background-primary to-background-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of companies and job seekers who have found their
            perfect match with our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
            >
              Get Started Now
            </Link>
            <a
              href="#"
              className="px-8 py-3 rounded-lg bg-transparent border border-white hover:bg-white/10 text-white font-medium transition-colors"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
