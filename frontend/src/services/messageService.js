import api from "../utils/api";

export const fetchMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data.messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const fetchApplicationMessages = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Error fetching application messages:", error);
    throw error;
  }
};

export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post("/messages", {
      conversationId,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const sendApplicationMessage = async (applicationId, content) => {
  try {
    const response = await api.post(`/applications/${applicationId}/messages`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending application message:", error);
    throw error;
  }
};

export const markConversationAsRead = async (conversationId) => {
  try {
    await api.put(`/messages/conversations/${conversationId}/read`);
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get("/messages/unread/count");
    return response.data.count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};
