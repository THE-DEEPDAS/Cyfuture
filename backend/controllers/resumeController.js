import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { parseResume } from "../services/resumeParser.js";
import { uploadFile, deleteFile, cloudinary } from "../utils/cloudinary.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

/**
 * @desc    Upload and process a new resume
 * @route   POST /api/resumes
 * @access  Private/Candidate
 */
export const uploadResume = async (req, res) => {
  let cloudinaryResult = null;
  let parsedData = null;

  try {
    console.log("Starting resume upload process");

    // Validate file presence
    if (!req.file) {
      console.log("No file received in request");
      return res.status(400).json({ message: "Please upload a file" });
    }

    console.log("File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // First upload to Cloudinary since that's critical
    try {
      console.log("Attempting to upload to Cloudinary");
      cloudinaryResult = await uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      if (!cloudinaryResult || !cloudinaryResult.secure_url) {
        throw new Error("Failed to upload file to Cloudinary");
      }
      console.log("File uploaded to Cloudinary:", cloudinaryResult.secure_url);
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      throw new Error("Failed to upload file");
    } // Parse the resume using LLM with separate calls for skills, experience, and projects
    try {
      console.log("Attempting to parse resume with LLM using separate calls");
      const { parseResumeWithLLM } = await import(
        "../services/separateCallsResumeExtractor.js"
      );
      parsedData = await parseResumeWithLLM(req.file.buffer);
      console.log("Resume parsed successfully:", parsedData);
    } catch (parseError) {
      console.error("Resume parsing error:", parseError);
      // Create empty structure if parsing fails
      parsedData = {
        skills: [],
        experience: [],
        projects: [],
      };
    }

    // Create resume record with validated data structure
    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || req.file.originalname.split(".")[0],
      fileUrl: cloudinaryResult.secure_url,
      fileType: req.file.originalname.split(".").pop().toLowerCase(),
      parsedData: {
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        experience: Array.isArray(parsedData.experience)
          ? parsedData.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              location: exp.location || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || null,
              description: exp.description || "",
            }))
          : [],
        projects: Array.isArray(parsedData.projects)
          ? parsedData.projects.map((proj) => ({
              name: proj.name || "",
              description: proj.description || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              url: proj.url || "",
            }))
          : [],
      },
      isDefault: (await Resume.countDocuments({ user: req.user._id })) === 0,
    });

    console.log("Resume record created successfully");

    res.status(201).json({
      success: true,
      resume,
      parsedData: resume.parsedData,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    if (cloudinaryResult?.public_id) {
      try {
        await deleteFile(cloudinaryResult.public_id);
      } catch (deleteError) {
        console.error("Error deleting file from Cloudinary:", deleteError);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all resumes for a user
 * @route   GET /api/resumes
 * @access  Private/Candidate
 */
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select("title fileUrl fileType createdAt updatedAt isDefault")
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Server error fetching resumes" });
  }
};

/**
 * @desc    Get a single resume by id
 * @route   GET /api/resumes/:id
 * @access  Private/Candidate
 */
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Ensure proper data structure before sending
    const formattedResponse = {
      ...resume.toObject(),
      parsedData: {
        skills: Array.isArray(resume.parsedData?.skills)
          ? resume.parsedData.skills
          : [],
        experience: Array.isArray(resume.parsedData?.experience)
          ? resume.parsedData.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              location: exp.location || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || null,
              description: exp.description || "",
            }))
          : [],
        projects: Array.isArray(resume.parsedData?.projects)
          ? resume.parsedData.projects.map((proj) => ({
              name: proj.name || "",
              description: proj.description || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              url: proj.url || "",
            }))
          : [],
      },
    };

    console.log(
      "Sending formatted resume data:",
      JSON.stringify(formattedResponse.parsedData, null, 2)
    );
    res.json(formattedResponse);
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error fetching resume" });
  }
};

/**
 * @desc    Get default resume or first resume
 * @route   GET /api/resumes/default
 * @access  Private/Candidate
 */
