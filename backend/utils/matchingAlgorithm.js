import llmService from './llmService.js';

/**
 * Matching Algorithm for comparing resumes to job postings
 */
class MatchingAlgorithm {
  /**
   * Calculate the match score between a resume and a job
   * @param {Object} resume - The resume data
   * @param {Object} job - The job posting data
   */
  async calculateMatchScore(resume, job) {
    try {
      // Calculate threshold-based match scores
      const thresholdScores = this.calculateThresholdScores(resume, job);
      
      // Get LLM-based matching score and reasoning
      const llmResult = await llmService.matchResumeToJob(resume, job);
      
      // Combine the results
      const finalResult = {
        matchScore: (thresholdScores.overallScore + llmResult.overallScore) / 2,
        skillMatchScore: thresholdScores.skillsScore,
        experienceMatchScore: thresholdScores.experienceScore,
        educationMatchScore: thresholdScores.educationScore,
        llmMatchScore: llmResult.overallScore,
        llmReasoning: llmResult.reasoning
      };
      
      return finalResult;
    } catch (error) {
      console.error('Error calculating match score:', error);
      throw new Error('Failed to calculate match score');
    }
  }

  /**
   * Calculate threshold-based match scores
   * @param {Object} resume - The resume data
   * @param {Object} job - The job posting data
   */
  calculateThresholdScores(resume, job) {
    // Skills matching
    const skillsScore = this.calculateSkillsMatch(resume.skills, job.requiredSkills);
    
    // Experience matching
    const experienceScore = this.calculateExperienceMatch(resume.experience, job.experienceLevel);
    
    // Education matching (basic implementation)
    const educationScore = this.calculateEducationMatch(resume.education, job.experienceLevel);
    
    // Calculate overall score (weighted average)
    const overallScore = (
      skillsScore * 0.5 + 
      experienceScore * 0.3 + 
      educationScore * 0.2
    );
    
    return {
      overallScore,
      skillsScore,
      experienceScore,
      educationScore
    };
  }

  /**
   * Calculate skills match score
   * @param {Array} resumeSkills - The candidate's skills
   * @param {Array} jobSkills - The required job skills
   */
  calculateSkillsMatch(resumeSkills, jobSkills) {
    if (!resumeSkills || !jobSkills || jobSkills.length === 0) {
      return 0;
    }
    
    // Normalize skills (lowercase, trim)
    const normalizedResumeSkills = resumeSkills.map(skill => skill.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());
    
    // Count matching skills
    let matchCount = 0;
    for (const jobSkill of normalizedJobSkills) {
      if (normalizedResumeSkills.some(resumeSkill => resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill))) {
        matchCount++;
      }
    }
    
    // Calculate percentage match
    return (matchCount / normalizedJobSkills.length) * 100;
  }

  /**
   * Calculate experience match score
   * @param {Array} experiences - The candidate's experiences
   * @param {string} jobExperienceLevel - The required experience level
   */
  calculateExperienceMatch(experiences, jobExperienceLevel) {
    if (!experiences || experiences.length === 0) {
      return 0;
    }
    
    // Calculate total months of experience
    let totalMonths = 0;
    for (const exp of experiences) {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += Math.max(0, months);
    }
    
    // Map job experience level to expected months
    const experienceLevelMap = {
      'Entry-level': 12, // 1 year
      'Mid-level': 36, // 3 years
      'Senior': 60, // 5 years
      'Executive': 120 // 10 years
    };
    
    const expectedMonths = experienceLevelMap[jobExperienceLevel] || 0;
    
    // Calculate match score
    if (expectedMonths === 0) {
      return 100; // No experience required
    } else if (totalMonths >= expectedMonths) {
      return 100; // Meets or exceeds requirements
    } else {
      return (totalMonths / expectedMonths) * 100; // Partial match
    }
  }

  /**
   * Calculate education match score
   * @param {Array} education - The candidate's education
   * @param {string} jobExperienceLevel - The required experience level
   */
  calculateEducationMatch(education, jobExperienceLevel) {
    if (!education || education.length === 0) {
      return 50; // Neutral score if no education is listed
    }
    
    // Map degrees to score values
    const degreeScores = {
      'High School': 60,
      'Associate': 70,
      'Bachelor': 80,
      'Master': 90,
      'PhD': 100,
      'Doctorate': 100
    };
    
    // Find highest degree
    let highestScore = 60; // Default to high school level
    
    for (const edu of education) {
      const degree = edu.degree || '';
      
      // Check for key degree terms
      for (const [degreeName, score] of Object.entries(degreeScores)) {
        if (degree.toLowerCase().includes(degreeName.toLowerCase())) {
          highestScore = Math.max(highestScore, score);
        }
      }
    }
    
    // Adjust based on job experience level
    const experienceLevelMap = {
      'Entry-level': 70, // Associates or Bachelor's helpful
      'Mid-level': 80, // Bachelor's expected
      'Senior': 85, // Bachelor's with experience or Master's
      'Executive': 90 // Master's or higher often expected
    };
    
    const expectedScore = experienceLevelMap[jobExperienceLevel] || 70;
    
    // Calculate match score
    if (highestScore >= expectedScore) {
      return 100; // Meets or exceeds requirements
    } else {
      return (highestScore / expectedScore) * 100; // Partial match
    }
  }
}

export default new MatchingAlgorithm();