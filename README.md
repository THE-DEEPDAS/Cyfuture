# 🚀 Job Application & Resume Screening Platform (MERN Stack)

Welcome to the **Job Application & Resume Screening Platform**, a comprehensive, full-stack solution for automating the job application process. This platform helps **companies** manage their hiring processes while providing a smooth and seamless experience for **candidates**. By integrating advanced technologies like **AI-driven resume matching**, **multi-lingual capabilities**, and **Cloudinary for file storage**, this platform revolutionizes the way recruitment works.

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Admin Dashboard](#admin-dashboard)
6. [Candidate Experience](#candidate-experience)
7. [Admin Features](#admin-features)
8. [AI Integration](#ai-integration)
9. [Environment Setup](#environment-setup)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)

---

## 🌟 Introduction

The **Job Application & Resume Screening Platform** is designed for **companies** to manage their hiring process seamlessly and for **candidates** to apply for jobs easily. The platform automates several aspects of recruitment, making it faster and more accurate. Admins can post jobs, review resumes, shortlist candidates, and track the application process, while candidates can upload resumes, fill out necessary forms, and get instant feedback.

By leveraging **AI-driven technologies** like **Gemini 1.5 Flash** (or another suitable **multi-lingual AI model**), the platform matches resumes against job requirements and provides reasoning behind every candidate shortlist.

---

## ✨ Features

### Core Features

1. **📄 Resume Upload and Parsing**  
   - Upload resumes in **PDF** or **DOCX** format.  
   - Automatic parsing to extract essential details like **Name**, **Email**, **Skills**, **Experience**, **Education**, and **Projects**.  
   - Secure file storage in **Cloudinary**.

2. **📋 Job Postings for Companies**  
   - Post multiple job listings with details like **Job Title**, **Description**, **Skills**, **Experience**, and **Location**.  
   - Specify the number of candidates to shortlist.  
   - Store job postings in **MongoDB** for easy management.

3. **🤖 Resume Matching Logic**  
   - Evaluate candidates based on skills, experience, and education using a **threshold-based matching algorithm**.  
   - Use **AI-driven fallback mechanisms** for advanced evaluation and reasoning.

4. **💬 Interactive Candidate Chatbot**  
   - Engage candidates with application questions in multiple languages.  
   - Use AI to process and respond to inquiries.

5. **📊 Admin Dashboard for Candidate Review**  
   - Review resumes, view detailed profiles, and shortlist candidates based on AI-driven scores.  
   - Ensure fairness and transparency with AI reasoning.

6. **📨 In-App Messaging**  
   - Send personalized, **bulk messages** to candidates for interviews, rejections, or notifications.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** for building the user interface  
- **React-FA icons** for UI components  
- **Axios** for API requests  
- **React-Router** for routing  
- **Formik** for form handling and validation

### Backend
- **Node.js** and **Express.js** for server-side logic  
- **MongoDB** for database management  
- **JWT** for user authentication  
- **Multer** for file uploads  
- **Cloudinary** for file storage

### AI/LLM
- **Gemini 1.5 Flash** for resume evaluation and reasoning  
- Multi-lingual capabilities for global reach

---

## 🗂️ Project Structure

```bash
frontend/                    # Frontend (React.js)
backend/                     # Backend (Node.js)
  ├── controllers/           # API Controllers
  ├── models/                # MongoDB Models
  ├── routes/                # API Routes
  ├── middleware/            # Authentication and Authorization
  ├── utils/                 # Helper functions
  ├── config/                # Configuration files
.env                         # Environment variables
```

---

## 🖥️ Admin Dashboard

The Admin Dashboard allows HR representatives (Company admins) to perform the following tasks:

- **Job Post Management**: Create, edit, or delete job postings. Set job requirements like skills, experience, and number of candidates to shortlist.
- **Resume Review**: Review candidate resumes and shortlisting candidates based on matching scores. View AI-driven explanations for shortlisted candidates.
- **In-App Messaging**: Communicate directly with candidates to schedule interviews or notify them of status updates.
- **Job Analytics**: Track the performance of job posts, including the number of applications, shortlisted candidates, and candidate diversity.

---

## 👩‍💻 Candidate Experience

Candidates have a straightforward and intuitive experience:

- Upload their resume (PDF/DOCX) and fill out application-specific questions.
- The AI matches their resume against the job posting’s requirements and provides feedback.
- Candidates are notified of their application status (e.g., Shortlisted, Not Selected).
- Real-time feedback helps candidates improve their chances by adjusting their profiles and resumes for future applications.

---

## 🤝 Contributing

We welcome contributions! If you would like to contribute to this project, please fork the repository, create a new branch, and submit a pull request. Make sure to follow the coding guidelines and include tests for any new features or bug fixes.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