export const getDefaultResume = async (req, res) => {
  try {
    // Find default resume
    let resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    // If no default, get the most recent resume
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
    }
    if (!resume) {
      return res.status(404).json({ message: "No resumes found" });
    }

    // Ensure proper data structure before sending
    const formattedResponse = {
      ...resume.toObject(),
      parsedData: {
        skills: Array.isArray(resume.parsedData?.skills)
          ? resume.parsedData.skills
          : [],
        experience: Array.isArray(resume.parsedData?.experience)
          ? resume.parsedData.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              location: exp.location || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || null,
              description: exp.description || "",
            }))
          : [],
        projects: Array.isArray(resume.parsedData?.projects)
          ? resume.parsedData.projects.map((proj) => ({
              name: proj.name || "",
              description: proj.description || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              url: proj.url || "",
            }))
          : [],
      },
    };

    console.log(
      "Sending formatted default resume data:",
      JSON.stringify(formattedResponse.parsedData, null, 2)
    );
    res.json(formattedResponse);
  } catch (error) {
    console.error("Get default resume error:", error);
    res.status(500).json({ message: "Server error fetching default resume" });
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private/Candidate
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const wasDefault = resume.isDefault;

    // Delete the resume
    await resume.deleteOne();

    // If deleted resume was default, set another resume as default
    if (wasDefault) {
      const newDefault = await Resume.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });

      if (newDefault) {
        newDefault.isDefault = true;
        await newDefault.save();
      }
    }

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Server error deleting resume" });
  }
};

/**
 * @desc    Set a resume as default
 * @route   PUT /api/resumes/:id/default
 * @access  Private/Candidate
 */
export const setDefaultResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Remove default status from all resumes for this user
    await Resume.updateMany({ user: req.user._id }, { isDefault: false });

    // Set this resume as default
    resume.isDefault = true;
    await resume.save();

    res.json({ message: "Resume set as default", resume });
  } catch (error) {
    console.error("Set default resume error:", error);
    res.status(500).json({ message: "Server error setting default resume" });
  }
};

/**
 * Update user profile with parsed resume data
 */
const updateUserProfile = async (userId, parsedData) => {
  const updatedFields = {
    skills: parsedData.skills,
    experience: parsedData.experience,
    // Add other relevant fields from parsed data
  };

  await User.findByIdAndUpdate(userId, {
    $set: updatedFields,
  });
};

/**
 * Find matching jobs using both requirements and LLM
 */
const findMatchingJobs = async (parsedData) => {
  // Get all active jobs
  const activeJobs = await Job.find({ isActive: true });

  // Traditional matching based on requirements
  const requirementsMatches = await Promise.all(
    activeJobs.map(async (job) => {
      const match = await calculateJobMatch(job, parsedData);
      return {
        job,
        score: match.score,
        matchType: "requirements",
      };
    })
  );

  // LLM-based matching
  const llmMatches = await Promise.all(
    activeJobs.map(async (job) => {
      const match = await calculateLLMMatch(job, parsedData);
      return {
        job,
        score: match.score,
        matchType: "llm",
        confidence: match.confidence,
      };
    })
  );

  // Combine and sort matches
  const allMatches = [...requirementsMatches, ...llmMatches]
    .sort((a, b) => b.score - a.score)
    .filter((match) => match.score >= 70); // Minimum match threshold

  return allMatches;
};

/**
 * Calculate traditional job match score
 */
const calculateJobMatch = async (job, parsedData) => {
  const skillsMatch = calculateSkillsMatch(
    job.requiredSkills,
    parsedData.skills
  );
  const experienceMatch = calculateExperienceMatch(
    job.experience,
    parsedData.experience
  );

  const score = (skillsMatch * 0.7 + experienceMatch * 0.3) * 100;

  return {
    score: Math.round(score),
    details: {
      skillsMatch,
      experienceMatch,
    },
  };
};

/**
 * Calculate LLM-based match score
 */
