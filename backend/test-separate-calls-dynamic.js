/**
 * Test script for the separate calls resume extractor
 */

// Import Node.js filesystem module
import fs from "fs";
import path from "path";

// Import the function dynamically
async function importModule() {
  try {
    // Using dynamic import to load the module
    const module = await import("./services/separateCallsResumeExtractor.js");
    return module;
  } catch (error) {
    console.error("Error importing module:", error.message);
    throw error;
  }
}

// Test the separate calls extractor with a real resume
async function testSeparateCallsExtractor() {
  try {
    // First import the module
    const { parseResumeWithLLM, extractResumeDataWithLLM } =
      await importModule();
    console.log("Successfully imported the module");

    // Read the sample resume text
    console.log("Reading sample resume text...");
    const resumeText = fs.readFileSync(
      path.join(process.cwd(), "test", "data", "05-versions-space.pdf.txt"),
      "utf8"
    );

    console.log("Sample resume content (first 200 chars):");
    console.log(resumeText.substring(0, 200) + "...");

    // Test the extraction with the sample resume
    console.log("\nTesting separate calls resume extraction...");
    const extractedData = await extractResumeDataWithLLM(resumeText);

    // Log the results
    console.log("\nExtracted Data:");
    console.log(
      "Skills:",
      extractedData.skills.length ? extractedData.skills : "None found"
    );

    console.log("\nExperience:");
    if (extractedData.experience.length) {
      extractedData.experience.forEach((exp, i) => {
        console.log(`\nExperience #${i + 1}:`);
        console.log(`  Title: ${exp.title}`);
        console.log(`  Company: ${exp.company}`);
        console.log(`  Location: ${exp.location}`);
        console.log(
          `  Period: ${exp.startDate} to ${exp.endDate || "Present"}`
        );
        console.log(`  Description: ${exp.description}`);
      });
    } else {
      console.log("None found");
    }

    console.log("\nProjects:");
    if (extractedData.projects.length) {
      extractedData.projects.forEach((proj, i) => {
        console.log(`\nProject #${i + 1}:`);
        console.log(`  Name: ${proj.name}`);
        console.log(`  Description: ${proj.description}`);
        console.log(`  Technologies: ${proj.technologies.join(", ")}`);
        console.log(`  URL: ${proj.url || "N/A"}`);
      });
    } else {
      console.log("None found");
    }

    console.log("\nTest completed successfully!");
    return extractedData;
  } catch (error) {
    console.error("Error testing separate calls extractor:", error);
    throw error;
  }
}

// Run the test
testSeparateCallsExtractor().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
