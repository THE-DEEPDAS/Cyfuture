// Component for displaying rejection explanations to candidates
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faThumbsUp,
  faListAlt,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const RejectionExplanation = ({ application }) => {
  if (
    !application ||
    application.status !== "rejected" ||
    !application.rejectionReason
  ) {
    return null;
  }

  // Extract skills that may be mentioned in the rejection reason
  const extractSkills = (text) => {
    if (!text) return [];

    // Common skill-related terms that might be mentioned
    const skillTerms = [
      "experience",
      "skill",
      "knowledge",
      "proficiency",
      "background",
      "expertise",
    ];

    // Try to identify skills mentioned in the rejection reason
    const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
    const skillSentences = sentences.filter((sentence) =>
      skillTerms.some((term) => sentence.toLowerCase().includes(term))
    );

    if (skillSentences.length === 0) return [];

    // Return the skill sentences
    return skillSentences.map((s) => s.trim());
  };

  const skillsHighlights = extractSkills(application.rejectionReason);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-600"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Application Status: Rejected
        </h2>
      </div>

      <div className="border-l-4 border-red-200 pl-4 py-2 mb-4">
        <p className="text-gray-700">{application.rejectionReason}</p>
      </div>

      {skillsHighlights.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            <FontAwesomeIcon icon={faListAlt} className="mr-2 text-blue-500" />
            Areas to Improve
          </h3>
          <ul className="list-disc list-inside pl-2 text-gray-700">
            {skillsHighlights.map((skill, index) => (
              <li key={index} className="mb-1">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <div className="text-sm text-gray-500">
          <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
          Don't give up! Consider this feedback as a learning opportunity.
        </div>

        <button
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
          onClick={() => (window.location.href = "/jobs")}
        >
          <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
          Find Similar Jobs
        </button>
      </div>
    </div>
  );
};

export default RejectionExplanation;
