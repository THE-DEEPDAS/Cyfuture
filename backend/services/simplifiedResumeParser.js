/**
 * Simplified Resume Parser
 *
 * This module implements a focused resume parsing algorithm that extracts:
 * 1. Skills
 * 2. Experience
 * 3. Projects
 *
 * It works with the existing pdf-parse library, no additional dependencies required.
 */

import pdfParse from "pdf-parse";

/**
 * Main function to parse resume text
 * @param {Buffer} pdfBuffer - PDF buffer or text content
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResumeText(pdfBuffer) {
  try {
    console.log("Starting simplified resume parsing");
    let rawText = "";

    // Check if input is already text content
    if (Buffer.isBuffer(pdfBuffer)) {
      try {
        // Use simple parsing approach with no custom handlers
        const fallbackData = await pdfParse(pdfBuffer, {
          // Use minimal options for maximum compatibility
          max: 15 * 1024 * 1024, // 15MB limit
        });

        if (
          fallbackData &&
          fallbackData.text &&
          fallbackData.text.trim().length > 0
        ) {
          rawText = fallbackData.text;
          console.log(
            "PDF parsing successful, retrieved text length:",
            rawText.length
          );
        } else {
          // If the input might already be text, try to use it directly
          rawText = pdfBuffer.toString("utf8");
          console.log("Attempting to use buffer as text directly");
        }
      } catch (pdfError) {
        console.error("Error parsing PDF:", pdfError);

        // Last resort - try to use buffer as text directly
        try {
          rawText = pdfBuffer.toString("utf8");
          console.log("Attempting to use buffer as text directly");
        } catch (textError) {
          console.error("Failed to extract text:", textError);
          // Return empty data instead of throwing
          return {
            skills: [],
            experience: [],
            projects: [],
            rawText: "",
          };
        }
      }
    } else if (typeof pdfBuffer === "string") {
      // The input is already text
      rawText = pdfBuffer;
      console.log(`Using provided text content, length: ${rawText.length}`);
    } else if (pdfBuffer && typeof pdfBuffer === "object" && pdfBuffer.text) {
      // This might be the result of pdf-parse directly
      rawText = pdfBuffer.text;
      console.log(
        `Using text from pdf-parse object, length: ${rawText.length}`
      );
    } else {
      console.error("Invalid input type");
      // Return empty data instead of throwing
      return {
        skills: [],
        experience: [],
        projects: [],
        rawText: "",
      };
    }    // Process the text to extract sections
    const sections = extractSectionsFromText(rawText);
    console.log(`Found sections: ${Object.keys(sections).join(", ")}`);
    
    // Extract skills, experience, and projects
    console.log("Extracting skills...");
    const skills = extractSkills(sections["SKILLS"] || []);
    console.log(`Extracted ${skills.length} skills`);
    
    console.log("Extracting experience...");
    const experience = extractExperience(sections["EXPERIENCE"] || []);
    console.log(`Extracted ${experience.length} experiences`);
    
    console.log("Extracting projects...");
    const projects = extractProjects(sections["PROJECTS"] || []);
    console.log(`Extracted ${projects.length} projects`);

    console.log(
      `Parsing complete. Extracted ${skills.length} skills, ${experience.length} experiences, ${projects.length} projects`
    );

    return {
      skills,
      experience,
      projects,
      rawText,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    // Return empty results instead of throwing
    return {
      skills: [],
      experience: [],
      projects: [],
      rawText: "",
    };
  }
}

/**
 * Extract sections from text based on OpenResume algorithm
 * @param {string} text - Raw text from resume
 * @returns {Object} - Object with sections as keys and their content as values
 */
