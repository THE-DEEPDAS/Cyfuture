import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";

const ChatbotAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const messagesEndRef = useRef(null);

  // Supported languages
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
  ];

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content:
            "Hello! I'm your AI career assistant. I can help with your job search, resume tips, or answer questions about our platform.",
          isBot: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!newMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Get conversation context for context-aware responses
      const context = messages
        .slice(-4) // Last 4 messages for context
        .map((msg) => `${msg.isBot ? "Assistant" : "User"}: ${msg.content}`)
        .join("\n");
      const response = await api.post("/chat", {
        message: newMessage,
        context,
        language: currentLanguage,
      });

      // Add bot response after a short delay to simulate typing
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: response.data.response,
            isBot: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Chat error:", error);

      // Fallback response for development/demo
      setTimeout(() => {
        let botResponse =
          "I'm sorry, I couldn't process your request right now.";

        // Generate a demo response based on keywords
        if (newMessage.toLowerCase().includes("resume")) {
          botResponse =
            "Your resume is crucial for job applications. Make sure to highlight your key skills and experience relevant to the positions you're applying for.";
        } else if (newMessage.toLowerCase().includes("interview")) {
          botResponse =
            "For interview preparation, research the company, practice common questions, and prepare examples that demonstrate your skills and experience.";
        } else if (newMessage.toLowerCase().includes("job")) {
          botResponse =
            "Our job matching system uses AI to find positions that best match your skills and experience. Make sure your profile is complete for the best results.";
        } else if (newMessage.toLowerCase().includes("thank")) {
          botResponse =
            "You're welcome! I'm here to help with any other questions you might have.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: botResponse,
            isBot: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Handle language change
  const handleLanguageChange = async (code) => {
    setCurrentLanguage(code);

    // Translate welcome message when language changes
    try {
      const response = await axios.post("/api/translate", {
        text: "Hello! I'm your AI career assistant. I can help with your job search, resume tips, or answer questions about our platform.",
        targetLanguage: code,
      });

      // Update welcome message with translated text
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === "welcome"
            ? { ...msg, content: response.data.translatedText }
            : msg
        )
      );
    } catch (error) {
      console.error("Translation error:", error);
      // In development/demo, simulate translation
      if (code === "es") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === "welcome"
              ? {
                  ...msg,
                  content:
                    "¡Hola! Soy tu asistente de carrera con IA. Puedo ayudarte con tu búsqueda de empleo, consejos para tu currículum o responder preguntas sobre nuestra plataforma.",
                }
              : msg
          )
        );
      } else if (code === "fr") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === "welcome"
              ? {
                  ...msg,
                  content:
                    "Bonjour ! Je suis votre assistant de carrière IA. Je peux vous aider dans votre recherche d'emploi, vous donner des conseils sur votre CV ou répondre à vos questions sur notre plateforme.",
                }
              : msg
          )
        );
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        className={`fixed bottom-6 right-6 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors ${
          isChatOpen
            ? "bg-error-500 hover:bg-error-600"
            : "bg-primary-500 hover:bg-primary-600"
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <FontAwesomeIcon
          icon={isChatOpen ? "times" : "comment-dots"}
          className="text-white text-xl"
        />
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 w-96 bg-background-secondary rounded-lg shadow-xl transition-all duration-300 transform origin-bottom-right ${
          isChatOpen
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        {/* Chat header */}
        <div className="bg-primary-900 rounded-t-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center mr-3">
              <FontAwesomeIcon icon="robot" className="text-primary-300" />
            </div>
            <div>
              <h3 className="font-medium text-white">AI Career Assistant</h3>
              <p className="text-xs text-gray-400">
                24/7 help with your job search
              </p>
            </div>
          </div>

          {/* Language selector */}
          <select
            className="bg-primary-800 text-white text-sm border border-primary-700 rounded px-2 py-1"
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chat messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.isBot
                    ? "bg-gray-700 text-white"
                    : "bg-primary-700 text-white"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs text-gray-400 text-right mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg px-4 py-3 max-w-[75%]">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-700">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isTyping}
            />

            <button
              type="submit"
              className="bg-primary-600 text-white rounded-lg p-2 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newMessage.trim() || isTyping}
            >
              <FontAwesomeIcon icon="paper-plane" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatbotAssistant;
