/**
 * Test file for LLM-based resume parser
 * 
 * This script tests the integration of the LLM-based resume parser.
 * It uses a mock implementation of the LLM parser to simulate successful responses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseResume } from './services/resumeParser.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to a sample resume PDF file for testing
const SAMPLE_PDF_PATH = path.join(__dirname, 'test', 'data', '05-versions-space.pdf');

// Mock the LLM-based parser
import { parseResumeWithLLM } from './services/llmResumeExtractor.js';

// Override the actual implementation to return mock data
const originalParseResumeWithLLM = parseResumeWithLLM;
globalThis.parseResumeWithLLM = async () => {
  console.log('Using mock LLM parser implementation');
  return {
    skills: [
      'JavaScript',
      'React',
      'Node.js',
      'TypeScript',
      'MongoDB',
      'Express',
      'Git',
      'HTML',
      'CSS',
      'Python'
    ],
    experience: [
      'Software Developer | TechCorp | 2020-2023: Developed web applications using React and Node.js',
      'Frontend Engineer | WebSolutions | 2018-2020: Created responsive UI designs and implemented frontend features'
    ],
    projects: [
      'E-commerce Platform | React, Node.js, MongoDB: Built a full-stack e-commerce platform with user authentication',
      'Task Management App | React, Express: Developed a task management application with drag-and-drop functionality'
    ],
    rawText: 'Sample resume text'
  };
};

async function testLLMIntegration() {
  console.log('==== Testing LLM-based Resume Parser Integration ====');
  console.log(`Loading PDF from ${SAMPLE_PDF_PATH}`);
  
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
    console.log(`Successfully loaded PDF, size: ${pdfBuffer.length} bytes`);
    
    // Parse the resume with the integrated parser
    console.log('Parsing resume with integrated parser (should use mock LLM data)...');
    const parsedResume = await parseResume(pdfBuffer);
    
    // Display the results
    console.log('\n==== Parsing Results ====');
    
    console.log('\n-- Skills --');
    console.log(`Found ${parsedResume.skills.length} skills:`);
    parsedResume.skills.forEach(skill => console.log(`- ${skill}`));
    
    console.log('\n-- Experience --');
    console.log(`Found ${parsedResume.experience.length} experience items:`);
    parsedResume.experience.forEach(exp => console.log(`- ${exp}`));
    
    console.log('\n-- Projects --');
    console.log(`Found ${parsedResume.projects.length} projects:`);
    parsedResume.projects.forEach(project => console.log(`- ${project}`));
    
    console.log('\n==== Test Complete ====');
    
    // Restore original implementation
    globalThis.parseResumeWithLLM = originalParseResumeWithLLM;
  } catch (error) {
    console.error('Error in test:', error);
    // Restore original implementation
    globalThis.parseResumeWithLLM = originalParseResumeWithLLM;
  }
}

// Run the test
testLLMIntegration();
