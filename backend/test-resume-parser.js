// Test script for simplified resume parser
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseResumeText } from "./services/simplifiedResumeParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testParser() {
  try {
    console.log("Starting parser test...");

    // Check if test PDF exists
    const pdfPath = path.join(
      __dirname,
      "test",
      "data",
      "05-versions-space.pdf"
    );
    if (!fs.existsSync(pdfPath)) {
      console.error("Test PDF file not found at:", pdfPath);
      return;
    }

    console.log("Found test PDF at:", pdfPath);
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log("PDF loaded, size:", pdfBuffer.length, "bytes");

    const result = await parseResumeText(pdfBuffer);
    console.log("Parsing complete! Results:");
    console.log("Skills:", result.skills);
    console.log("Experience:", result.experience);
    console.log("Projects:", result.projects);
  } catch (error) {
    console.error("Error testing parser:", error);
    console.error(error.stack);
  }
}

testParser();
