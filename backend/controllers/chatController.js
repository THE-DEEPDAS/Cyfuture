import {
  generateChatResponse,
  translateText,
  detectLanguage,
} from "../utils/llm.js";

/**
 * @desc    Get AI response to user message
 * @route   POST /api/chat
 * @access  Private
 */
export const getChatResponse = async (req, res) => {
  try {
    const { message, context = "", language = "en" } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Generate response
    const response = await generateChatResponse(context, message, language);

    res.json({ response });
  } catch (error) {
    console.error("Chat response error:", error);
    res.status(500).json({ message: "Error generating chat response" });
  }
};

/**
 * @desc    Translate text to a different language
 * @route   POST /api/translate
 * @access  Private
 */
export const translateContent = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required" });
    }

    // Translate text
    const translatedText = await translateText(text, targetLanguage);

    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ message: "Error translating text" });
  }
};

/**
 * @desc    Detect language of text
 * @route   POST /api/detect-language
 * @access  Private
 */
export const detectContentLanguage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Detect language
    const detectedLanguage = await detectLanguage(text);

    res.json({ detectedLanguage });
  } catch (error) {
    console.error("Language detection error:", error);
    res.status(500).json({ message: "Error detecting language" });
  }
};

export default {
  getChatResponse,
  translateContent,
  detectContentLanguage,
};