function extractSectionsFromText(text) {
  const sections = {};
  // Expanded list of section headers based on OpenResume algorithm
  const sectionHeaders = [
    // Skills section headers
    "SKILLS",
    "TECHNICAL SKILLS",
    "SKILL SET",
    "TECHNOLOGIES",
    "TECH STACK",
    "PROGRAMMING LANGUAGES",
    "LANGUAGES",
    "TOOLS",
    "TECHNICAL EXPERTISE",
    "CORE COMPETENCIES",
    "PROFICIENCIES",
    "EXPERTISE",
    "QUALIFICATIONS",
    "TECHNICAL PROFICIENCIES",
    "KEY SKILLS",
    "PROFESSIONAL SKILLS",

    // Experience section headers
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "EMPLOYMENT",
    "PROFESSIONAL EXPERIENCE",
    "WORK HISTORY",
    "CAREER",
    "EMPLOYMENT HISTORY",
    "PROFESSIONAL BACKGROUND",
    "PROFESSIONAL SUMMARY",
    "CAREER HISTORY",

    // Projects section headers
    "PROJECTS",
    "PROJECT EXPERIENCE",
    "PERSONAL PROJECTS",
    "ACADEMIC PROJECTS",
    "KEY PROJECTS",
    "RELATED PROJECTS",
    "PORTFOLIO",
    "MAJOR PROJECTS",
    "PROJECT WORK",
    "SOFTWARE PROJECTS",
    "DEVELOPMENT PROJECTS",

    // Additional section headers that might be useful
    "EDUCATION",
    "CERTIFICATIONS",
    "ACHIEVEMENTS",
    "AWARDS",
    "LEADERSHIP",
    "PUBLICATIONS",
    "VOLUNTEER",
  ];

  // Step 1 & 2: Group text items into lines
  // First split text into lines and clean them
  let lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Handle special case for PDFs with poor extraction
  if (lines.length <= 3 && text.length > 0) {
    console.log("Very few lines detected, attempting alternate line splitting");
    // Try splitting by periods and other common delimiters
    lines = text
      .replace(/\.\s+/g, ".\n")
      .replace(/•/g, "\n•")
      .replace(/\s{3,}/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  console.log(`Processing ${lines.length} lines of text`);
  if (lines.length > 0) {
    console.log("Sample of first few lines:");
    lines.slice(0, 5).forEach((line) => console.log(`> ${line}`));
  }

  // Track if we found exact section matches
  let foundExactSectionMatches = false;
  let currentSection = null;
  const sectionContent = {};

  // Initialize an array to store all known section headers found in the document
  const foundSectionHeaders = [];

  // First pass: identify all section headers in the document
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();

    // Check if this line is a standalone section header (exact match or contains the header)
    let matchedHeader = null;
    for (const header of sectionHeaders) {
      if (
        lineUpper === header ||
        lineUpper.startsWith(header + ":") ||
        lineUpper.startsWith(header + " ")
      ) {
        matchedHeader = header;
        foundExactSectionMatches = true;
        console.log(`Found exact section header: ${line} (matched: ${header})`);        // Map similar headers to standard categories
        let sectionType = null;
        if (
          /SKILL|TECH|PROGRAMMING|LANGUAGES|TOOLS|EXPERTISE|COMPETENC|PROFICIENC|QUALIF/i.test(
            matchedHeader
          )
        ) {
          sectionType = "SKILLS";
        } else if (
          /EXPERIENCE|EMPLOYMENT|WORK|CAREER|PROFESSIONAL|BACKGROUND|HISTORY|INTERNSHIP|TRAINING/i.test(
            matchedHeader
          )
        ) {
          sectionType = "EXPERIENCE";
        } else if (/PROJECT|PORTFOLIO|DEVELOPMENT|APPLICATIONS/i.test(matchedHeader)) {
          sectionType = "PROJECTS";
        } else if (
          /EDUCATION|ACADEMIC|DEGREE|UNIVERSITY|COLLEGE|SCHOOL/i.test(matchedHeader)
        ) {
          sectionType = "EDUCATION";
        }

        // Only add to found headers if we recognized the type
        if (sectionType) {
          foundSectionHeaders.push({
            index: i,
            line: line,
            type: sectionType,
          });
        }

        break;
      }
    }
  }

  // Sort found headers by their position in the document
  foundSectionHeaders.sort((a, b) => a.index - b.index);
  // If we found section headers, process the content between them
  if (foundSectionHeaders.length > 0) {
    // Initialize all required sections
    sectionContent["SKILLS"] = sectionContent["SKILLS"] || [];
    sectionContent["EXPERIENCE"] = sectionContent["EXPERIENCE"] || [];
    sectionContent["PROJECTS"] = sectionContent["PROJECTS"] || [];
    sectionContent["EDUCATION"] = sectionContent["EDUCATION"] || [];
    
    // Process each section and collect content until the next section header
    for (let i = 0; i < foundSectionHeaders.length; i++) {
      const currentHeader = foundSectionHeaders[i];
      const nextHeaderIndex =
        i < foundSectionHeaders.length - 1
          ? foundSectionHeaders[i + 1].index
          : lines.length;

      // Add all lines between this header and the next one to the section
      // Skip the header line itself (start from index + 1)
      for (let j = currentHeader.index + 1; j < nextHeaderIndex; j++) {
        sectionContent[currentHeader.type].push(lines[j]);
      }

      console.log(
        `Added ${nextHeaderIndex - currentHeader.index - 1} lines to section ${
          currentHeader.type
        }`
      );
    }
    
  // Look for special sections that might not have been properly recognized
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    // Look for project or experience sections that might have been missed
    if (
      (line.includes("PROJECT") || 
       line.includes("INTERNSHIP") || 
       line.includes("WORK") || 
       line.includes("EXPERIENCE") ||
       line.includes("TRAINING")) && 
      !foundSectionHeaders.some(header => header.index === i)
    ) {
      console.log(`Found potential unlabeled section: ${lines[i]}`);
      
      // Determine type based on text
      let sectionType = "PROJECTS";
      if (line.includes("EXPERIENCE") || line.includes("WORK") || line.includes("INTERNSHIP") || line.includes("TRAINING")) {
        sectionType = "EXPERIENCE";
      }
      
      // Add this as a proper section header to our list
      foundSectionHeaders.push({
        index: i,
        line: lines[i],
        type: sectionType
      });
    }
  }
  
  // Re-sort the headers after adding potential unlabeled ones
  foundSectionHeaders.sort((a, b) => a.index - b.index);
  
  // Process content between headers
  for (let i = 0; i < foundSectionHeaders.length; i++) {
    const currentHeader = foundSectionHeaders[i];
    const nextHeaderIndex =
      i < foundSectionHeaders.length - 1
        ? foundSectionHeaders[i + 1].index
        : lines.length;

    // Initialize the section if needed
    if (!sectionContent[currentHeader.type]) {
      sectionContent[currentHeader.type] = [];
    }

    // Add all lines between this header and the next one to the section
    // Skip the header line itself (start from index + 1)
    for (let j = currentHeader.index + 1; j < nextHeaderIndex; j++) {
      sectionContent[currentHeader.type].push(lines[j]);
    }

    console.log(
      `Added ${nextHeaderIndex - currentHeader.index - 1} lines to section ${
        currentHeader.type
      }`
    );
  }
  }else {
    // If no exact section headers were found, try looser matching
    console.log("No exact section headers found, trying looser matching...");

    // First identify potential section headers by formatting cues
    const potentialHeaders = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineUpper = line.toUpperCase();      // Look for formatting cues that suggest a header
      if (
        lineUpper === lineUpper.toUpperCase() && // All caps
        line.length < 50 && // Not too long
        !/[,.;:]$/.test(line) && // Doesn't end with punctuation
        (/SKILL|TECH|LANGUAGE|TOOL|EXPERT|COMPETENC|PROFICIEN|QUALIF/i.test(
          line
        ) ||
          /EXPERIENCE|EMPLOYMENT|WORK|CAREER|PROFESSIONAL|HISTORY|INTERNSHIP|TRAINING/i.test(
            line
          ) ||
          /PROJECT|PORTFOLIO|APPLICATION|SYSTEM|DEVELOPMENT|HOBBY|INTEREST/i.test(line) ||
          /EDUCATION|ACADEMIC|DEGREE|UNIVERSITY|COLLEGE|SCHOOL/i.test(line))
      ) {
        potentialHeaders.push({
          index: i,
          line: line,
          type: /SKILL|TECH|LANGUAGE|TOOL|EXPERT|COMPETENC|PROFICIEN|QUALIF/i.test(
            line
          )
            ? "SKILLS"
            : /EXPERIENCE|EMPLOYMENT|WORK|CAREER|PROFESSIONAL|HISTORY|INTERNSHIP|TRAINING/i.test(
                line
              )
            ? "EXPERIENCE"
            : /PROJECT|PORTFOLIO|APPLICATION|SYSTEM|DEVELOPMENT/i.test(line)
            ? "PROJECTS"
            : /EDUCATION|ACADEMIC|DEGREE|UNIVERSITY|COLLEGE|SCHOOL/i.test(line)
            ? "EDUCATION"
            : null,
        });
        console.log(
          `Found potential header: ${line} (type: ${
            potentialHeaders[potentialHeaders.length - 1].type
          })`
        );
      }
    }

    // If potential headers were found, process them
    if (potentialHeaders.length > 0) {
      foundExactSectionMatches = true; // Consider these as valid sections

      // Sort headers by their index in the document
      potentialHeaders.sort((a, b) => a.index - b.index);

      // Process each header and the content until the next header
      for (let i = 0; i < potentialHeaders.length; i++) {
        const header = potentialHeaders[i];
        const nextHeaderIndex =
          i < potentialHeaders.length - 1
            ? potentialHeaders[i + 1].index
            : lines.length;

        // Skip if we don't recognize the section type
        if (!header.type) continue;

        // Initialize the section if needed
        if (!sectionContent[header.type]) {
          sectionContent[header.type] = [];
        }

        // Add all lines between this header and the next one to the section
        // Skip the header line itself (start from index + 1)
        for (let j = header.index + 1; j < nextHeaderIndex; j++) {
          sectionContent[header.type].push(lines[j]);
        }

        console.log(
          `Added ${nextHeaderIndex - header.index - 1} lines to section ${
            header.type
          }`
        );
      }
    }
  }

  // If still no sections, use keyword-based content assignment approach
  if (!foundExactSectionMatches) {
    console.log(
      "No sections found, trying content-based assignment on full text..."
    );

    // Apply content-based classification
    sectionContent = applyContentBasedClassification(lines, sectionContent);
  }

  // Handle special case for skills sections that might be labeled as categories
  if (!sectionContent["SKILLS"] || sectionContent["SKILLS"].length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes("Programming Languages:") ||
        line.includes("Artificial Intelligence:") ||
        line.includes("Web Development:") ||
        line.includes("Databases & Tools:") ||
        line.includes("Other Skills:") ||
        line.includes("Technical Skills:") ||
        line.includes("Frameworks:") ||
        line.includes("Technologies:") ||
        line.match(/\w+:\s*([\w\s,]+)/) // Any word followed by colon and list
      ) {
        if (!sectionContent["SKILLS"]) {
          sectionContent["SKILLS"] = [];
          console.log(`Found skill category header: ${line}`);
        }
        sectionContent["SKILLS"].push(line);
      }
    }
  }

  // Return the structured sections
  return sectionContent;
}

