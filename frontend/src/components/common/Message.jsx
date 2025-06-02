import React from "react";

const Message = ({ children, variant = "info" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "error":
        return "bg-error-100 text-error-800 border-error-300";
      case "success":
        return "bg-success-100 text-success-800 border-success-300";
      case "warning":
        return "bg-warning-100 text-warning-800 border-warning-300";
      default:
        return "bg-info-100 text-info-800 border-info-300";
    }
  };

  return (
    <div
      className={`p-4 mb-4 rounded-lg border ${getVariantClasses()}`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Message;
