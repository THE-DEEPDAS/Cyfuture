import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import fetch from 'node-fetch';

// @desc    Get or create user chat
// @route   GET /api/chat
// @access  Private
const getUserChat = asyncHandler(async (req, res) => {
  let chat = await Chat.findOne({ user: req.user._id });

  if (!chat) {
    // Create new chat with welcome message
    chat = await Chat.create({
      user: req.user._id,
      messages: [
        {
          sender: 'bot',
          content: `Welcome to TalentMatch! How can I help you today?`,
          language: req.user.preferredLanguage || 'en',
        },
      ],
    });
  }

  res.json(chat);
});

// @desc    Send message to chatbot
// @route   POST /api/chat/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { message, language } = req.body;
  
  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  let chat = await Chat.findOne({ user: req.user._id });

  if (!chat) {
    chat = await Chat.create({
      user: req.user._id,
      messages: [],
    });
  }

  // Add user message to chat
  chat.messages.push({
    sender: 'user',
    content: message,
    language: language || req.user.preferredLanguage || 'en',
  });

  // Get bot response
  const botResponse = await getBotResponse(message, language || req.user.preferredLanguage || 'en');

  // Add bot response to chat
  chat.messages.push({
    sender: 'bot',
    content: botResponse,
    language: language || req.user.preferredLanguage || 'en',
  });

  // Update last activity
  chat.lastActivity = Date.now();
  
  await chat.save();

  res.json(chat);
});

// @desc    Get admin access to user chat
// @route   GET /api/chat/admin/:userId
// @access  Private/Admin
const getAdminChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ user: req.params.userId });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.json(chat);
});

// @desc    Send admin message to user
// @route   POST /api/chat/admin/:userId
// @access  Private/Admin
const sendAdminMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  const chat = await Chat.findOne({ user: req.params.userId });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Add admin message to chat
  chat.messages.push({
    sender: 'admin',
    content: message,
    language: 'en', // Admin messages are in English by default
  });

  // Update last activity
  chat.lastActivity = Date.now();
  
  await chat.save();

  res.json(chat);
});

// Helper function to get bot response
// In production, this would call the Gemini API
const getBotResponse = async (message, language) => {
  try {
    // Placeholder responses based on common questions
    const responses = {
      en: {
        default: "I'm here to help with your job search and application process. What would you like to know?",
        resume: "To upload your resume, go to your profile and click on 'Upload Resume'. We support PDF and DOCX formats.",
        apply: "To apply for a job, first make sure you've uploaded your resume. Then browse jobs, click on one you're interested in, and click the 'Apply' button.",
        status: "You can check the status of your applications in the 'My Applications' section of your dashboard.",
        match: "Our system analyzes your resume against job requirements to calculate a match score. This helps you find jobs that are a good fit for your skills and experience.",
        interview: "If your application is selected, you'll receive a notification and the employer may schedule an interview through our platform.",
      },
      es: {
        default: "Estoy aquí para ayudarte con tu búsqueda de empleo y proceso de solicitud. ¿Qué te gustaría saber?",
        resume: "Para subir tu currículum, ve a tu perfil y haz clic en 'Subir Currículum'. Admitimos formatos PDF y DOCX.",
        apply: "Para solicitar un trabajo, primero asegúrate de haber subido tu currículum. Luego navega por los trabajos, haz clic en uno que te interese y haz clic en el botón 'Aplicar'.",
        status: "Puedes verificar el estado de tus solicitudes en la sección 'Mis Solicitudes' de tu panel de control.",
        match: "Nuestro sistema analiza tu currículum frente a los requisitos del trabajo para calcular una puntuación de coincidencia. Esto te ayuda a encontrar trabajos que se ajusten a tus habilidades y experiencia.",
        interview: "Si tu solicitud es seleccionada, recibirás una notificación y el empleador puede programar una entrevista a través de nuestra plataforma.",
      },
    };

    // Simple keyword matching for demo purposes
    if (message.toLowerCase().includes('resume') || message.toLowerCase().includes('cv') || message.toLowerCase().includes('currículum')) {
      return responses[language]?.resume || responses.en.resume;
    } else if (message.toLowerCase().includes('apply') || message.toLowerCase().includes('application') || message.toLowerCase().includes('aplicar')) {
      return responses[language]?.apply || responses.en.apply;
    } else if (message.toLowerCase().includes('status') || message.toLowerCase().includes('estado')) {
      return responses[language]?.status || responses.en.status;
    } else if (message.toLowerCase().includes('match') || message.toLowerCase().includes('score') || message.toLowerCase().includes('puntuación')) {
      return responses[language]?.match || responses.en.match;
    } else if (message.toLowerCase().includes('interview') || message.toLowerCase().includes('entrevista')) {
      return responses[language]?.interview || responses.en.interview;
    } else {
      return responses[language]?.default || responses.en.default;
    }
  } catch (error) {
    console.error('Error getting bot response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};

export { getUserChat, sendMessage, getAdminChat, sendAdminMessage };