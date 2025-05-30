import fetch from 'node-fetch';

// Calculate match score between job and resume
const calculateMatchScore = async (job, resume) => {
  try {
    // Extract relevant data
    const jobSkills = job.skills || [];
    const resumeSkills = resume.parsedData.skills || [];
    
    // Calculate skills match
    const skillsMatch = calculateSkillsMatch(jobSkills, resumeSkills);
    
    // Calculate experience match
    const experienceMatch = calculateExperienceMatch(job, resume);
    
    // Calculate education match
    const educationMatch = calculateEducationMatch(job, resume);
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (skillsMatch.score * 0.5) + 
      (experienceMatch.score * 0.3) + 
      (educationMatch.score * 0.2)
    );
    
    // If score is below threshold, use LLM for explanation
    let overallAssessment = '';
    if (overallScore < 70) {
      overallAssessment = await getLLMExplanation(job, resume, {
        skillsMatch,
        experienceMatch,
        educationMatch,
        overallScore
      });
    } else {
      overallAssessment = generateBasicExplanation(skillsMatch, experienceMatch, educationMatch);
    }
    
    return {
      matchScore: overallScore,
      matchDetails: {
        skillsMatch,
        experienceMatch,
        educationMatch,
        overallAssessment
      }
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw new Error('Failed to calculate match score');
  }
};

// Calculate skills match
const calculateSkillsMatch = (jobSkills, resumeSkills) => {
  // Convert to lowercase for case-insensitive matching
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase());
  const normalizedResumeSkills = resumeSkills.map(skill => skill.toLowerCase());
  
  // Find matching skills
  const matched = normalizedJobSkills.filter(skill => 
    normalizedResumeSkills.some(resumeSkill => 
      resumeSkill.includes(skill) || skill.includes(resumeSkill)
    )
  );
  
  // Find missing skills
  const missing = normalizedJobSkills.filter(skill => 
    !normalizedResumeSkills.some(resumeSkill => 
      resumeSkill.includes(skill) || skill.includes(resumeSkill)
    )
  );
  
  // Calculate score (percentage of job skills matched)
  const score = normalizedJobSkills.length > 0 
    ? Math.round((matched.length / normalizedJobSkills.length) * 100) 
    : 0;
  
  return {
    score,
    matched,
    missing
  };
};

// Calculate experience match
const calculateExperienceMatch = (job, resume) => {
  // Basic implementation - would be more sophisticated in production
  const requiredExperience = parseExperienceRequirement(job.experience);
  const candidateExperience = estimateTotalExperience(resume.parsedData.experience);
  
  let score = 0;
  let details = '';
  
  if (candidateExperience >= requiredExperience) {
    score = 100;
    details = `Candidate has ${candidateExperience}+ years of experience, meeting the required ${requiredExperience} years.`;
  } else if (candidateExperience >= requiredExperience * 0.8) {
    score = 80;
    details = `Candidate has ${candidateExperience}+ years of experience, slightly below the required ${requiredExperience} years.`;
  } else if (candidateExperience >= requiredExperience * 0.5) {
    score = 50;
    details = `Candidate has ${candidateExperience}+ years of experience, below the required ${requiredExperience} years.`;
  } else {
    score = 30;
    details = `Candidate has ${candidateExperience}+ years of experience, significantly below the required ${requiredExperience} years.`;
  }
  
  return {
    score,
    details
  };
};

// Calculate education match
const calculateEducationMatch = (job, resume) => {
  // Basic implementation - would be more sophisticated in production
  // Assuming job requirements might be inferred from description
  const education = resume.parsedData.education || [];
  
  let score = 0;
  let details = '';
  
  if (education.length > 0) {
    // Check for degree level
    const hasBachelors = education.some(edu => 
      edu.degree && edu.degree.toLowerCase().includes('bachelor')
    );
    
    const hasMasters = education.some(edu => 
      edu.degree && edu.degree.toLowerCase().includes('master')
    );
    
    const hasPhD = education.some(edu => 
      edu.degree && (edu.degree.toLowerCase().includes('phd') || edu.degree.toLowerCase().includes('doctor'))
    );
    
    if (hasPhD) {
      score = 100;
      details = 'Candidate has a PhD degree.';
    } else if (hasMasters) {
      score = 90;
      details = 'Candidate has a Master\'s degree.';
    } else if (hasBachelors) {
      score = 80;
      details = 'Candidate has a Bachelor\'s degree.';
    } else {
      score = 60;
      details = 'Candidate has some education listed but no specific degree identified.';
    }
  } else {
    score = 30;
    details = 'No education information found in resume.';
  }
  
  return {
    score,
    details
  };
};

// Helper function to parse experience requirement from string
const parseExperienceRequirement = (experienceStr) => {
  // Extract years from strings like "3+ years", "2-4 years", etc.
  const match = experienceStr.match(/(\d+)(?:\s*-\s*\d+)?\s*\+?\s*years?/i);
  return match ? parseInt(match[1], 10) : 1; // Default to 1 year if parsing fails
};

// Helper function to estimate total experience from resume
const estimateTotalExperience = (experiences) => {
  if (!experiences || experiences.length === 0) {
    return 0;
  }
  
  // In a real implementation, this would calculate actual years from dates
  // For this example, we'll just use the number of experiences as a proxy
  return experiences.length;
};

// Generate basic explanation for match
const generateBasicExplanation = (skillsMatch, experienceMatch, educationMatch) => {
  let explanation = 'Match Assessment: ';
  
  if (skillsMatch.score >= 80) {
    explanation += 'Strong skills match. ';
  } else if (skillsMatch.score >= 50) {
    explanation += 'Moderate skills match. ';
  } else {
    explanation += 'Weak skills match. ';
  }
  
  explanation += experienceMatch.details + ' ';
  explanation += educationMatch.details;
  
  return explanation;
};

// Get explanation from LLM when match score is low
const getLLMExplanation = async (job, resume, matchDetails) => {
  try {
    // In production, this would call the Gemini API
    // For this example, we'll return a placeholder explanation
    
    const missingSkills = matchDetails.skillsMatch.missing.join(', ');
    
    return `This candidate has a match score of ${matchDetails.overallScore}%. While they have some relevant experience, they are missing key skills including: ${missingSkills}. Consider looking for candidates with more direct experience in these areas, or if the candidate shows potential in other ways, they might benefit from additional training in these skills.`;
  } catch (error) {
    console.error('Error getting LLM explanation:', error);
    return generateBasicExplanation(
      matchDetails.skillsMatch, 
      matchDetails.experienceMatch, 
      matchDetails.educationMatch
    );
  }
};

export { calculateMatchScore };