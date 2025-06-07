/**
 * Test script for the LLM resume extractor
 */

import { parseResumeWithLLM } from "./services/llmResumeExtractor.js";
import fs from "fs/promises";

// Sample mixed JSON + text response to simulate what might come from an LLM
const sampleMixedResponse = `
I've analyzed the resume and extracted the following information:

{
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "experience": [
    {
      "title": "Frontend Developer",
      "company": "Tech Solutions Inc.",
      "location": "San Francisco, CA",
      "startDate": "2020-01",
      "endDate": "2023-05",
      "description": "Developed and maintained web applications using React."
    }
  ]
}

I also noticed the candidate has some project experience:

{
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce platform",
      "technologies": ["React", "Express", "MongoDB"],
      "url": "https://github.com/example/ecommerce"
    }
  ]
}
`;

// More challenging case with multiple JSON objects and non-standard formatting
const complexMixedResponse = `
I've analyzed the resume and here's what I found:

For skills, the candidate has:
{
  skills: ['JavaScript', 'Python', 'AWS', 'Docker']
}

Their work experience includes:
{
  'experience': [
    {
      'title': 'Software Engineer',
      'company': 'ABC Technologies',
      'location': 'Remote',
      'startDate': '2018-06',
      'endDate': '2022-03',
      'description': 'Full-stack development with Node.js and React'
    },
    {
      'title': 'Junior Developer',
      'company': 'Startup Inc',
      'location': 'New York, NY',
      'startDate': '2016-09',
      'endDate': '2018-05',
      'description': 'Front-end development with HTML, CSS, JavaScript'
    }
  ]
}

They've also worked on these projects:
{
  projects: [
    {
      name: 'Machine Learning Tool',
      description: 'Built a tool for image classification',
      technologies: ['Python', 'TensorFlow', 'AWS'],
      url: 'https://github.com/example/ml-tool',
    },
    {
      name: 'Mobile App',
      description: 'Developed a fitness tracking app',
      technologies: ['React Native', 'Firebase'],
      url: '',
    }
  ]
}
`;

async function testLLMExtractor() {
  console.log("Testing LLM Resume Extractor with mixed content...\n");

  try {
    console.log("TEST CASE 1: Simple mixed content");
    console.log("==================================");

    // Test with the sample mixed response
    const result1 = await parseResumeWithLLM(sampleMixedResponse);

    console.log("Parsed Result:");
    console.log(JSON.stringify(result1, null, 2));

    // Check if skills, experience and projects were properly extracted
    console.log("\nData Validation:");
    console.log(`Skills found: ${result1.skills.length}`);
    console.log(`Experience entries found: ${result1.experience.length}`);
    console.log(`Project entries found: ${result1.projects.length}`);

    if (
      result1.skills.length === 0 ||
      (Array.isArray(result1.experience) && result1.experience.length === 0) ||
      (Array.isArray(result1.projects) && result1.projects.length === 0)
    ) {
      console.log(
        "WARNING: Some sections are empty, parser may not be handling mixed content correctly"
      );
    }

    console.log(
      "\n\nTEST CASE 2: Complex mixed content with non-standard JSON"
    );
    console.log("=========================================================");

    // Test with more complex mixed response
    const result2 = await parseResumeWithLLM(complexMixedResponse);

    console.log("Parsed Result:");
    console.log(JSON.stringify(result2, null, 2));

    // Check if skills, experience and projects were properly extracted
    console.log("\nData Validation:");
    console.log(`Skills found: ${result2.skills.length}`);
    console.log(`Experience entries found: ${result2.experience.length}`);
    console.log(`Project entries found: ${result2.projects.length}`);

    if (
      result2.skills.length === 0 ||
      (Array.isArray(result2.experience) && result2.experience.length === 0) ||
      (Array.isArray(result2.projects) && result2.projects.length === 0)
    ) {
      console.log(
        "WARNING: Some sections are empty, parser may not be handling complex mixed content correctly"
      );
    }
  } catch (error) {
    console.error("Error testing LLM extractor:", error);
  }
}

// Run the test
testLLMExtractor();
