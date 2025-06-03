# Medhavi - Professional Resume Matching Platform

Medhavi is a complete MERN stack application that connects employers with job seekers through AI-powered resume parsing and matching.

## Features

- **Resume Upload and Parsing**: Upload PDF/DOCX resumes to extract key information
- **Intelligent Matching**: Score candidates against job requirements with percentage-based matches
- **Multi-lingual Support**: Communicate with candidates in their preferred language
- **Advanced Admin Dashboard**: Post jobs, review candidates, and track applications
- **Candidate Portal**: Browse job listings, submit applications, and track status
- **Secure JWT Authentication**: Role-based access for candidates and employers

## Technology Stack

- **MongoDB**: For storing all application data
- **Express.js**: Backend API framework
- **React.js**: Frontend UI with a professional dark theme
- **Node.js**: JavaScript runtime environment
- **Tailwind CSS**: For responsive and beautiful UI
- **FontAwesome**: Professional icons throughout the interface
- **Cloudinary**: For resume file storage
- **JWT**: For secure authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/talent-match.git
cd talent-match
```

2. Create a `.env` file in the root directory based on `.env.example`

3. Install dependencies

```
npm run install:all
```

4. Start the development server

```
npm run dev
```

### Project Structure

The project is organized with separate frontend and backend folders:

- `/frontend`: React.js application
- `/backend`: Express.js API

## Development

### Frontend

The frontend is built with React.js and uses Tailwind CSS for styling. The main components include:

- Authentication (login/register)
- User dashboards (candidate and company)
- Resume upload and management
- Job search and application
- Company job posting management
- Candidate review and selection

### Backend

The backend provides a RESTful API with the following main features:

- User authentication and authorization
- Resume upload, parsing, and storage
- Job posting creation and management
- Application processing and matching
- Messaging between candidates and employers

## License

This project is licensed under the MIT License - see the LICENSE file for details.
