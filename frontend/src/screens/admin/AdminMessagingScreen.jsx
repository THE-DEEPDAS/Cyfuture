import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getJobDetails } from '../../actions/jobActions';
import { sendMessage, getJobMessages } from '../../actions/messageActions';
import { MESSAGE_CREATE_RESET } from '../../constants/messageConstants';
import { MESSAGE_TYPES } from '../../config';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AdminMessagingScreen = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES[0]);
  
  const jobDetails = useSelector((state) => state.jobDetails);
  const { loading: jobLoading, error: jobError, job } = jobDetails;
  
  const messageCreate = useSelector((state) => state.messageCreate);
  const { loading: sendLoading, error: sendError, success: sendSuccess } = messageCreate;
  
  const messageList = useSelector((state) => state.messageList);
  const { loading: messagesLoading, error: messagesError, messages } = messageList;
  
  useEffect(() => {
    dispatch(getJobDetails(jobId));
    dispatch(getJobMessages(jobId));
  }, [dispatch, jobId]);
  
  useEffect(() => {
    if (sendSuccess) {
      setSubject('');
      setContent('');
      dispatch({ type: MESSAGE_CREATE_RESET });
      dispatch(getJobMessages(jobId));
    }
  }, [dispatch, jobId, sendSuccess]);
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    if (!subject || !content) {
      return;
    }
    
    dispatch(sendMessage(jobId, subject, content, messageType));
  };
  
  // Template messages
  const messageTemplates = {
    'Interview Invitation': {
      subject: 'Interview Invitation for [Job Title] Position',
      content: `Dear Applicant,

We are pleased to inform you that you have been shortlisted for the [Job Title] position at our company. We would like to invite you for an interview to further discuss your qualifications and experience.

Please let us know your availability for the coming week, and we will schedule a time that works for both parties.

Looking forward to speaking with you soon.

Best regards,
[Your Name]
[Company Name]`
    },
    'Rejection': {
      subject: 'Update Regarding Your Application for [Job Title]',
      content: `Dear Applicant,

Thank you for your interest in the [Job Title] position and for taking the time to apply.

After careful consideration of all applications, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely align with our current needs.

We appreciate your interest in our company and wish you success in your job search.

Best regards,
[Your Name]
[Company Name]`
    },
    'Additional Information': {
      subject: 'Additional Information Required for Your Application',
      content: `Dear Applicant,

Thank you for applying for the [Job Title] position at our company.

To proceed with your application, we need some additional information. Could you please provide:

1. Your earliest possible start date
2. Your salary expectations
3. References from previous employers

Please reply to this message with the requested information at your earliest convenience.

Thank you for your cooperation.

Best regards,
[Your Name]
[Company Name]`
    }
  };
  
  const applyTemplate = (templateName) => {
    const template = messageTemplates[templateName];
    if (template) {
      let updatedSubject = template.subject;
      let updatedContent = template.content;
      
      // Replace placeholders with actual data
      if (job) {
        updatedSubject = updatedSubject.replace('[Job Title]', job.title);
        updatedContent = updatedContent.replace(/\[Job Title\]/g, job.title);
        updatedContent = updatedContent.replace(/\[Company Name\]/g, job.admin?.companyName || '');
      }
      
      setSubject(updatedSubject);
      setContent(updatedContent);
      
      // Set appropriate message type
      if (templateName === 'Interview Invitation') {
        setMessageType('Invite');
      } else if (templateName === 'Rejection') {
        setMessageType('Rejection');
      } else {
        setMessageType('Information');
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/admin/jobs/${jobId}/applications`} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FontAwesomeIcon icon="arrow-left" className="mr-2" />
        Back to Applications
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold">Message Applicants</h1>
              {job && (
                <p className="text-gray-600">
                  For job: <span className="font-medium">{job.title}</span>
                </p>
              )}
            </div>
            
            <div className="p-6">
              {sendError && <Message variant="error">{sendError}</Message>}
              {sendSuccess && <Message variant="success">Message sent successfully!</Message>}
              
              <form onSubmit={submitHandler}>
                <div className="mb-4">
                  <label htmlFor="messageType" className="block text-gray-700 font-medium mb-2">
                    Message Type
                  </label>
                  <select
                    id="messageType"
                    className="input"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    required
                  >
                    {MESSAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                    Message Content
                  </label>
                  <textarea
                    id="content"
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your message to applicants"
                    rows="10"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendLoading || !subject || !content}
                  >
                    {sendLoading ? (
                      <>
                        <Loader size="sm" />
                        <span className="ml-2">Sending...</span>
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
            </div>
          </div>
        </div>
        
        {/* Templates and Message History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Message Templates</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => applyTemplate('Interview Invitation')}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-blue-700">Interview Invitation</div>
                  <div className="text-sm text-blue-600">Invite shortlisted candidates for an interview</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => applyTemplate('Rejection')}
                  className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-red-700">Rejection</div>
                  <div className="text-sm text-red-600">Politely decline applicants who don't match requirements</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => applyTemplate('Additional Information')}
                  className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-amber-700">Additional Information</div>
                  <div className="text-sm text-amber-600">Request more details from promising candidates</div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Messages</h2>
            </div>
            
            <div className="p-4">
              {messagesLoading ? (
                <Loader />
              ) : messagesError ? (
                <Message variant="error">{messagesError}</Message>
              ) : messages && messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No messages sent yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{msg.subject}</div>
                        <span className={`text-xs ${
                          msg.type === 'Invite' ? 'bg-green-100 text-green-800' :
                          msg.type === 'Rejection' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        } px-2 py-0.5 rounded-full`}>
                          {msg.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {new Date(msg.createdAt).toLocaleDateString()} • 
                        {msg.recipients.length} recipients
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagingScreen;