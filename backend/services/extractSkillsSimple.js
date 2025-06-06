/**
 * Enhanced extractSkills function to directly process skill content
 * For testing purposes to troubleshoot skill extraction issues
 */

/**
 * Extract skills from a skills section
 * @param {Array<string>} skillLines - Array of lines containing skills
 * @returns {Array<string>} - Array of extracted skills
 */
function extractSkillsSimple(skillLines) {
  if (!skillLines || !skillLines.length) return [];
  
  const skills = [];
  
  for (const line of skillLines) {
    // Process line with bullet points
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // Remove the bullet and trim
      const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
      
      // If line contains a comma-separated list
      if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',').map(part => part.trim()).filter(part => part.length > 0);
        skills.push(...parts);
      } else {
        // Otherwise treat the whole line as a skill
        skills.push(cleanLine);
      }
    }
    // Process line with a category followed by skills (e.g., "Programming Languages: Python, Java")
    else if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const category = line.substring(0, colonIndex).trim();
      const skillsText = line.substring(colonIndex + 1).trim();
      
      // Split by comma and add each skill
      const parts = skillsText.split(',').map(part => part.trim()).filter(part => part.length > 0);
      skills.push(...parts);
    }
    // Process simple comma-separated list without bullets
    else if (line.includes(',')) {
      const parts = line.split(',').map(part => part.trim()).filter(part => part.length > 0);
      skills.push(...parts);
    }
    // Process a single skill per line
    else if (line.trim().length > 0) {
      skills.push(line.trim());
    }
  }
  
  // Remove duplicates and empty values
  return [...new Set(skills)].filter(skill => skill.length > 0);
}

// Test the function
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
  
  const skills = extractSkillsSimple(section);
  
  console.log('Extracted skills:');
  if (skills.length > 0) {
    skills.forEach(skill => console.log(`  - ${skill}`));
  } else {
    console.log('  No skills extracted');
  }
});

// Export the function
export { extractSkillsSimple };