/**
 * Extract skills from sections
 * @param {Array<string>} skillsSection - Array of lines containing skills
 * @returns {Array<string>} - Array of skills
 */
function extractSkills(skillsSection) {
  if (!skillsSection || !skillsSection.length) return [];

  let allSkills = [];
  // Process all lines in the skills section
  for (const line of skillsSection) {
    // Skip lines that are likely section headers
    if (line.toUpperCase() === line && line.length > 3) {
      continue;
    }
    
    // Process line with bullet points
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('◦')) {
      // Remove the bullet and trim
      const cleanLine = line.replace(/^[•\-*◦]\s*/, '').trim();
      
      // If line contains a category with a colon followed by a list (e.g., "Programming Languages: Python, Java")
      if (cleanLine.includes(':') && cleanLine.indexOf(':') < cleanLine.length / 2) {
        const colonIndex = cleanLine.indexOf(':');
        const skillsList = cleanLine.substring(colonIndex + 1).trim();
        
        // Split by comma and add each skill
        const skillsInLine = skillsList
          .split(/[,|;]/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 1 && skill.split(/\s+/).length <= 3); // Limit to 3 words max
        
        allSkills.push(...skillsInLine);
      }
      // If line is a comma-separated list
      else if (cleanLine.includes(',')) {
        const parts = cleanLine
          .split(',')
          .map(part => part.trim())
          .filter(part => part.length > 1 && part.split(/\s+/).length <= 3); // Limit to 3 words max
        allSkills.push(...parts);
      } 
      // Otherwise treat the whole line as a skill only if it's short enough
      else if (cleanLine.length > 1 && cleanLine.split(/\s+/).length <= 3) {
        allSkills.push(cleanLine);
      }
    }
    // Process line with a category followed by skills (e.g., "Programming Languages: Python, Java")
    else if (line.includes(':') && line.indexOf(':') < line.length / 2) {
      const colonIndex = line.indexOf(':');
      const category = line.substring(0, colonIndex).trim();
      const skillsList = line.substring(colonIndex + 1).trim();
      
      // Skip if this appears to be a job title or date
      if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|20\d{2})\b/i.test(skillsList)) {
        continue;
      }
      
      // Skip if the category contains keywords that suggest it's not a skill category
      if (/\b(training|internship|hobbies|interests|education|experience|project)\b/i.test(category)) {
        continue;
      }
      
      // Split by comma and add each skill
      const skillsInLine = skillsList
        .split(/[,|;]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.split(/\s+/).length <= 3); // Limit to 3 words max
      
      allSkills.push(...skillsInLine);
    }
    // Process simple comma-separated list without bullets
    else if (line.includes(',')) {
      const parts = line
        .split(',')
        .map(part => part.replace(/^[-•*◦]\s*/, '').trim())
        .filter(part => part.length > 1 && part.split(/\s+/).length <= 3); // Limit to 3 words max
      
      allSkills.push(...parts);
    }
    // Process a single skill per line
    else if (line.trim().length > 1 && line.trim().split(/\s+/).length <= 3 && 
             !line.match(/^\d\.|\(\d\)/) && 
             !line.toLowerCase().includes('skill') &&
             !/\b(training|internship|hobbies|interests|education|experience|project)\b/i.test(line)) {
      allSkills.push(line.replace(/^[-•*◦]\s*/, '').trim());
    }
  }// Handle special case - if no skills were found but we have lines that might contain skills
  if (allSkills.length === 0 && skillsSection.length > 0) {
    // Create a safe regex pattern for skills
    try {
      // Safely create skill patterns with proper escaping
      const skillPatterns = [];

      // Add common skill indicators with proper escaping for regex special characters
      for (const skill of [
        "python",
        "javascript",
        "java",
        "html",
        "css",
        "react",
        "node",
        "typescript",
        "sql",
        "mongodb",
        "aws",
        "docker",
        "git",
        "machine learning",
        "ai",
        "data",
        "c++",
        "angular",
        "vue",
        "express",
        "django",
        "flask",
        "spring",
        "tensorflow",
        "pytorch",
        "kubernetes",
        "rest api",
        "graphql",
      ]) {
        // Escape special regex characters
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        skillPatterns.push(escapedSkill);
      }

      const regex = new RegExp(skillPatterns.join("|"), "i");

      for (const line of skillsSection) {
        if (regex.test(line)) {
          // This line likely contains skills
          const parts = line
            .split(/[,|;:]/)
            .map((part) => part.replace(/^[-•*◦]\s*/, "").trim())
            .filter((part) => part.length > 1 && part.length < 50);
          
          allSkills.push(...parts);
        }
      }
    } catch (error) {
      console.error("Error in skill regex creation:", error);
      // Fallback to simple matching without regex
      for (const line of skillsSection) {
        if (
          line.toLowerCase().includes("python") ||
          line.toLowerCase().includes("javascript") ||
          line.toLowerCase().includes("java") ||
          line.toLowerCase().includes("html") ||
          line.toLowerCase().includes("css") ||
          line.toLowerCase().includes("react") ||
          line.toLowerCase().includes("c++")
        ) {
          const parts = line
            .split(/[,|;:]/)
            .map((part) => part.replace(/^[-•*◦]\s*/, "").trim())
            .filter((part) => part.length > 1 && part.length < 50);
          
          allSkills.push(...parts);
        }
      }
    }
  }
  // Remove duplicates and clean up
  return [...new Set(allSkills)]
    .filter((skill) => {
      // Only include skills that are:
      // 1. Between 2 and 30 characters
      // 2. Maximum 3 words
      // 3. Not section headers or phrases that look like headers
      const wordCount = skill.split(/\s+/).length;
      const isLikelyHeader = skill.toUpperCase() === skill && skill.length > 3;
      const containsHeaderWords = /\b(TRAINING|INTERNSHIP|HOBBIES|INTERESTS|EXPERIENCE|PROJECT|EDUCATION)\b/i.test(skill);
      
      return skill.length >= 2 && 
             skill.length <= 30 && 
             wordCount <= 3 && 
             !isLikelyHeader &&
             !containsHeaderWords;
    })
    .map((skill) => skill.trim().replace(/\s+/g, " "));
}

