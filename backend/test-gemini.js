import { getLLMResponse } from "./utils/llm.js";

async function testGemini() {
  try {
    console.log("Testing Gemini API integration...");
    const response = await getLLMResponse(
      "Explain how AI works in a few words"
    );
    console.log("LLM Response:", response);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testGemini();
