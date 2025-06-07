/**
 * Test script for resume parsing
 * Tests the LLM resume extractor with a sample resume text
 */

import fs from "fs";
import path from "path";
import { parseResumeWithLLM } from "./services/llmResumeExtractor.js";

async function main() {
  try {
    // Read the sample resume text
    const resumeText = fs.readFileSync(
      "./test/data/05-versions-space.pdf.txt",
      "utf8"
    );
    console.log("Resume text loaded, length:", resumeText.length);

    // Parse the resume text
    console.log("Parsing resume text...");
    const parsedData = await parseResumeWithLLM(resumeText);

    // Log the results
    console.log("\n=== PARSING RESULTS ===");
    console.log(`Skills (${parsedData.skills.length}):`, parsedData.skills);
    console.log(`\nExperience (${parsedData.experience.length}):`);
    parsedData.experience.forEach((exp, index) => {
      console.log(`\n[Experience ${index + 1}]`);
      console.log(`Title: ${exp.title}`);
      console.log(`Company: ${exp.company}`);
      console.log(`Location: ${exp.location}`);
      console.log(`Period: ${exp.startDate} - ${exp.endDate || "Present"}`);
      console.log(`Description: ${exp.description}`);
    });

    console.log(`\nProjects (${parsedData.projects.length}):`);
    parsedData.projects.forEach((proj, index) => {
      console.log(`\n[Project ${index + 1}]`);
      console.log(`Name: ${proj.name}`);
      console.log(`Description: ${proj.description}`);
      console.log(`Technologies: ${proj.technologies.join(", ")}`);
      console.log(`URL: ${proj.url}`);
    });

    console.log("\n=== RAW PARSED DATA ===");
    console.log(JSON.stringify(parsedData, null, 2));
  } catch (error) {
    console.error("Error running test:", error);
  }
}

main();