/**
 * Extract experience from sections
 * @param {Array<string>} experienceSection - Array of lines containing experience
 * @returns {Array<string>} - Array of experience descriptions
 */
function extractExperience(experienceSection) {
  if (!experienceSection || !experienceSection.length) return [];

  const experiences = [];
  
  // If the experience section has recognizable internships or training
  for (let i = 0; i < experienceSection.length; i++) {
    const line = experienceSection[i].trim();
    
    if (line.toLowerCase().includes("internship") || 
        line.toLowerCase().includes("training") || 
        line.toLowerCase().includes("work") ||
        line.toLowerCase().includes("gsoc") ||
        line.toLowerCase().includes("contributor")) {
      
      // Check if this line already contains enough information
      if (line.length > 15) {
        experiences.push(line);
      } 
      // If it's just a header, try to get content from the next line
      else if (i < experienceSection.length - 1) {
        const nextLine = experienceSection[i + 1].trim();
        experiences.push(`${line}: ${nextLine}`);
        i++; // Skip the next line since we've used it
      } else {
        experiences.push(line);
      }
    }
  }
  
  // If we couldn't find specific experience items, use divideIntoSubsections
  if (experiences.length === 0) {
    // First, attempt to divide experience section into subsections
    // Using the vertical line gap heuristic mentioned in the algorithm
    let subsections = divideIntoSubsections(experienceSection);

    // If subsections were found, use them as separate experiences
    if (subsections.length > 1) {
      for (const subsection of subsections) {
        if (subsection.length > 0) {
          // Use the first line as the title and others as description
          const title = subsection[0];
          if (subsection.length > 1) {
            const description = subsection.slice(1).join(" | ");
            experiences.push(`${title}: ${description}`);
          } else {
            experiences.push(title);
          }
        }
      }
    } else {
      // Use feature scoring to identify experience entries
      const scoredExperiences = featureScoreExtraction(
        experienceSection,
        "experience"
      );
      if (scoredExperiences.length > 0) {
        return scoredExperiences.map((item) => item.text);
      }
    }
  }

  // If still no experiences found, try to extract any lines that look like dates or positions
  if (experiences.length === 0) {
    // Look for lines with date patterns that might indicate work experience
    const dateRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b|\d{4}\s*[-–]\s*(\d{4}|Present)/i;
    const positionRegex = /\b(developer|engineer|intern|assistant|manager|leader|contributor|trainee)\b/i;

    for (let i = 0; i < experienceSection.length; i++) {
      const line = experienceSection[i];
      if (dateRegex.test(line) || positionRegex.test(line)) {
        experiences.push(line);
      }
    }
  }

  // Remove duplicates and clean up
  return [...new Set(experiences)]
    .filter(exp => exp.length > 5)
    .map(exp => exp.trim());
}

/**
 * Extract projects from sections
 * @param {Array<string>} projectsSection - Array of lines containing projects
 * @returns {Array<string>} - Array of project descriptions
 */
function extractProjects(projectsSection) {
  if (!projectsSection || !projectsSection.length) return [];

  const projects = [];
  
  // Look for project indicators in the text
  for (let i = 0; i < projectsSection.length; i++) {
    const line = projectsSection[i].trim();
    
    // Look for project-related keywords
    if (line.toLowerCase().includes("project") || 
        line.toLowerCase().includes("portfolio") || 
        line.toLowerCase().includes("application") ||
        line.toLowerCase().includes("developed") ||
        line.toLowerCase().includes("created") ||
        line.toLowerCase().includes("implemented") ||
        line.toLowerCase().includes("built")) {
      
      // Check if this line already contains enough information
      if (line.length > 15) {
        projects.push(line);
      } 
      // If it's just a header, try to get content from the next line
      else if (i < projectsSection.length - 1) {
        const nextLine = projectsSection[i + 1].trim();
        projects.push(`${line}: ${nextLine}`);
        i++; // Skip the next line since we've used it
      } else {
        projects.push(line);
      }
    }
  }
  
  // If no projects found yet, try to use bullet points or formatting
  if (projects.length === 0) {
    // First, attempt to divide project section into subsections
    let subsections = divideIntoSubsections(projectsSection);

    // If subsections were found, use them as separate projects
    if (subsections.length > 1) {
      for (const subsection of subsections) {
        if (subsection.length > 0) {
          // Use the first line as the title and others as description
          const title = subsection[0];
          if (subsection.length > 1) {
            const description = subsection.slice(1).join(" | ");
            projects.push(`${title}: ${description}`);
          } else {
            projects.push(title);
          }
        }
      }
    }
  }

  // If still no projects found, try any lines with bullet points or GitHub references
  if (projects.length === 0) {
    for (let i = 0; i < projectsSection.length; i++) {
      const line = projectsSection[i].trim();
      
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
          line.toLowerCase().includes("github") || line.toLowerCase().includes("web") || 
          line.toLowerCase().includes("app")) {
        
        // Clean the line
        const cleanLine = line.replace(/^[•\-*]\s*/, "").trim();
        projects.push(cleanLine);
      }
    }
  }
  
  // If still nothing found and we have at least some content, treat each line as a project
  if (projects.length === 0 && projectsSection.length > 0) {
    // Take the first few meaningful lines
    const maxProjects = Math.min(5, projectsSection.length);
    for (let i = 0; i < maxProjects; i++) {
      if (projectsSection[i].trim().length > 10) {
        projects.push(projectsSection[i].trim());
      }
    }
  }

  return projects;
}

