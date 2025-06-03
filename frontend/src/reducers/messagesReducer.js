import {
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_SUCCESS,
  MESSAGE_SEND_FAIL,
  MESSAGES_FETCH_REQUEST,
  MESSAGES_FETCH_SUCCESS,
  MESSAGES_FETCH_FAIL,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATION_CREATE_REQUEST,
  CONVERSATION_CREATE_SUCCESS,
  CONVERSATION_CREATE_FAIL,
  MESSAGE_MARK_READ_REQUEST,
  MESSAGE_MARK_READ_SUCCESS,
  MESSAGE_MARK_READ_FAIL,
  SOCKET_USER_TYPING,
  SOCKET_USER_STOP_TYPING,
  SOCKET_MESSAGE_RECEIVED,
  SOCKET_USER_ONLINE,
  SOCKET_USER_OFFLINE,
} from "../constants/messageConstants";

const initialMessagesState = {
  loading: false,
  error: null,
  messages: {},
  conversations: [],
  onlineUsers: new Set(),
  typingUsers: {},
  unreadCounts: {},
};

export const messagesReducer = (state = initialMessagesState, action) => {
  switch (action.type) {
    // Message sending
    case MESSAGE_SEND_REQUEST:
      return { ...state, loading: true };
    case MESSAGE_SEND_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            action.payload,
            ...(state.messages[action.payload.conversationId] || []),
          ],
        },
      };
    case MESSAGE_SEND_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Message fetching
    case MESSAGES_FETCH_REQUEST:
      return { ...state, loading: true };
    case MESSAGES_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };
    case MESSAGES_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Conversation fetching
    case CONVERSATIONS_FETCH_REQUEST:
      return { ...state, loading: true };
    case CONVERSATIONS_FETCH_SUCCESS:
      return { ...state, loading: false, conversations: action.payload };
    case CONVERSATIONS_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Conversation creation
    case CONVERSATION_CREATE_REQUEST:
      return { ...state, loading: true };
    case CONVERSATION_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        conversations: [action.payload, ...state.conversations],
      };
    case CONVERSATION_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Message read status
    case MESSAGE_MARK_READ_REQUEST:
      return { ...state, loading: true };
    case MESSAGE_MARK_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: 0,
        },
      };
    case MESSAGE_MARK_READ_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Socket events
    case SOCKET_USER_TYPING:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: [
            ...(state.typingUsers[action.payload.conversationId] || []),
            action.payload.userId,
          ],
        },
      };
    case SOCKET_USER_STOP_TYPING:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: state.typingUsers[
            action.payload.conversationId
          ]?.filter((id) => id !== action.payload.userId),
        },
      };
    case SOCKET_MESSAGE_RECEIVED:
      const newMessage = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [newMessage.conversationId]: [
            newMessage,
            ...(state.messages[newMessage.conversationId] || []),
          ],
        },
        unreadCounts: {
          ...state.unreadCounts,
          [newMessage.conversationId]:
            (state.unreadCounts[newMessage.conversationId] || 0) + 1,
        },
      };
    case SOCKET_USER_ONLINE:
      return {
        ...state,
        onlineUsers: new Set([...state.onlineUsers, action.payload.userId]),
      };
    case SOCKET_USER_OFFLINE:
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(action.payload.userId);
      return {
        ...state,
        onlineUsers: newOnlineUsers,
      };

    default:
      return state;
  }
};
