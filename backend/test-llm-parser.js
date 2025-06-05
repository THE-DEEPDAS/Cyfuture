// Test script for the LLM-based resume parser
import fs from "fs";
import path from "path";
import { parseResumeWithLLM } from "./services/llmResumeExtractor.js";
import { parseResumeText } from "./services/simplifiedResumeParser.js";
import { getLLMResponse } from "./utils/llm.js";

const testResumeText = `
SKILLS
• Programming Languages: Python, JavaScript, Java
• Web Technologies: HTML, CSS, React, Node.js
• Databases: MongoDB, MySQL

EXPERIENCE
Software Engineer | ABC Tech (Jan 2023 - Present)
• Developed and maintained web applications using React and Node.js
• Implemented RESTful APIs and database integrations

PROJECTS
E-commerce Platform
• Built a full-stack e-commerce platform using MERN stack
• Implemented user authentication and payment integration
`;

async function testLLMParser() {
  try {
    console.log("Testing LLM Resume Parser...");

    const prompt = `
      Extract the following information from this resume:
      1. Skills: Technical skills mentioned (only actual technical skills, 1-3 words each)
      2. Experience entries
      3. Project details
      
      Format your response as JSON with this structure:
      {
        "skills": ["skill1", "skill2"],
        "experience": [
          {
            "title": "role",
            "company": "company name",
            "duration": "date range",
            "description": "what they did"
          }
        ],
        "projects": [
          {
            "name": "project name",
            "technologies": ["tech1", "tech2"],
            "description": "what the project was about"
          }
        ]
      }

      IMPORTANT: Return ONLY the JSON object with no markdown formatting or code blocks.

      Resume text:
      ${testResumeText}
    `;

    console.log("Sending resume to LLM for parsing...");
    let response = await getLLMResponse(prompt);

    // Remove any markdown code block formatting if present
    response = response.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    console.log("\nRaw Response:", response);
    console.log("\nParsed Resume Data:");
    const parsedData = JSON.parse(response);
    console.log(JSON.stringify(parsedData, null, 2));

    // Validate the parsed data
    console.log("\nValidation:");
    console.log("Skills found:", parsedData.skills.length);
    console.log("Experience entries:", parsedData.experience.length);
    console.log("Projects found:", parsedData.projects.length);

    // Verify skills are 1-3 words
    const longSkills = parsedData.skills.filter(
      (skill) => skill.split(/\s+/).length > 3
    );
    if (longSkills.length > 0) {
      console.log(
        "\nWarning: Found skills with more than 3 words:",
        longSkills
      );
    } else {
      console.log("\nAll skills are within the 1-3 word limit ✓");
    }

    // Verify experience entries have all required fields
    const validExperience = parsedData.experience.every(
      (exp) => exp.title && exp.company && exp.duration && exp.description
    );
    console.log(
      "\nExperience entries have all required fields:",
      validExperience ? "✓" : "✗"
    );

    // Verify project entries have all required fields
    const validProjects = parsedData.projects.every(
      (proj) =>
        proj.name && Array.isArray(proj.technologies) && proj.description
    );
    console.log(
      "Project entries have all required fields:",
      validProjects ? "✓" : "✗"
    );

    return parsedData;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

// Run the test
testLLMParser();
