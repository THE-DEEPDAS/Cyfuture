import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatMessages, sendChatMessage } from '../redux/actions/chatActions';
import Loader from '../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faComments, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);
  const { userInfo } = useSelector((state) => state.auth);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatMessages());
  }, [dispatch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(sendChatMessage({ text: input, user: userInfo?.name || 'User' }));
      setInput('');
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col h-[80vh]">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faComments} className="text-primary-400" /> Chatbot
      </h1>
      <div className="flex-1 overflow-y-auto bg-dark-800 p-6 rounded-lg shadow-md mb-4">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="alert-danger">{error}</div>
        ) : (
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.user === (userInfo?.name || 'User') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${msg.user === (userInfo?.name || 'User') ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon icon={faUserCircle} className="text-gray-400" />
                      <span className="font-semibold">{msg.user}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No messages yet.</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="form-input flex-1 bg-dark-700 text-white border-none focus:ring-primary-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <FontAwesomeIcon icon={faPaperPlane} />
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
