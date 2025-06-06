import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Job from "../models/Job.js";
import User from "../models/User.js";

dotenv.config();

// First create a company user for our jobs
let companyId;

const createCompany = async () => {
  const company = new User({
    name: "Tech Corp Admin",
    companyName: "TechCorp Solutions",
    email: "hiring@techcorp.com",
    password: bcrypt.hashSync("password123", 10),
    role: "company",
    industry: "Technology",
  });
  const createdCompany = await company.save();
  return createdCompany._id;
};

const jobs = [
  // Tech Jobs
  {
    title: "Senior Full Stack Developer",
    company: companyId, // Will be set after company creation
    location: "Remote",
    description:
      "We're seeking an experienced full stack developer to join our growing team. You'll work on cutting-edge projects using modern technologies.",
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "MongoDB",
      "TypeScript",
      "AWS",
      "Docker",
      "Kubernetes",
      "GraphQL",
    ],
    experience: "Senior",
    type: "Full-time",
    salary: {
      min: 100000,
      max: 150000,
      currency: "USD",
    },
    requirements: [
      "5+ years of full stack development experience",
      "Strong proficiency in React and Node.js",
      "Experience with cloud platforms (preferably AWS)",
      "Excellent problem-solving skills",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    title: "Machine Learning Engineer",
    company: companyId,
    location: "San Francisco, CA",
    description:
      "Join our AI team to develop cutting-edge machine learning solutions for real-world problems.",
    skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Machine Learning",
      "Keras",
      "Computer Vision",
      "NLP",
      "AWS SageMaker",
    ],
    experience: "Mid-Level",
    type: "Full-time",
    salary: {
      min: 120000,
      max: 180000,
      currency: "USD",
    },
    requirements: [
      "3+ years of machine learning experience",
      "Strong mathematics and statistics background",
      "Experience with deep learning frameworks",
      "Published research papers (preferred)",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: "DevOps Engineer",
    company: companyId,
    location: "Remote",
    description:
      "Looking for a skilled DevOps engineer to improve and maintain our cloud infrastructure.",
    skills: [
      "AWS",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "Terraform",
      "Azure",
      "GCP",
      "Ansible",
      "Python",
    ],
    experience: "Mid-Level",
    type: "Full-time",
    salary: {
      min: 90000,
      max: 140000,
      currency: "USD",
    },
    requirements: [
      "4+ years of DevOps experience",
      "Strong knowledge of AWS services",
      "Experience with CI/CD pipelines",
      "Infrastructure as Code experience",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  // Non-Tech Jobs
  {
    title: "Marketing Manager",
    company: companyId,
    location: "New York, NY",
    description:
      "Lead our marketing efforts and develop comprehensive marketing strategies.",
    skills: [
      "Digital Marketing",
      "Social Media Marketing",
      "Content Strategy",
      "Analytics",
      "SEO",
      "Google Analytics",
      "Adobe Creative Suite",
    ],
    experience: "Senior",
    type: "Full-time",
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    requirements: [
      "5+ years of marketing experience",
      "Proven track record of successful campaigns",
      "Strong analytical and communication skills",
      "Experience managing teams",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Human Resources Director",
    company: companyId,
    location: "Chicago, IL",
    description:
      "Oversee all HR functions including recruitment, training, and employee relations.",
    skills: [
      "HR Management",
      "Recruitment",
      "Employee Relations",
      "Performance Management",
      "HRIS Systems",
      "Benefits Administration",
      "Change Management",
    ],
    experience: "Senior",
    type: "Full-time",
    salary: {
      min: 100000,
      max: 150000,
      currency: "USD",
    },
    requirements: [
      "7+ years of HR experience",
      "Strong knowledge of employment laws",
      "Experience with HRIS systems",
      "Excellent communication skills",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Financial Analyst",
    company: companyId,
    location: "Boston, MA",
    description:
      "Analyze financial data and prepare reports to guide business decisions.",
    skills: [
      "Financial Analysis",
      "Excel",
      "Financial Modeling",
      "Business Intelligence",
      "SQL",
      "Power BI",
      "Bloomberg Terminal",
      "CFA",
    ],
    experience: "Mid-Level",
    type: "Full-time",
    salary: {
      min: 75000,
      max: 110000,
      currency: "USD",
    },
    requirements: [
      "3+ years of financial analysis experience",
      "Strong Excel and modeling skills",
      "Experience with financial reporting",
      "Attention to detail",
    ],
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

async function seedJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Job.deleteMany({});
    await User.deleteMany({ role: "company" });
    console.log("Cleared existing data");

    // Create a company user
    companyId = await createCompany();
    console.log("Created company user");

    // Update jobs with company ID
    const jobsWithCompany = jobs.map((job) => ({
      ...job,
      company: companyId,
    }));

    // Insert new jobs
    const createdJobs = await Job.insertMany(jobsWithCompany);
    console.log(`Created ${createdJobs.length} jobs`);

    console.log("Job seeding completed successfully");
  } catch (error) {
    console.error("Error seeding jobs:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeding
seedJobs();
