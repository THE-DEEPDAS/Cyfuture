import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateApplicationStatus } from '../../actions/applicationActions';
import Message from '../common/Message';
import Loader from '../common/Loader';

const CandidateReview = ({ application, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [selectedTab, setSelectedTab] = useState('llm');

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      setError(null);
      await dispatch(updateApplicationStatus(application._id, newStatus));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderScoreBar = (score, label) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{Math.round(score)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={\`\${getScoreColor(score)} h-2 rounded-full transition-all duration-300\`}
          style={{ width: \`\${Math.min(100, Math.round(score))}%\` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-auto overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Candidate Review</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FontAwesomeIcon icon="times" size="lg" />
        </button>
      </div>

      {error && <Message variant="error">{error}</Message>}

      <div className="p-6">
        {/* Candidate Info */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">{application.resume.name}</h3>
            <p className="text-gray-600">{application.resume.email}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleStatusChange('shortlisted')}
              disabled={loading || application.status === 'shortlisted'}
              className={\`px-4 py-2 rounded-lg font-medium \${
                application.status === 'shortlisted'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition-colors disabled:opacity-50\`}
            >
              <FontAwesomeIcon icon="check" className="mr-2" />
              Shortlist
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={loading || application.status === 'rejected'}
              className={\`px-4 py-2 rounded-lg font-medium \${
                application.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } transition-colors disabled:opacity-50\`}
            >
              <FontAwesomeIcon icon="times" className="mr-2" />
              Reject
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setSelectedTab('llm')}
              className={\`py-4 px-1 font-medium border-b-2 \${
                selectedTab === 'llm'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors\`}
            >
              AI Analysis
            </button>
            <button
              onClick={() => setSelectedTab('screening')}
              className={\`py-4 px-1 font-medium border-b-2 \${
                selectedTab === 'screening'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors\`}
            >
              Screening Questions
            </button>
            <button
              onClick={() => setSelectedTab('resume')}
              className={\`py-4 px-1 font-medium border-b-2 \${
                selectedTab === 'resume'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors\`}
            >
              Resume Details
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'llm' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overall Score */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold mb-4">Overall Evaluation</h4>
              {renderScoreBar(application.overallEvaluation.totalScore, 'Total Match Score')}
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderScoreBar(
                  application.overallEvaluation.breakdown.screeningQuestionsScore,
                  'Screening Questions'
                )}
                {renderScoreBar(
                  application.overallEvaluation.breakdown.resumeMatchScore,
                  'Resume Match'
                )}
                {renderScoreBar(
                  application.overallEvaluation.breakdown.llmAnalysisScore,
                  'AI Confidence'
                )}
              </div>
            </div>

            {/* LLM Analysis */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="text-green-800 font-medium mb-2">Strengths</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {application.analysisDetails.strengths.map((strength, i) => (
                    <li key={i} className="text-green-700">{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-red-800 font-medium mb-2">Gaps/Areas for Improvement</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {application.analysisDetails.gaps.map((gap, i) => (
                    <li key={i} className="text-red-700">{gap}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-800 font-medium mb-2">Analysis Summary</h4>
                <p className="text-blue-700">{application.analysisDetails.summary}</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'screening' && (
          <div className="space-y-6 animate-fadeIn">
            {application.screeningResponses.map((response, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-gray-900 font-medium">{response.question}</h4>
                  <span className={\`px-2 py-1 rounded-full text-sm font-medium \${
                    response.llmEvaluation.score >= 85
                      ? 'bg-green-100 text-green-700'
                      : response.llmEvaluation.score >= 70
                      ? 'bg-blue-100 text-blue-700'
                      : response.llmEvaluation.score >= 50
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }\`}>
                    Score: {Math.round(response.llmEvaluation.score)}%
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{response.response}</p>
                <div className="text-sm text-gray-500">
                  <strong>AI Feedback:</strong> {response.llmEvaluation.feedback}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'resume' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(showAllSkills
                  ? application.resume.skills
                  : application.resume.skills.slice(0, 8)
                ).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {application.resume.skills.length > 8 && !showAllSkills && (
                  <button
                    onClick={() => setShowAllSkills(true)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    +{application.resume.skills.length - 8} more
                  </button>
                )}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Experience</h4>
              <div className="space-y-4">
                {application.resume.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{exp.title}</h5>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString()} -{' '}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString()
                        : 'Present'}
                    </p>
                    <p className="mt-2 text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Education</h4>
              <div className="space-y-4">
                {application.resume.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(edu.graduationDate).getFullYear()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateReview;
