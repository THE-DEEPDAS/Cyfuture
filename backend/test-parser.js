import { parseResumeText } from "./services/simplifiedResumeParser.js";
import fs from "fs";

async function testParser() {
  try {
    console.log("Starting parser test...");
    const pdfBuffer = fs.readFileSync("./test/data/05-versions-space.pdf");
    const result = await parseResumeText(pdfBuffer);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error testing parser:", error);
  }
}

testParser();
