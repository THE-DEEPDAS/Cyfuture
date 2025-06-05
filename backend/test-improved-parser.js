/**
 * Test file for simplified resume parser
 * 
 * This script tests the resume parser with a sample PDF to verify
 * that the fixes for section detection and content classification work correctly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseResumeText } from './services/simplifiedResumeParser.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to a sample resume PDF file for testing
const SAMPLE_PDF_PATH = path.join(__dirname, 'test', 'data', '05-versions-space.pdf');

async function testResumeParser() {
  console.log('==== Testing Resume Parser ====');
  console.log(`Loading PDF from ${SAMPLE_PDF_PATH}`);
  
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(SAMPLE_PDF_PATH);
    console.log(`Successfully loaded PDF, size: ${pdfBuffer.length} bytes`);
    
    // Parse the resume
    console.log('Parsing resume...');
    const parsedResume = await parseResumeText(pdfBuffer);
    
    // Display the results
    console.log('\n==== Parsing Results ====');
    
    console.log('\n-- Skills --');
    console.log(`Found ${parsedResume.skills.length} skills:`);
    parsedResume.skills.slice(0, 10).forEach(skill => console.log(`- ${skill}`));
    if (parsedResume.skills.length > 10) {
      console.log(`... and ${parsedResume.skills.length - 10} more skills`);
    }
    
    console.log('\n-- Experience --');
    console.log(`Found ${parsedResume.experience.length} experience items:`);
    parsedResume.experience.forEach(exp => console.log(`- ${exp}`));
    
    console.log('\n-- Projects --');
    console.log(`Found ${parsedResume.projects.length} projects:`);
    parsedResume.projects.forEach(project => console.log(`- ${project}`));
    
    console.log('\n-- Raw Text Sample --');
    // Display first 200 characters of raw text
    if (parsedResume.rawText) {
      console.log(parsedResume.rawText.substring(0, 200) + '...');
      console.log(`Total raw text length: ${parsedResume.rawText.length} characters`);
    } else {
      console.log('No raw text extracted');
    }
    
    console.log('\n==== Test Complete ====');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testResumeParser();
