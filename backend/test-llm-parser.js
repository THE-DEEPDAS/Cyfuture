// Test script for the LLM-based resume parser
import fs from 'fs';
import path from 'path';
import { parseResumeWithLLM } from './services/llmResumeExtractor.js';
import { parseResumeText } from './services/simplifiedResumeParser.js';

async function testLLMParser() {
  try {
    console.log('Starting LLM parser test...');
    
    // Load a sample resume PDF
    const testResumePath = path.join(process.cwd(), 'test', 'data', '05-versions-space.pdf');
    console.log(`Loading test resume from: ${testResumePath}`);
    
    const pdfBuffer = fs.readFileSync(testResumePath);
    
    console.log('Testing LLM-based parser...');
    console.time('LLM Parser');
    const llmResults = await parseResumeWithLLM(pdfBuffer);
    console.timeEnd('LLM Parser');
    
    console.log('\nTesting traditional parser...');
    console.time('Traditional Parser');
    const traditionalResults = await parseResumeText(pdfBuffer);
    console.timeEnd('Traditional Parser');
    
    // Compare results
    console.log('\n===== COMPARISON OF RESULTS =====');
    
    console.log('\n----- SKILLS -----');
    console.log('LLM Parser found:', llmResults.skills.length, 'skills');
    console.log(llmResults.skills);
    
    console.log('\nTraditional Parser found:', traditionalResults.skills.length, 'skills');
    console.log(traditionalResults.skills);
    
    console.log('\n----- EXPERIENCE -----');
    console.log('LLM Parser found:', llmResults.experience.length, 'experiences');
    console.log(llmResults.experience);
    
    console.log('\nTraditional Parser found:', traditionalResults.experience.length, 'experiences');
    console.log(traditionalResults.experience);
    
    console.log('\n----- PROJECTS -----');
    console.log('LLM Parser found:', llmResults.projects.length, 'projects');
    console.log(llmResults.projects);
    
    console.log('\nTraditional Parser found:', traditionalResults.projects.length, 'projects');
    console.log(traditionalResults.projects);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testLLMParser();
