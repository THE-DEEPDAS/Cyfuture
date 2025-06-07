import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ChatbotAssistant = ({ applicationId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluationInProgress, setEvaluationInProgress] = useState(false);
  const messagesEndRef = useRef(null);

  const application = useSelector((state) => state.application?.application);
  const user = useSelector((state) => state.auth.user);

  // Load questions from application job
  useEffect(() => {
    if (application?.job?.screeningQuestions) {
      setQuestions(application.job.screeningQuestions);
    }
  }, [application]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Load messages
  useEffect(() => {
    if (application?.messages) {
      setMessages(application.messages);
    }
  }, [application]);

  // Auto-ask next question when a message is sent
  useEffect(() => {
    const askNextQuestion = async () => {
      // Only proceed if we're not at the end and not currently evaluating
      if (currentQuestionIndex >= questions.length || evaluationInProgress)
        return;

      // If we haven't started questions yet and we have messages (candidate joined)
      if (currentQuestionIndex === -1 && messages.length > 0) {
        setCurrentQuestionIndex(0);
        await sendCompanyMessage(questions[0]);
        return;
      }

      // If we have a candidate's answer to the current question
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender === "candidate") {
        // Store the answer
        setAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: lastMessage.content,
        }));

        // Move to next question
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          await sendCompanyMessage(questions[currentQuestionIndex + 1]);
        } else {
          // All questions answered, evaluate
          setEvaluationInProgress(true);
          await evaluateAnswers();
        }
      }
    };

    askNextQuestion();
  }, [messages, currentQuestionIndex, questions]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!newMessage.trim() || sending) return;

    const tempId = Date.now().toString();

    try {
      setSending(true);

      // Add message optimistically
      const optimisticMessage = {
        id: tempId,
        content: newMessage,
        sender: user.role,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      const response = await api.post(
        `/applications/${applicationId}/messages`,
        {
          content: newMessage,
        }
      );

      // Update messages with server response
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Revert optimistic update
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(newMessage);
    } finally {
      setSending(false);
    }
  };

  // Send message as company
  const sendCompanyMessage = async (content) => {
    try {
      const response = await api.post(
        `/applications/${applicationId}/messages`,
        {
          content,
          sender: "company",
        }
      );

      if (Array.isArray(response.data)) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error sending company message:", error);
      toast.error("Failed to send company message");
    }
  };

  // Evaluate answers
  const evaluateAnswers = async () => {
    try {
      const evaluationData = {
        questions: questions,
        answers: Object.values(answers),
        jobId: application.job._id,
      };

      const response = await api.post(
        `/applications/${applicationId}/evaluate-screening`,
        evaluationData
      );

      // Send evaluation result as a company message
      await sendCompanyMessage(
        `Interview Evaluation Complete\nScore: ${response.data.score}/100\n${response.data.feedback}`
      );

      setEvaluationInProgress(false);
    } catch (error) {
      console.error("Error evaluating answers:", error);
      toast.error("Failed to evaluate answers");
      setEvaluationInProgress(false);
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
        className={`fixed bottom-6 right-6 rounded-full w-16 h-16 flex items-center justify-center shadow-xl transition-colors ${
          isChatOpen
            ? "bg-pink-500 hover:bg-pink-600"
            : "bg-cyan-500 hover:bg-cyan-600"
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <FontAwesomeIcon
          icon={isChatOpen ? "times" : "comment-dots"}
          className="text-white text-2xl"
        />
      </button>

      {/* Chat panel with dark theme */}
      <div
        className={`fixed bottom-24 right-6 w-[400px] bg-gray-900 rounded-lg shadow-2xl border border-gray-800 transition-all duration-300 transform origin-bottom-right ${
          isChatOpen
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        {/* Chat header */}
        <div
          className={`rounded-t-lg p-4 flex items-center justify-between shadow-lg ${
            user.role === "company"
              ? "bg-gradient-to-r from-cyan-600 to-cyan-700"
              : "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700"
          }`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg">
              <FontAwesomeIcon
                icon={user.role === "company" ? "building" : "user"}
                className="text-white/90 text-lg"
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">
                Message Thread
              </h3>
              <p className="text-sm text-white/90 font-medium mt-0.5">
                {user.role === "company"
                  ? "Candidate Messages"
                  : "Company Messages"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-5 bg-gray-900">
          {messages.map((message) => {
            const isOwnMessage = message.sender === user.role;

            return (
              <div
                key={message.id || message._id || Date.now()}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                } items-start gap-3`}
              >
                {!isOwnMessage && (
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-md border border-gray-700/50">
                    <FontAwesomeIcon
                      icon={message.sender === "company" ? "building" : "user"}
                      className="text-gray-300 text-lg"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg ${
                    isOwnMessage
                      ? user.role === "company"
                        ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-cyan-900/20"
                        : "bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 text-white shadow-fuchsia-900/20"
                      : "bg-gray-800/95 text-gray-200 border border-gray-700 shadow-gray-900/10"
                  }`}
                >
                  <p
                    className={`text-[16px] whitespace-pre-line leading-relaxed font-medium ${
                      isOwnMessage ? "text-white/95" : "text-gray-200"
                    }`}
                  >
                    {message.content}
                  </p>
                  <p
                    className={`text-xs ${
                      isOwnMessage ? "text-white/80" : "text-gray-400"
                    } text-right mt-2 font-medium`}
                  >
                    {formatTime(message.createdAt || message.timestamp)}
                  </p>
                </div>
                {isOwnMessage && (
                  <div className="w-10 h-10 rounded-full bg-gray-800/90 flex items-center justify-center flex-shrink-0 shadow-md border border-gray-700">
                    <FontAwesomeIcon
                      icon={user.role === "company" ? "building" : "user"}
                      className="text-gray-300 text-lg"
                    />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-sm">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              className="flex-1 bg-gray-800/90 text-gray-200 text-[16px] border border-gray-700/50 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent placeholder-gray-500 shadow-inner transition-colors duration-200 focus:ring-cyan-500/70"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />

            <button
              type="submit"
              className={`${
                user.role === "company"
                  ? "bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900"
                  : "bg-fuchsia-700 hover:bg-fuchsia-800 active:bg-fuchsia-900"
              } text-gray-100 rounded-lg px-5 py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium text-[16px] active:scale-[0.98] disabled:active:scale-100`}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <FontAwesomeIcon
                  icon="spinner"
                  spin
                  className="text-lg opacity-90"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Send</span>
                  <FontAwesomeIcon
                    icon="paper-plane"
                    className="text-lg opacity-90"
                  />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatbotAssistant;
