import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";

const BulkMessageModal = ({ jobId, jobTitle, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        `/api/applications/job/${jobId}/message`,
        {
          content: message,
          minMatchScore,
        }
      );

      setSuccess(
        `Message sent successfully to ${response.data.count} candidates!`
      );
      setLoading(false);

      // Call the success callback after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data);
      }, 1500);
    } catch (err) {
      console.error("Error sending bulk message:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send messages. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-lg w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-primary-900 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Send Bulk Message
            </h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-1">Job: {jobTitle}</p>
        </div>

        {/* Content */}
        <div className="p-5">
          {success ? (
            <div className="text-center py-8">
              <div className="mb-4 text-5xl text-success-500">
                <FontAwesomeIcon icon="check-circle" />
              </div>
              <p className="text-white font-medium">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-error-900/30 border border-error-800 rounded-md text-error-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Minimum Match Score
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center text-gray-300 font-medium">
                    {minMatchScore}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Only send to candidates with a match score of at least{" "}
                  {minMatchScore}%
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="5"
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your message to candidates..."
                  required
                ></textarea>
              </div>

              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-dark-600 text-gray-300 hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="paper-plane" className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkMessageModal;