/**
 * Divide section lines into subsections based on vertical line gap heuristic
 * @param {Array} lines - Array of lines in a section
 * @returns {Array} - Array of subsections (each subsection is an array of lines)
 */
function divideIntoSubsections(lines) {
  if (!lines || lines.length === 0) return [];

  const subsections = [];
  let currentSubsection = [lines[0]];
  const typicalLineGapThreshold = 1.4; // Based on algorithm description

  // Calculate typical line height from first few lines
  let lastLineIndex = Math.min(10, lines.length);
  let totalGap = 0;
  let gapCount = 0;

  for (let i = 1; i < lastLineIndex; i++) {
    // In a real PDF we'd measure vertical position, here we simulate with line breaks
    totalGap += 1;
    gapCount++;
  }

  const avgLineGap = gapCount > 0 ? totalGap / gapCount : 1;
  const subsectionThreshold = avgLineGap * typicalLineGapThreshold;

  // Identify subsections based on empty lines or section header formatting
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = lines[i - 1];

    // Check for subsection divider: either empty line (simulated by gap) or section header formatting
    const isNewSubsection =
      (i > 1 && lines[i - 1] === "") || // Empty line
      (line.toUpperCase() === line && line.length < 50) || // All caps, not too long
      /\b\d{4}\s*(-|–|to)\s*(\d{4}|present)/i.test(line) || // Date range usually indicates new position
      (/^[•◦\-*]/.test(line) && !/^[•◦\-*]/.test(prevLine)); // First bullet of a list

    if (isNewSubsection) {
      if (currentSubsection.length > 0) {
        subsections.push(currentSubsection);
        currentSubsection = [];
      }
    }

    currentSubsection.push(line);
  }

  // Add the last subsection
  if (currentSubsection.length > 0) {
    subsections.push(currentSubsection);
  }

  return subsections;
}

/**
 * Feature scoring system for better attribute extraction
 * Implements the algorithm described in OpenResume parser
 * @param {Array} lines - Lines from a section
 * @param {string} attributeType - The type of attribute to extract
 * @returns {Array} - Extracted attributes with scores
 */
