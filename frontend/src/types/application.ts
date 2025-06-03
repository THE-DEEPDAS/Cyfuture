export interface Candidate {
  _id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  phone?: string;
  location?: string;
}

export interface Company {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  logo?: string;
}

export interface Job {
  _id: string;
  title: string;
  company: Company;
  description: string;
  location: string;
  status: 'open' | 'closed' | 'draft';
  type: string;
  experience: string;
  salary?: string;
  skills: string[];
  requirements: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    graduationDate: string;
    gpa?: number;
    description?: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
}

export interface MatchScore {
  total: number;
  skills: number;
  experience: number;
  education: number;
}

export interface LLMEvaluation {
  score: number;
  feedback: string;
}

export interface ScreeningResponse {
  question: string;
  response: string;
  llmEvaluation: LLMEvaluation;
}

export interface Application {
  _id: string;
  job: Job;
  candidate: Candidate;
  resume: Resume;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'interviewing';
  overallEvaluation: {
    totalScore: number;
    breakdown: {
      screeningQuestionsScore: number;
      resumeMatchScore: number;
      llmAnalysisScore: number;
    };
  };
  analysisDetails: {
    strengths: string[];
    gaps: string[];
    summary: string;
  };
  screeningResponses: ScreeningResponse[];
  coverLetter?: string;
  matchScore?: MatchScore;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
  stage?: string;
}

export interface Message {
  _id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  applicationId: string;
  jobId: string;
  read: boolean;
  createdAt: Date;
}
