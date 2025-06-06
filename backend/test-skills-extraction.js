/**
 * A simplified test file for the skills extraction functionality
 */

import { extractSkills } from './services/simplifiedResumeParser.js';

// Test skills extraction
console.log('Testing skills extraction with different formats');

// Test skill lists with various formats
const testSkillSections = [
  [
    "• Python, JavaScript, Java",
    "• C++, HTML, CSS",
    "• React, Node.js"
  ],
  [
    "Programming Languages: Python, JavaScript, Java, C++",
    "Web Technologies: HTML, CSS, React, Node.js",
    "Databases: MongoDB, MySQL, PostgreSQL"
  ],
  [
    "- Machine Learning",
    "- Data Science",
    "- Artificial Intelligence",
    "- C++"
  ]
];

// Process each test case
testSkillSections.forEach((section, index) => {
  console.log(`\nTest case #${index + 1}:`);
  console.log('Input:');
  section.forEach(line => console.log(`  ${line}`));
  
  const skills = extractSkills(section);
  
  console.log('Extracted skills:');
  if (skills.length > 0) {
    skills.forEach(skill => console.log(`  - ${skill}`));
  } else {
    console.log('  No skills extracted');
  }
});