function featureScoreExtraction(lines, attributeType) {
  const results = [];
  const featureSets = getFeatureSetsByType(attributeType);

  for (const line of lines) {
    let score = 0;
    // Apply all feature sets to the line
    for (const feature of featureSets) {
      if (feature.match(line)) {
        score += feature.score;
      }
    }

    if (score > 0) {
      results.push({
        text: line,
        score: score,
      });
    }
  }

  // Sort by score in descending order
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get feature sets for different attribute types
 * @param {string} attributeType - Type of attribute (skills, experience, projects)
 * @returns {Array} - Array of feature set objects
 */
function getFeatureSetsByType(attributeType) {
  const commonSets = [
    { match: (line) => /github|website|www\.|http/i.test(line), score: -5 }, // Ignore links
  ];

  if (attributeType === "skills") {
    return [
      ...commonSets,
      // Positive features for skills
      {
        match: (line) =>
          /\b(proficient|skilled|familiar|experience)\s+(in|with)\b/i.test(
            line
          ),
        score: 5,
      },
      {
        match: (line) =>
          /\b(languages|frameworks|tools|technologies)\s*:/i.test(line),
        score: 5,
      },
      {
        match: (line) => {
          try {
            // Safely check for programming languages including C++
            //             return /\b(javascript|python|java|react|angular|node|aws|docker)\b/i.test(line) ||
            //                    /\bc\+\+\b/i.test(line);
            return /\b(javascript|python|java|react|angular|node|aws|docker|c\+\+)\b/i.test(
              line
            );
          } catch (e) {
            // Fallback if regex fails
            const lowerLine = line.toLowerCase();
            return (
              lowerLine.includes("javascript") ||
              lowerLine.includes("python") ||
              lowerLine.includes("java") ||
              lowerLine.includes("react") ||
              lowerLine.includes("angular") ||
              lowerLine.includes("node") ||
              lowerLine.includes("aws") ||
              lowerLine.includes("docker") ||
              lowerLine.includes("c++")
            );
          }
        },
        score: 4,
      },
      {
        match: (line) =>
          line.includes(",") &&
          /\b[a-zA-Z+#]{2,}(,\s*[a-zA-Z+#]{2,})+\b/i.test(line),
        score: 3,
      }, // Comma-separated list
      // Negative features for skills
      { match: (line) => /\b\d{4}\b/.test(line), score: -3 }, // Contains year, likely experience
      {
        match: (line) =>
          /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line),
        score: -4,
      }, // Contains month
    ];
  } else if (attributeType === "experience") {
    return [
      ...commonSets,
      // Positive features for experience
      {
        match: (line) => /\b\d{4}\s*(-|–|to)\s*(\d{4}|present)\b/i.test(line),
        score: 5,
      }, // Date range
      {
        match: (line) =>
          /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\b/i.test(
            line
          ),
        score: 5,
      }, // Month year
      {
        match: (line) =>
          /\b(senior|junior|lead|developer|engineer|manager|director|coordinator)\b/i.test(
            line
          ),
        score: 4,
      }, // Job titles
      {
        match: (line) => /\b(company|corporation|inc|llc|ltd)\b/i.test(line),
        score: 3,
      }, // Company indicators
      // Negative features for experience
      {
        match: (line) =>
          /\b(project|application|web|mobile|app|developed|created|built)\b/i.test(
            line
          ) && !/\b\d{4}\b/.test(line),
        score: -3,
      }, // Likely projects without dates
    ];
  } else if (attributeType === "projects") {
    return [
      ...commonSets,
      // Positive features for projects
      {
        match: (line) =>
          /\b(project|application|web|mobile|app|developed|created|built)\b/i.test(
            line
          ),
        score: 5,
      },
      { match: (line) => /\b(github|demo|website)\b/i.test(line), score: 3 }, // Project link indicators
      {
        match: (line) =>
          /\b(using|utilized|with|technologies|tech stack)\b/i.test(line),
        score: 2,
      },
      // Negative features for projects
      {
        match: (line) => /\b(company|corporation|inc|llc|ltd)\b/i.test(line),
        score: -4,
      }, // Company indicators
      {
        match: (line) =>
          /\b(senior|junior|lead|manager|director|coordinator)\b/i.test(line),
        score: -3,
      }, // Job titles
    ];
  }

  // Default feature set
  return commonSets;
}

/**
 * Extract education information from resume text
 * @param {string} text - Raw text from resume
 * @returns {Array} - Array of education entries
 */
function extractEducation(text) {
  const educationEntries = [];

  // Common education section headers
  const educationHeaders = [
    "EDUCATION",
    "ACADEMIC BACKGROUND",
    "ACADEMIC HISTORY",
    "EDUCATIONAL BACKGROUND",
    "ACADEMIC QUALIFICATIONS",
    "QUALIFICATIONS",
  ];

  // Try to find education section
  let educationSection = "";
  const lines = text.split("\n");
  let inEducationSection = false;

  for (const line of lines) {
    const upperLine = line.trim().toUpperCase();

    // Check if we're entering education section
    if (educationHeaders.some((header) => upperLine.includes(header))) {
      inEducationSection = true;
      continue;
    }

    // Check if we're leaving education section (hit another major section)
    if (
      inEducationSection &&
      (upperLine.includes("EXPERIENCE") ||
        upperLine.includes("SKILLS") ||
        upperLine.includes("PROJECTS") ||
        upperLine.includes("PUBLICATIONS"))
    ) {
      break;
    }

    // Collect education section text
    if (inEducationSection && upperLine) {
      educationSection += upperLine + " ";
    }
  }

  if (!educationSection) {
    return [];
  }

  // Common degree keywords
  const degreeKeywords = [
    "BACHELOR",
    "BS",
    "BA",
    "B.S.",
    "B.A.",
    "MASTER",
    "MS",
    "MA",
    "M.S.",
    "M.A.",
    "PHD",
    "PH.D",
    "DOCTORATE",
    "ASSOCIATE",
    "AA",
    "A.A.",
    "BSC",
    "B.SC",
    "MSC",
    "M.SC",
  ];

  // Common field of study keywords
  const fieldKeywords = [
    "COMPUTER SCIENCE",
    "ENGINEERING",
    "MATHEMATICS",
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "BUSINESS",
    "ECONOMICS",
    "FINANCE",
    "PSYCHOLOGY",
    "SOCIOLOGY",
    "LITERATURE",
    "HISTORY",
    "PHILOSOPHY",
    "ARTS",
    "INFORMATION TECHNOLOGY",
    "DATA SCIENCE",
  ];

  // Try to extract individual education entries
  const entries = educationSection.split(/[•\-\*]/);

  for (const entry of entries) {
    if (!entry.trim()) continue;
    const educationEntry = {
      name: "",
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };

    // Extract institution (often contains keywords like "University", "College", "Institute")
    const institutionMatch = entry.match(
      /([\w\s]+(?:UNIVERSITY|COLLEGE|INSTITUTE|SCHOOL))/i
    );
    if (institutionMatch) {
      educationEntry.institution = institutionMatch[0].trim();
    }

    // Extract degree
    for (const keyword of degreeKeywords) {
      if (entry.includes(keyword)) {
        const degreeMatch =
          entry.match(new RegExp(`${keyword}[\\s\\w]*OF[\\s\\w]*`, "i")) ||
          entry.match(new RegExp(`${keyword}[\\s\\w]*IN[\\s\\w]*`, "i")) ||
          entry.match(new RegExp(`${keyword}[\\s\\w]*`, "i"));
        if (degreeMatch) {
          educationEntry.degree = degreeMatch[0].trim();
          break;
        }
      }
    }

    // Extract field of study
    for (const field of fieldKeywords) {
      if (entry.includes(field)) {
        educationEntry.field = field.trim();
        break;
      }
    }

    // Extract dates
    const dateMatch = entry.match(
      /(?:(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s*)?20\d{2}/g
    );
    if (dateMatch) {
      if (dateMatch.length >= 2) {
        educationEntry.startDate = dateMatch[0].trim();
        educationEntry.endDate = dateMatch[1].trim();
      } else if (dateMatch.length === 1) {
        educationEntry.endDate = dateMatch[0].trim();
      }
    }

    // Extract GPA if present
    const gpaMatch =
      entry.match(/GPA:?\s*([\d.]+)/i) || entry.match(/([\d.]+)\s*GPA/i);
    if (gpaMatch) {
      educationEntry.gpa = gpaMatch[1];
    }

    // Extract the name from the degree and field
    if (educationEntry.degree && educationEntry.field) {
      educationEntry.name = `${educationEntry.degree} in ${educationEntry.field}`;
    } else if (educationEntry.degree) {
      educationEntry.name = educationEntry.degree;
    } else if (educationEntry.field) {
      educationEntry.name = educationEntry.field;
    }

    // If we have an institution, make the name more complete
    if (educationEntry.institution) {
      if (educationEntry.name) {
        educationEntry.name = `${educationEntry.name} from ${educationEntry.institution}`;
      } else {
        educationEntry.name = educationEntry.institution;
      }
    }

    // Only add entries that have at least an institution or degree
    if (educationEntry.institution || educationEntry.degree) {
      educationEntries.push(educationEntry);
    }
  }

  return educationEntries;
}

/**
 * Format the parsed resume data
 * @param {Object} parsedResume - The parsed resume data
 * @returns {Object} - Formatted resume data
 */
function formatResumeData(parsedResume) {
  return {
    skills: parsedResume.skills || [],
    experience: parsedResume.experience || [],
    projects: parsedResume.projects || [],
    education: extractEducation(parsedResume.rawText) || [],
    rawText: parsedResume.rawText || "",
  };
}

/**
 * Apply more aggressive content-based section classification
 * @param {Array} lines - Array of text lines from the resume
 * @param {Object} sectionContent - Current section content object
 * @returns {Object} - Updated section content object
 */
function applyContentBasedClassification(lines, sectionContent) {
  console.log("Applying content-based classification to lines");

  // Define patterns for each section type
  const skillPatterns = [
    "javascript",
    "python",
    "java",
    "c\\+\\+",
    "c++",
    "html",
    "css",
    "react",
    "angular",
    "node",
    "typescript",
    "sql",
    "mongodb",
    "aws",
    "docker",
    "git",
    "proficient in",
    "expertise in",
    "familiar with",
    "skilled in",
    "programming languages",
    "frameworks",
    "technologies",
    "tools",
    ".net",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "rust",
    "golang",
    "go",
    "scala",
    "vue",
    "next.js",
    "express",
    "django",
    "flask",
    "spring",
    "machine learning",
    "deep learning",
    "ai",
    "artificial intelligence",
    "data science",
    "cloud",
    "devops",
    "web development",
    "mobile development",
    "database",
    "front-end",
    "back-end",
    "full-stack",
    "technical skills",
    "proficiency",
    "competency",
    "knowledge of",
  ];

  const experiencePatterns = [
    /\b\d{4}\s*(-|to|–)\s*(\d{4}|present)\b/i, // Date ranges
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i, // Month Year
    /\b(senior|junior|lead|developer|engineer|manager|director)\b/i, // Job titles
    /\b(company|corporation|inc|llc|ltd)\b/i, // Company indicators
    /\b(full-time|part-time|remote|hybrid|on-site|contract)\b/i, // Employment types
    /\b(responsible for|managed|led|coordinated|implemented|maintained)\b/i, // Job responsibilities
    /\b(work|professional|employment|career|experience)\b/i, // Experience terms
    /\b(supervised|directed|collaborated|partnered|designed|developed|deployed)\b/i, // Work activities
    /\b(team|client|project|deadline|deliverable|objective|goal)\b/i, // Work-related terms
  ];

  const projectPatterns = [
    /\bbuilt\b/i,
    /\bcreated\b/i,
    /\bdeveloped\b/i,
    /\bproject\b/i,
    /\bapplication\b/i,
    /\bwebsite\b/i,
    /\bgithub\b/i,
    /\bdemo\b/i,
    /\bdeployed\b/i,
    /\bimplemented\b/i,
    /\bdesigned\b/i,
    /\barchitected\b/i,
    /\bfeaturing\b/i,
    /\busing\b/i,
    /\btechnologies used\b/i,
    /\btech stack\b/i,
    /\bpersonal project\b/i,
    /\bportfolio\b/i,
    /\bopen source\b/i,
    /\bclient project\b/i,
    /\brepository\b/i,
    /\bapp\b/i,
    /\bmobile app\b/i,
    /\bweb app\b/i,
  ];

  const educationPatterns = [
    /\b(university|college|institute|school)\b/i, // Educational institutions
    /\b(bachelor|master|phd|doctorate|bs|ms|ba|ma|bsc|msc|b\.s\.|m\.s\.)\b/i, // Degrees
    /\b(computer science|engineering|mathematics|physics|business|economics)\b/i, // Fields of study
    /\bgpa\b/i,
    /\bcumulative\b/i,
    /\bgraduated\b/i, // Education-related terms
    /\b(summa cum laude|magna cum laude|cum laude|honors|distinction)\b/i, // Honors
  ];

  // Line-by-line classification
  const skillLines = [];
  const experienceLines = [];
  const projectLines = [];
  const educationLines = [];
  const unclassifiedLines = [];

  // First pass: classify each line individually
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let classified = false;

    // Try to classify as a skill
    let skillScore = 0;
    for (const pattern of skillPatterns) {
      if (typeof pattern === "string" && lowerLine.includes(pattern)) {
        skillScore += 1;
      }
    }

    // Try to classify as experience
    let experienceScore = 0;
    for (const pattern of experiencePatterns) {
      if (pattern.test(line)) {
        experienceScore += 1;
      }
    }

    // Try to classify as project
    let projectScore = 0;
    for (const pattern of projectPatterns) {
      if (pattern.test(line)) {
        projectScore += 1;
      }
    }

    // Try to classify as education
    let educationScore = 0;
    for (const pattern of educationPatterns) {
      if (pattern.test(line)) {
        educationScore += 1;
      }
    }

    // Assign to the category with the highest score
    const highestScore = Math.max(
      skillScore,
      experienceScore,
      projectScore,
      educationScore
    );

    if (highestScore > 0) {
      if (skillScore === highestScore) {
        skillLines.push(line);
        classified = true;
      } else if (experienceScore === highestScore) {
        experienceLines.push(line);
        classified = true;
      } else if (projectScore === highestScore) {
        projectLines.push(line);
        classified = true;
      } else if (educationScore === highestScore) {
        educationLines.push(line);
        classified = true;
      }
    }

    if (!classified) {
      unclassifiedLines.push(line);
    }
  }
  // Second pass: attempt to classify unclassified lines based on context
  // (lines near already classified lines are likely to be part of the same section)
  if (unclassifiedLines.length > 0) {
    console.log(
      `Attempting to classify ${unclassifiedLines.length} remaining lines based on context`
    );

    // Build a map of lines to their section types for quick lookup
    const lineToSectionMap = new Map();
    skillLines.forEach(line => lineToSectionMap.set(line, "SKILLS"));
    experienceLines.forEach(line => lineToSectionMap.set(line, "EXPERIENCE"));
    projectLines.forEach(line => lineToSectionMap.set(line, "PROJECTS"));
    educationLines.forEach(line => lineToSectionMap.set(line, "EDUCATION"));

    // If we have established sections, try to assign unclassified lines to nearby sections
    const allLines = [...lines];
    
    // Look for clusters of unclassified lines
    const unclassifiedClusters = [];
    let currentCluster = [];
    
    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      
      if (unclassifiedLines.includes(line)) {
        currentCluster.push({ index: i, line: line });
      } else if (currentCluster.length > 0) {
        unclassifiedClusters.push([...currentCluster]);
        currentCluster = [];
      }
    }
    
    // Add the last cluster if it exists
    if (currentCluster.length > 0) {
      unclassifiedClusters.push(currentCluster);
    }
    
    // Classify each cluster based on surrounding context
    for (const cluster of unclassifiedClusters) {
      // Look at up to 3 lines before and after the cluster
      const contextRange = 3;
      const clusterStartIdx = cluster[0].index;
      const clusterEndIdx = cluster[cluster.length - 1].index;
      
      let nearbySkills = 0;
      let nearbyExperience = 0;
      let nearbyProjects = 0;
      let nearbyEducation = 0;
      
      // Check lines before the cluster
      for (let i = Math.max(0, clusterStartIdx - contextRange); i < clusterStartIdx; i++) {
        const section = lineToSectionMap.get(allLines[i]);
        if (section === "SKILLS") nearbySkills++;
        else if (section === "EXPERIENCE") nearbyExperience++;
        else if (section === "PROJECTS") nearbyProjects++;
        else if (section === "EDUCATION") nearbyEducation++;
      }
      
      // Check lines after the cluster
      for (let i = clusterEndIdx + 1; i <= Math.min(allLines.length - 1, clusterEndIdx + contextRange); i++) {
        const section = lineToSectionMap.get(allLines[i]);
        if (section === "SKILLS") nearbySkills++;
        else if (section === "EXPERIENCE") nearbyExperience++;
        else if (section === "PROJECTS") nearbyProjects++;
        else if (section === "EDUCATION") nearbyEducation++;
      }
      
      // Additionally, check the cluster itself for formatting clues
      let hasDatePattern = false;
      let hasBulletPoints = false;
      let hasCompanyOrTitlePattern = false;
      let hasSkillsLikeFormat = false;
      
      for (const item of cluster) {
        if (/\b\d{4}\b/.test(item.line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(item.line)) {
          hasDatePattern = true;
        }
        if (item.line.trim().startsWith('•') || item.line.trim().startsWith('-') || item.line.trim().startsWith('*')) {
          hasBulletPoints = true;
        }
        if (/\b(senior|junior|lead|developer|engineer|manager|director)\b/i.test(item.line)) {
          hasCompanyOrTitlePattern = true;
        }
        if (item.line.includes(',') || item.line.includes(':')) {
          hasSkillsLikeFormat = true;
        }
      }
      
      // Make a decision based on context and formatting clues
      let targetSection = null;
      
      if (hasDatePattern && (hasCompanyOrTitlePattern || nearbyExperience > 0)) {
        // Likely experience section
        targetSection = "EXPERIENCE";
      } else if (hasDatePattern && (nearbyProjects > 0 || /\b(github|project|application|website)\b/i.test(cluster.map(i => i.line).join(' ')))) {
        // Likely projects section
        targetSection = "PROJECTS";
      } else if (hasSkillsLikeFormat && (nearbySkills > 0 || cluster.length < 3)) {
        // Likely skills section
        targetSection = "SKILLS";
      } else {
        // Assign to the section with the most context matches
        const highestContext = Math.max(nearbySkills, nearbyExperience, nearbyProjects, nearbyEducation);
        
        if (highestContext > 0) {
          if (nearbySkills === highestContext) targetSection = "SKILLS";
          else if (nearbyExperience === highestContext) targetSection = "EXPERIENCE";
          else if (nearbyProjects === highestContext) targetSection = "PROJECTS";
          else if (nearbyEducation === highestContext) targetSection = "EDUCATION";
        } else if (hasBulletPoints) {
          // If we have bullet points but no other context, try to make a smart guess
          if (hasDatePattern) {
            targetSection = "EXPERIENCE"; // Bullet points with dates are often experience
          } else if (hasSkillsLikeFormat) {
            targetSection = "SKILLS"; // Bullet points with comma-separated items are often skills
          } else {
            // Default to projects for bullet points with no other context
            targetSection = "PROJECTS";
          }
        }
      }
      
      // Assign the entire cluster to the determined section
      if (targetSection) {
        for (const item of cluster) {
          if (targetSection === "SKILLS") skillLines.push(item.line);
          else if (targetSection === "EXPERIENCE") experienceLines.push(item.line);
          else if (targetSection === "PROJECTS") projectLines.push(item.line);
          else if (targetSection === "EDUCATION") educationLines.push(item.line);
        }
      }
    }
  }

  // Add classified content to sections
  if (skillLines.length > 0) {
    // If section already exists, append to it rather than replacing
    if (sectionContent["SKILLS"] && sectionContent["SKILLS"].length > 0) {
      // Only add lines that aren't already in the section
      const existingLines = new Set(sectionContent["SKILLS"]);
      for (const line of skillLines) {
        if (!existingLines.has(line)) {
          sectionContent["SKILLS"].push(line);
        }
      }
    } else {
      sectionContent["SKILLS"] = skillLines;
    }
    console.log(`Found ${skillLines.length} skill lines based on content`);
  }

  if (experienceLines.length > 0) {
    if (
      sectionContent["EXPERIENCE"] &&
      sectionContent["EXPERIENCE"].length > 0
    ) {
      const existingLines = new Set(sectionContent["EXPERIENCE"]);
      for (const line of experienceLines) {
        if (!existingLines.has(line)) {
          sectionContent["EXPERIENCE"].push(line);
        }
      }
    } else {
      sectionContent["EXPERIENCE"] = experienceLines;
    }
    console.log(
      `Found ${experienceLines.length} experience lines based on content`
    );
  }

  if (projectLines.length > 0) {
    if (sectionContent["PROJECTS"] && sectionContent["PROJECTS"].length > 0) {
      const existingLines = new Set(sectionContent["PROJECTS"]);
      for (const line of projectLines) {
        if (!existingLines.has(line)) {
          sectionContent["PROJECTS"].push(line);
        }
      }
    } else {
      sectionContent["PROJECTS"] = projectLines;
    }
    console.log(`Found ${projectLines.length} project lines based on content`);
  }

  if (educationLines.length > 0) {
    if (sectionContent["EDUCATION"] && sectionContent["EDUCATION"].length > 0) {
      const existingLines = new Set(sectionContent["EDUCATION"]);
      for (const line of educationLines) {
        if (!existingLines.has(line)) {
          sectionContent["EDUCATION"].push(line);
        }
      }
    } else {
      sectionContent["EDUCATION"] = educationLines;
    }
    console.log(
      `Found ${educationLines.length} education lines based on content`
    );
  }

  return sectionContent;
}

export {
  parseResumeText,
  formatResumeData,
  extractSkills,
  extractExperience,
  extractProjects,
  extractEducation,
};
