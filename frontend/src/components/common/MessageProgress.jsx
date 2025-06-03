import React from "react";
import PropTypes from "prop-types";

const MessageProgress = ({ current, total, successful, failed }) => {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-700">Sending messages...</span>
        <span className="font-medium">{progress}%</span>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>
          {current} of {total} sent
        </span>
        <div>
          <span className="text-green-600">{successful} successful</span>
          {failed > 0 && (
            <span className="ml-2 text-red-600">{failed} failed</span>
          )}
        </div>
      </div>
    </div>
  );
};

MessageProgress.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  successful: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
};

export default MessageProgress;
