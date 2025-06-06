/**
 * Test file for the LLM Resume Extractor
 * 
 * This file tests the LLM-based resume parsing functionality.
 * It sends a sample resume text to the LLM and logs the extracted data.
 */

import { parseResumeWithLLM } from './services/llmResumeExtractor.js';

// Sample resume text for testing
const sampleResumeText = `
JOHN DOE
Software Engineer
email@example.com | (123) 456-7890 | linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development.
Proficient in JavaScript, Python, and Java. Strong background in building scalable web applications.

SKILLS
• JavaScript, React, Node.js, Express, MongoDB
• Python, Django, Flask, TensorFlow
• Java, Spring Boot, Hibernate
• Docker, Kubernetes, AWS, CI/CD
• Agile, Scrum, Test-Driven Development

EXPERIENCE
Senior Software Engineer | ABC Tech Inc. | Jan 2020 - Present
• Developed and maintained a customer-facing e-commerce platform with React and Node.js
• Implemented CI/CD pipeline using Jenkins, reducing deployment time by 40%
• Led a team of 5 engineers in the migration from monolith to microservices architecture

Software Engineer | XYZ Solutions | Mar 2018 - Dec 2019
• Built RESTful APIs using Express.js and MongoDB for a financial services application
• Created data visualization dashboards with D3.js, improving client reporting capabilities
• Optimized database queries, resulting in a 30% performance improvement

PROJECTS
E-commerce Platform | React, Node.js, MongoDB | github.com/johndoe/ecommerce
• Developed a full-stack e-commerce application with product catalog, cart, and checkout features
• Implemented JWT authentication and authorization for secure user access
• Integrated with Stripe payment gateway for processing transactions

Personal Finance Tracker | Python, Django, PostgreSQL | github.com/johndoe/finance-tracker
• Created a web application to track personal expenses and income
• Implemented data visualization features using Chart.js
• Built a budget forecasting system using simple ML algorithms

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2014 - 2018
• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development
`;

// Test the LLM-based resume parser
async function testLLMResumeParser() {
  console.log('Testing LLM-based resume parser...');
  
  try {
    // Parse the sample resume text using LLM
    const parsedData = await parseResumeWithLLM(sampleResumeText);
    
    // Log the parsed data
    console.log('\nParsed Resume Data:');
    console.log('Skills:', parsedData.skills);
    console.log('\nExperience:');
    parsedData.experience.forEach((exp, index) => {
      console.log(`[${index + 1}] ${exp}`);
    });
    
    console.log('\nProjects:');
    parsedData.projects.forEach((proj, index) => {
      console.log(`[${index + 1}] ${proj}`);
    });
    
    console.log('\nParsing completed successfully!');
  } catch (error) {
    console.error('Error in LLM resume parsing test:', error);
  }
}

// Run the test
testLLMResumeParser();
