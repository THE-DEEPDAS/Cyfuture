// Socket action types
export const SOCKET_MESSAGE_RECEIVED = "SOCKET_MESSAGE_RECEIVED";
export const SOCKET_USER_TYPING = "SOCKET_USER_TYPING";
export const SOCKET_USER_STOP_TYPING = "SOCKET_USER_STOP_TYPING";
export const SOCKET_USER_ONLINE = "SOCKET_USER_ONLINE";
export const SOCKET_USER_OFFLINE = "SOCKET_USER_OFFLINE";

// Bulk message handling
export const BULK_MESSAGE_PROGRESS = "BULK_MESSAGE_PROGRESS";
export const MESSAGE_RETRY_REQUEST = "MESSAGE_RETRY_REQUEST";
export const MESSAGE_RETRY_SUCCESS = "MESSAGE_RETRY_SUCCESS";
export const MESSAGE_RETRY_FAIL = "MESSAGE_RETRY_FAIL";

// Message read status
export const MESSAGE_MARK_READ_REQUEST = "MESSAGE_MARK_READ_REQUEST";
export const MESSAGE_MARK_READ_SUCCESS = "MESSAGE_MARK_READ_SUCCESS";
export const MESSAGE_MARK_READ_FAIL = "MESSAGE_MARK_READ_FAIL";

// Message action types
export const MESSAGE_SEND_REQUEST = "MESSAGE_SEND_REQUEST";
export const MESSAGE_SEND_SUCCESS = "MESSAGE_SEND_SUCCESS";
export const MESSAGE_SEND_FAIL = "MESSAGE_SEND_FAIL";

// Message-related constants
export const MESSAGES_FETCH_REQUEST = "MESSAGES_FETCH_REQUEST";
export const MESSAGES_FETCH_SUCCESS = "MESSAGES_FETCH_SUCCESS";
export const MESSAGES_FETCH_FAIL = "MESSAGES_FETCH_FAIL";
export const MESSAGE_RECEIVED = "MESSAGE_RECEIVED";
export const MESSAGE_SENT = "MESSAGE_SENT";
export const MESSAGE_READ_STATUS_UPDATED = "MESSAGE_READ_STATUS_UPDATED";
export const TYPING_STATUS_UPDATED = "TYPING_STATUS_UPDATED";
export const MESSAGES_RESET = "MESSAGES_RESET";

// Thread-related constants
export const THREAD_CREATE_REQUEST = "THREAD_CREATE_REQUEST";
export const THREAD_CREATE_SUCCESS = "THREAD_CREATE_SUCCESS";
export const THREAD_CREATE_FAIL = "THREAD_CREATE_FAIL";
export const THREAD_FETCH_REQUEST = "THREAD_FETCH_REQUEST";
export const THREAD_FETCH_SUCCESS = "THREAD_FETCH_SUCCESS";
export const THREAD_FETCH_FAIL = "THREAD_FETCH_FAIL";

// Conversation-related constants
export const CONVERSATIONS_FETCH_REQUEST = "CONVERSATIONS_FETCH_REQUEST";
export const CONVERSATIONS_FETCH_SUCCESS = "CONVERSATIONS_FETCH_SUCCESS";
export const CONVERSATIONS_FETCH_FAIL = "CONVERSATIONS_FETCH_FAIL";
export const CONVERSATION_CREATE_REQUEST = "CONVERSATION_CREATE_REQUEST";
export const CONVERSATION_CREATE_SUCCESS = "CONVERSATION_CREATE_SUCCESS";
export const CONVERSATION_CREATE_FAIL = "CONVERSATION_CREATE_FAIL";

// Message status
export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
};

// Message templates
export const MESSAGE_TEMPLATES = {
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