const calculateLLMMatch = async (job, parsedData) => {
  const prompt = `
    Job Requirements:
    ${job.description}
    ${job.requirements.join("\n")}
    
    Candidate Profile:
    Skills: ${parsedData.skills.join(", ")}
    Experience: ${JSON.stringify(parsedData.experience)}
    
    Analyze the match between the job requirements and candidate profile. 
    Return a score between 0-100 and confidence level between 0-1.
  `;

  try {
    const llmResponse = await analyzeCandidateMatch(prompt);
    return {
      score: llmResponse.score,
      confidence: llmResponse.confidence,
      explanation: llmResponse.explanation,
    };
  } catch (error) {
    console.error("LLM matching error:", error);
    return {
      score: 0,
      confidence: 0,
      explanation: "Error in LLM analysis",
    };
  }
};

/**
 * @desc    Add a skill to the user's default resume
 * @route   POST /api/resumes/skills
 * @access  Private/Candidate
 */
export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Add skill if it doesn't already exist
    if (!resume.parsedData.skills.includes(skill)) {
      resume.parsedData.skills.push(skill);
      await resume.save();
    }

    res.json(resume);
  } catch (error) {
    console.error("Add skill error:", error);
    res.status(500).json({ message: "Server error adding skill" });
  }
};

/**
 * @desc    Delete a skill from the user's default resume
 * @route   DELETE /api/resumes/skills
 * @access  Private/Candidate
 */
export const deleteSkill = async (req, res) => {
  try {
    const { skill } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Initialize skills array if it doesn't exist
    if (!resume.parsedData || !Array.isArray(resume.parsedData.skills)) {
      resume.parsedData = {
        ...resume.parsedData,
        skills: [],
      };
    }

    // Remove skill from array
    resume.parsedData.skills = resume.parsedData.skills.filter(
      (s) => s !== skill
    );

    // Save changes
    await resume.save();

    // Return updated resume data
    res.json({
      message: "Skill deleted successfully",
      resume,
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({ message: "Server error deleting skill" });
  }
};

/**
 * @desc    Add experience to the user's default resume
 * @route   POST /api/resumes/experience
 * @access  Private/Candidate
 */
export const addExperience = async (req, res) => {
  try {
    const { title, company, location, startDate, endDate, description } =
      req.body;

    if (!title || !company) {
      return res
        .status(400)
        .json({ message: "Title and company are required" });
    }

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Add new experience with a unique ID
    const newExp = {
      _id: new mongoose.Types.ObjectId(),
      title,
      company,
      location,
      startDate,
      endDate,
      description,
    };

    resume.parsedData.experience.push(newExp);
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error("Add experience error:", error);
    res.status(500).json({ message: "Server error adding experience" });
  }
};

/**
 * @desc    Delete experience from the user's default resume
 * @route   DELETE /api/resumes/experience/:id
 * @access  Private/Candidate
 */
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Remove experience with matching ID
    resume.parsedData.experience = resume.parsedData.experience.filter(
      (exp) => exp._id.toString() !== id
    );
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({ message: "Server error deleting experience" });
  }
};

/**
 * @desc    Add project to the user's default resume
 * @route   POST /api/resumes/projects
 * @access  Private/Candidate
 */
export const addProject = async (req, res) => {
  try {
    const { name, description, technologies, url } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Add new project with a unique ID
    const newProject = {
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      technologies: Array.isArray(technologies) ? technologies : [],
      url,
    };

    resume.parsedData.projects.push(newProject);
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error("Add project error:", error);
    res.status(500).json({ message: "Server error adding project" });
  }
};

/**
 * @desc    Delete project from the user's default resume
 * @route   DELETE /api/resumes/projects/:id
 * @access  Private/Candidate
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Find default resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    }

    // Remove project with matching ID
    resume.parsedData.projects = resume.parsedData.projects.filter(
      (proj) => proj._id.toString() !== id
    );
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error deleting project" });
  }
};
