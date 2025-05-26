import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Message = ({ variant, children }) => {
  let icon;
  let className = 'flex items-start p-4 mb-4 rounded-lg';

  switch (variant) {
    case 'success':
      className += ' bg-green-100 text-green-800 border border-green-200';
      icon = 'check-circle';
      break;
    case 'error':
      className += ' bg-red-100 text-red-800 border border-red-200';
      icon = 'times-circle';
      break;
    case 'warning':
      className += ' bg-amber-100 text-amber-800 border border-amber-200';
      icon = 'exclamation-triangle';
      break;
    case 'info':
    default:
      className += ' bg-blue-100 text-blue-800 border border-blue-200';
      icon = 'info-circle';
      break;
  }

  return (
    <div className={className} role="alert">
      <div className="flex-shrink-0 mr-3">
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
      <div>{children}</div>
    </div>
  );
};

Message.defaultProps = {
  variant: 'info',
};

export default Message;