/**
 * Test script for the new improved resume extraction with mixed content handling
 */
import fs from "fs";
import path from "path";
import { extractResumeDataWithLLM } from "./services/improvedResumeExtractor.js";

async function testImprovedResumeExtraction() {
  try {
    // Read the sample resume text
    console.log("Reading sample resume text...");
    const resumeText = fs.readFileSync(
      path.join(process.cwd(), "test", "data", "05-versions-space.pdf.txt"),
      "utf8"
    );

    console.log("Sample resume content (first 200 chars):");
    console.log(resumeText.substring(0, 200) + "...");

    // Test the extraction with the sample resume
    console.log("\nTesting improved LLM resume extraction...");
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

    // Simulate a mixed content response to test the robust parsing
    console.log("\n\nTesting with simulated mixed content response...");

    // Create a mock LLM response function that returns mixed content
    const originalLLM = await import("./utils/llm.js");
    const originalGetLLMResponse = originalLLM.getLLMResponse;

    // Mock the LLM response function temporarily
    originalLLM.getLLMResponse = async () => {
      return `Here's the parsed data from the resume:

{
  "skills": ["C Programming", "Data Structures", "Java", "JavaScript", "Git", "GitHub", "AI Chatbot Development", "Team Leadership", "Communication"]
}

I notice there's also experience information:

{
  "experience": [
    {
      "title": "AI Chatbot Developer Intern",
      "company": "Sun Corp",
      "location": "Surat, India",
      "startDate": "2022-06",
      "endDate": "2022-08",
      "description": "Worked on AI chatbot development"
    },
    {
      "title": "GSoC Part Time Coder",
      "company": "Google Summer of Code",
      "location": "Remote",
      "startDate": "2023-05",
      "endDate": null,
      "description": "Open source contribution through Google Summer of Code"
    }
  ]
}

And the projects:

{
  "projects": [
    {
      "name": "Open Source Contributions",
      "description": "Contributed to various open source projects on GitHub",
      "technologies": ["Git", "GitHub"],
      "url": ""
    }
  ]
}`;
    };

    // Test with the simulated mixed content
    console.log("Testing extraction from mixed content response...");
    const mixedContentData = await extractResumeDataWithLLM(resumeText);

    // Log the results from mixed content
    console.log("\nExtracted Data from mixed content:");
    console.log(
      "Skills:",
      mixedContentData.skills.length ? mixedContentData.skills : "None found"
    );

    console.log("\nExperience:");
    if (mixedContentData.experience.length) {
      mixedContentData.experience.forEach((exp, i) => {
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
    if (mixedContentData.projects.length) {
      mixedContentData.projects.forEach((proj, i) => {
        console.log(`\nProject #${i + 1}:`);
        console.log(`  Name: ${proj.name}`);
        console.log(`  Description: ${proj.description}`);
        console.log(`  Technologies: ${proj.technologies.join(", ")}`);
        console.log(`  URL: ${proj.url || "N/A"}`);
      });
    } else {
      console.log("None found");
    }

    // Restore the original function
    originalLLM.getLLMResponse = originalGetLLMResponse;

    return { extractedData, mixedContentData };
  } catch (error) {
    console.error("Error in test script:", error);
    throw error;
  }
}

// Run the test
testImprovedResumeExtraction()
  .then(() => {
    console.log("\nTest completed successfully");
  })
  .catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });
