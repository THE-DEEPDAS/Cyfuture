const fs = require("fs");
const path = require("path");

// Create a CommonJS wrapper for ES modules
async function runTest() {
  try {
    // Dynamically import the ES module
    const parser = await import("./services/simplifiedResumeParser.js");

    console.log("Starting parser test...");
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

    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log("PDF file loaded, size:", pdfBuffer.length, "bytes");

    const result = await parser.parseResumeText(pdfBuffer);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error testing parser:", error);
  }
}

runTest();
