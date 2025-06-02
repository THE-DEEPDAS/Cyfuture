import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";
import { analyzeCandidate } from "../utils/llm.js";

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private/Company
 */
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      type,
      experience,
      skills,
      salary,
      shortlistCount,
      expiresAt,
    } = req.body;

    // Create job
    const job = await Job.create({
      company: req.user.id,
      title,
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements.split("\n").filter((item) => item.trim() !== ""),
      location,
      type,
      experience,
      skills: Array.isArray(skills)
        ? skills
        : skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== ""),
      salary,
      shortlistCount: shortlistCount || 10,
      expiresAt,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      type,
      experience,
      skills,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter (title and description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add location filter
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Add type filter
    if (type) {
      filter.type = type;
    }

    // Add experience filter
    if (experience) {
      filter.experience = experience;
    }

    // Add skills filter
    if (skills) {
      const skillsArray = skills.split(",").map((skill) => skill.trim());
      filter.skills = { $in: skillsArray };
    }

    // Only return active jobs
    filter.isActive = true;

    // Only return jobs that haven't expired
    filter.expiresAt = { $gt: new Date() };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate("company", "companyName industry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "company",
      "companyName industry"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Get application count
    const applicationCount = await Application.countDocuments({ job: job._id });

    // Add application count to job object
    const jobWithApplicationCount = {
      ...job.toObject(),
      applicationCount,
    };

    res.json(jobWithApplicationCount);
  } catch (error) {
    console.error("Error getting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update a job
 * @route   PUT /api/jobs/:id
 * @access  Private/Company
 */
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job belongs to the company making the request
    if (job.company.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const {
      title,
      description,
      requirements,
      location,
      type,
      experience,
      skills,
      salary,
      shortlistCount,
      expiresAt,
      isActive,
    } = req.body;

    // Update job
    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = Array.isArray(requirements)
      ? requirements
      : requirements
      ? requirements.split("\n").filter((item) => item.trim() !== "")
      : job.requirements;
    job.location = location || job.location;
    job.type = type || job.type;
    job.experience = experience || job.experience;
    job.skills = Array.isArray(skills)
      ? skills
      : skills
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== "")
      : job.skills;
    job.salary = salary || job.salary;
    job.shortlistCount = shortlistCount || job.shortlistCount;
    job.expiresAt = expiresAt || job.expiresAt;
    job.isActive = isActive !== undefined ? isActive : job.isActive;

    const updatedJob = await job.save();

    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a job
 * @route   DELETE /api/jobs/:id
 * @access  Private/Company
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job belongs to the company making the request
    if (job.company.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    // Check if job has applications
    const applicationCount = await Application.countDocuments({ job: job._id });

    if (applicationCount > 0) {
      // If job has applications, just deactivate it instead of deleting
      job.isActive = false;
      await job.save();
      return res.json({
        message: "Job deactivated because it has applications",
      });
    }

    // Delete job if no applications
    await job.remove();

    res.json({ message: "Job removed" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get jobs for logged in company
 * @route   GET /api/jobs/company/me
 * @access  Private/Company
 */
const getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user.id }).sort({
      createdAt: -1,
    });

    // Get application counts for each job
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({
          job: job._id,
        });
        return {
          ...job.toObject(),
          applicationCount,
        };
      })
    );

    res.json(jobsWithApplicationCounts);
  } catch (error) {
    console.error("Error getting company jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Apply for a job
 * @route   POST /api/jobs/:id/apply
 * @access  Private/Candidate
 */
const applyForJob = async (req, res) => {
  try {
    const { resumeId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if job is active
    if (!job.isActive) {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting applications" });
    }

    // Check if job has expired
    if (new Date(job.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This job posting has expired" });
    }

    // Check if resume exists
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      job: job._id,
      candidate: req.user.id,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Calculate match score
    let matchScore = 0;
    let llmRationale = "";

    try {
      // First try algorithmic matching
      const candidateSkills = resume.parsedData.skills || [];
      const jobSkills = job.skills || [];

      // Simple skill matching (can be improved)
      const matchingSkills = candidateSkills.filter((skill) =>
        jobSkills.some(
          (jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );

      matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);

      // If score is below threshold, use LLM for deeper analysis
      if (matchScore < 70) {
        const analysis = await analyzeCandidate(
          job.description,
          resume.parsedData
        );

        matchScore = analysis.matchScore;
        llmRationale = analysis.rationale;
      } else {
        llmRationale = `Candidate has ${matchingSkills.length} out of ${jobSkills.length} required skills for this position.`;
      }
    } catch (error) {
      console.error("Error calculating match score:", error);
      // If there's an error, use a default score
      matchScore = 50;
      llmRationale =
        "Match score calculated based on basic profile information.";
    }

    // Create application
    const application = await Application.create({
      job: job._id,
      candidate: req.user.id,
      resume: resume._id,
      coverLetter,
      matchScore,
      llmRationale,
      status: "pending",
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
  applyForJob,
};
