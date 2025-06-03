import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  sendBulkMessages,
  retryFailedMessages,
} from "../../actions/messageActions";
import Loader from "../common/Loader";
import Message from "../common/Message";
import MessageProgress from "../common/MessageProgress";

const MESSAGE_TEMPLATES = {
  shortlisted: {
    subject: "Application Update: Shortlisted for Interview",
    body: `Dear {name},

We are pleased to inform you that your application for the {position} role has been shortlisted for the next round of our hiring process.

We were particularly impressed with your {strengths}. 

We will be in touch shortly with more details about the next steps.

Best regards,
{companyName}`,
  },
  rejected: {
    subject: "Application Status Update",
    body: `Dear {name},

Thank you for your interest in the {position} role at {companyName}.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate you taking the time to apply and wish you the best in your job search.

Best regards,
{companyName}`,
  },
  interview: {
    subject: "Interview Invitation",
    body: `Dear {name},

We would like to invite you for an interview for the {position} role.

Please click the link below to schedule a time that works best for you:
{interviewLink}

If you have any questions, feel free to reach out.

Best regards,
{companyName}`,
  },
};

const BulkMessageModal = ({
  applications,
  selectedJob,
  shortlistedCandidates,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    successful: 0,
    failed: 0,
  });

  useEffect(() => {
    if (selectedTemplate) {
      const template = MESSAGE_TEMPLATES[selectedTemplate];
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [selectedTemplate]);

  const getFilteredRecipients = () => {
    return applications.filter((app) => {
      switch (recipientFilter) {
        case "shortlisted":
          return shortlistedCandidates.includes(app._id);
        case "pending":
          return app.status === "pending";
        case "all":
        default:
          return true;
      }
    });
  };

  const replaceVariables = (text, application) => {
    return text
      .replace(/{name}/g, application.candidate.name)
      .replace(/{position}/g, application.job.title)
      .replace(/{companyName}/g, application.job.company.name)
      .replace(
        /{strengths}/g,
        application.analysisDetails?.strengths?.join(", ") || "qualifications"
      )
      .replace(
        /{interviewLink}/g,
        "[Interview scheduling link will be inserted here]"
      );
  };

  const handlePreview = () => {
    if (!subject || !body) {
      toast.error("Please fill in both subject and message body");
      return;
    }

    const recipients = getFilteredRecipients();
    if (recipients.length === 0) {
      toast.error("No recipients match the selected filter");
      return;
    }

    const firstRecipient = recipients[0];
    const previewText = replaceVariables(body, firstRecipient);
    setPreview({
      to: firstRecipient.candidate.name,
      subject: replaceVariables(subject, firstRecipient),
      body: previewText,
    });
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: 0, successful: 0, failed: 0 });

      const recipients = getFilteredRecipients();
      if (recipients.length === 0) {
        toast.error("No recipients match the selected filter");
        return;
      }

      const messages = recipients.map((app) => ({
        recipientId: app.candidate._id,
        subject: replaceVariables(subject, app),
        content: replaceVariables(body, app),
        applicationId: app._id,
        jobId: app.job._id,
        type:
          selectedTemplate === "interview"
            ? "Invite"
            : selectedTemplate === "rejected"
            ? "Rejection"
            : "Information",
      }));

      const result = await dispatch(
        sendBulkMessages(messages, { batchSize: 10 })
      );

      if (result.failed.length > 0) {
        // Retry failed messages once
        const retryResult = await dispatch(retryFailedMessages(result.failed));
        result.successful.push(...retryResult.successful);
        result.failed = retryResult.failed;
      }

      if (result.failed.length === 0) {
        toast.success(
          `Successfully sent message to all ${result.successful.length} recipients`
        );
        onClose();
      } else {
        toast.warning(
          `Message sent to ${result.successful.length} recipients, failed for ${result.failed.length} recipients`
        );
        setError(
          `Failed to send messages to ${result.failed.length} recipients. Please try again later.`
        );
      }
    } catch (err) {
      setError(err.message || "Failed to send messages");
      toast.error("Error sending messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Bulk Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <FontAwesomeIcon icon="times" size="lg" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <Message variant="error" className="mb-4">
              {error}
            </Message>
          )}
          {loading && (
            <div className="mb-6">
              <MessageProgress
                current={progress.current}
                total={progress.total}
                successful={progress.successful}
                failed={progress.failed}
              />
            </div>
          )}

          <div className="space-y-6">
            {/* Recipients Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Candidates</option>
                <option value="shortlisted">Shortlisted Only</option>
                <option value="pending">Pending Review</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {getFilteredRecipients().length} recipients selected
              </p>
            </div>

            {/* Message Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate("shortlisted")}
                  className={`p-4 rounded-lg text-left border ${
                    selectedTemplate === "shortlisted"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">
                    Shortlist Notice
                  </h3>
                  <p className="text-sm text-gray-600">
                    Inform candidates they've been shortlisted
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate("rejected")}
                  className={`p-4 rounded-lg text-left border ${
                    selectedTemplate === "rejected"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">
                    Rejection Notice
                  </h3>
                  <p className="text-sm text-gray-600">
                    Politely inform candidates they weren't selected
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate("interview")}
                  className={`p-4 rounded-lg text-left border ${
                    selectedTemplate === "interview"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">
                    Interview Invitation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Schedule interviews with candidates
                  </p>
                </button>
              </div>
            </div>

            {/* Subject & Body */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input"
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <label
                  htmlFor="body"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows="8"
                  className="input"
                  placeholder="Enter your message"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available variables: {"{name}"}, {"{position}"},{" "}
                  {"{companyName}"}, {"{strengths}"}
                </p>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>To:</strong> {preview.to}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {preview.subject}
                  </p>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    <strong>Message:</strong>
                    <br />
                    {preview.body}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-secondary"
            disabled={loading}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="btn btn-primary"
            disabled={loading || !subject || !body}
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="paper-plane" className="mr-2" />
                Send ({getFilteredRecipients().length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

BulkMessageModal.propTypes = {
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      candidate: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      job: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        company: PropTypes.shape({
          name: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
      status: PropTypes.string.isRequired,
      analysisDetails: PropTypes.shape({
        strengths: PropTypes.arrayOf(PropTypes.string),
      }),
    })
  ).isRequired,
  selectedJob: PropTypes.string,
  shortlistedCandidates: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkMessageModal;
