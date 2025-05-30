import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fetch from 'node-fetch';

// Parse PDF resume
const parsePdfResume = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer));
    return parseResumeText(data.text);
  } catch (error) {
    console.error('Error parsing PDF resume:', error);
    throw new Error('Failed to parse PDF resume');
  }
};

// Parse DOCX resume
const parseDocxResume = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return parseResumeText(result.value);
  } catch (error) {
    console.error('Error parsing DOCX resume:', error);
    throw new Error('Failed to parse DOCX resume');
  }
};

// Parse resume text to extract structured data
const parseResumeText = (text) => {
  // Basic parsing logic - in production, this would be more sophisticated
  // or would use an NLP service or LLM for better extraction
  
  const parsedData = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    summary: extractSummary(text),
    skills: extractSkills(text),
    education: extractEducation(text),
    experience: extractExperience(text),
    certifications: extractCertifications(text),
    languages: extractLanguages(text),
  };

  return {
    parsedData,
    rawText: text,
  };
};

// Helper functions for extracting specific information
const extractName = (text) => {
  // Simple name extraction - first line or first capitalized words
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    return lines[0].trim();
  }
  return '';
};

const extractEmail = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
};

const extractPhone = (text) => {
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : '';
};

const extractSummary = (text) => {
  // Look for summary or profile section
  const summaryRegex = /(?:summary|profile|about|objective)(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is;
  const matches = text.match(summaryRegex);
  return matches ? matches[1].trim() : '';
};

const extractSkills = (text) => {
  // Look for skills section and extract list of skills
  const skillsSection = text.match(/skills(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is);
  
  if (skillsSection && skillsSection[1]) {
    // Split by commas, bullets, or new lines and clean up
    return skillsSection[1]
      .split(/[,•\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
  
  // Fallback: extract common technical skills
  const technicalSkillsRegex = /(?:javascript|python|java|c\+\+|react|node\.js|html|css|sql|mongodb|aws|docker|kubernetes|git|agile|scrum)/gi;
  const matches = [...text.matchAll(technicalSkillsRegex)].map(match => match[0]);
  return [...new Set(matches)]; // Remove duplicates
};

const extractEducation = (text) => {
  // Basic education extraction
  const educationSection = text.match(/education(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is);
  
  if (!educationSection) return [];
  
  // Very basic parsing - in production would use more sophisticated NLP
  const educationText = educationSection[1];
  const educationEntries = educationText.split(/\n(?=[A-Z])/);
  
  return educationEntries.map(entry => {
    // Try to extract degree and institution
    const institution = entry.match(/([A-Za-z\s]+University|College|School|Institute)/i);
    const degree = entry.match(/(Bachelor|Master|PhD|BS|MS|BA|MBA|Associate)/i);
    
    return {
      institution: institution ? institution[0].trim() : '',
      degree: degree ? degree[0].trim() : '',
      field: '',
      startDate: null,
      endDate: null,
    };
  }).filter(edu => edu.institution || edu.degree);
};

const extractExperience = (text) => {
  // Basic experience extraction
  const experienceSection = text.match(/(?:experience|work experience|employment)(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is);
  
  if (!experienceSection) return [];
  
  // Very basic parsing - in production would use more sophisticated NLP
  const experienceText = experienceSection[1];
  const experienceEntries = experienceText.split(/\n(?=[A-Z])/);
  
  return experienceEntries.map(entry => {
    // Try to extract company and title
    const company = entry.match(/([A-Za-z\s]+Inc|LLC|Corp|Corporation|Company)/i);
    
    return {
      company: company ? company[0].trim() : '',
      title: '',
      location: '',
      startDate: null,
      endDate: null,
      description: entry.trim(),
    };
  }).filter(exp => exp.company || exp.description);
};

const extractCertifications = (text) => {
  // Look for certifications section
  const certSection = text.match(/certifications(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is);
  
  if (certSection && certSection[1]) {
    return certSection[1]
      .split(/[,•\n]/)
      .map(cert => cert.trim())
      .filter(cert => cert.length > 0);
  }
  
  return [];
};

const extractLanguages = (text) => {
  // Look for languages section
  const langSection = text.match(/languages(?:\s|:)(.*?)(?:\n\n|\n[A-Z])/is);
  
  if (langSection && langSection[1]) {
    return langSection[1]
      .split(/[,•\n]/)
      .map(lang => lang.trim())
      .filter(lang => lang.length > 0);
  }
  
  return [];
};

export { parsePdfResume, parseDocxResume };