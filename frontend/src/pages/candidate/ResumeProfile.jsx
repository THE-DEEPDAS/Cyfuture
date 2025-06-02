import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const ResumeProfile = () => {
  const { resumeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        // If resumeId is provided, fetch that specific resume
        let response;
        if (resumeId) {
          response = await axios.get(`/api/resumes/${resumeId}`);
        } else {
          // Otherwise fetch the default resume or the first one
          response = await axios.get('/api/resumes/default');
        }
        
        setResumeData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resume data:', err);
        setError('Failed to load resume data. Please try again later.');
        setLoading(false);
        
        // For development/demo purposes, set sample data if API fails
        setResumeData({
          title: 'Software Developer Resume',
          parsedData: {
            skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'HTML/CSS', 'GraphQL', 'AWS', 'Docker'],
            experience: [
              {
                title: 'Senior Frontend Developer',
                company: 'Tech Innovations Inc.',
                location: 'San Francisco, CA',
                startDate: '2023-01-01',
                endDate: null, // Current position
                description: 'Led a team of 5 developers to build a modern React-based application. Implemented state management with Redux and optimized performance to improve load times by 40%.'
              },
              {
                title: 'Full Stack Developer',
                company: 'Digital Solutions Co.',
                location: 'Remote',
                startDate: '2021-03-01',
                endDate: '2022-12-31',
                description: 'Developed and maintained multiple client applications using MERN stack. Implemented RESTful APIs and integrated with third-party services.'
              }
            ],
            projects: [
              {
                name: 'E-commerce Platform',
                description: 'Built a full-featured e-commerce platform with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment processing.',
                technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API']
              },
              {
                name: 'Task Management System',
                description: 'Developed a collaborative task management system with real-time updates using Socket.IO and React. Implemented drag-and-drop functionality and user permission system.',
                technologies: ['React', 'Socket.IO', 'Express', 'PostgreSQL']
              }
            ],
            education: [
              {
                institution: 'University of Technology',
                degree: 'Bachelor of Science',
                field: 'Computer Science',
                startDate: '2017-09-01',
                endDate: '2021-05-31'
              }
            ]
          }
        });
      }
    };

    fetchResumeData();
  }, [resumeId]);

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon icon="spinner" spin className="text-4xl text-primary-500 mb-4" />
          <p className="text-gray-300">Loading resume data...</p>
        </div>
      </div>
    );
  }

  if (error && !resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon icon="exclamation-circle" className="text-4xl text-error-500 mb-4" />
          <p className="text-gray-300 mb-4">{error}</p>
          <Link to="/candidate/resume" className="btn-primary">
            Go to Resume Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Resume Profile
            </h1>
            <p className="text-gray-300">
              Extracted data from: {resumeData.title}
            </p>
          </div>
          <Link to="/candidate/resume" className="btn-secondary">
            <FontAwesomeIcon icon="arrow-left" className="mr-2" />
            Back to Resume Manager
          </Link>
        </div>
      </div>

      {/* Skills section */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon="tools" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Skills</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {resumeData.parsedData.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 rounded-full bg-primary-900/30 text-primary-300 border border-primary-700/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="briefcase" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Professional Experience</h2>
        </div>
        
        <div className="space-y-6">
          {resumeData.parsedData.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-primary-700 pl-4 pb-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-white">{exp.title}</h3>
                <span className="text-sm text-gray-400">
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-primary-300 mb-2">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              <p className="text-gray-300">{exp.description}</p>
            </div>
          ))}
          
          {resumeData.parsedData.experience.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-400">No experience data extracted from your resume.</p>
            </div>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon icon="code" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>
        
        <div className="space-y-6">
          {resumeData.parsedData.projects.map((project, index) => (
            <div key={index} className="bg-background-secondary rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">{project.name}</h3>
              <p className="text-gray-300 mb-3">{project.description}</p>
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="px-2 py-0.5 text-xs rounded-full bg-primary-800/30 text-primary-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              {project.url && (
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <FontAwesomeIcon icon="external-link-alt" className="mr-1" />
                  View Project
                </a>
              )}
            </div>
          ))}
          
          {resumeData.parsedData.projects.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-400">No project data extracted from your resume.</p>
            </div>
          )}
        </div>
      </div>

      {/* Education section (if available) */}
      {resumeData.parsedData.education && resumeData.parsedData.education.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon icon="graduation-cap" className="text-primary-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">Education</h2>
          </div>
          
          <div className="space-y-4">
            {resumeData.parsedData.education.map((edu, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <h3 className="font-medium text-white">{edu.degree} in {edu.field}</h3>
                  <p className="text-primary-300">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match rate info with job requirements */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon="percentage" className="text-primary-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Job Match Rate</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Our system analyzes your resume data against job requirements to calculate a match score for each job posting.
        </p>
        
        <Link to="/candidate/jobs" className="btn-primary inline-flex items-center">
          <FontAwesomeIcon icon="search" className="mr-2" />
          View Matching Jobs
        </Link>
      </div>
    </div>
  );
};

export default ResumeProfile;
