# Deployment Configuration Guide

## Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- Google AI API key for Gemini 1.5 Flash

## Environment Variables

### Backend Environment Variables (.env)

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
GOOGLE_AI_API_KEY=your_google_ai_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables (.env)

```
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

## Production Build Process

### Backend

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

   For production deployment, it's recommended to use a process manager like PM2:

   ```
   npm install -g pm2
   pm2 start server.js --name cyfuture-backend
   ```

### Frontend

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build for production:

   ```
   npm run build
   ```

4. The build artifacts will be in the `dist` directory, which can be deployed to a static hosting service.

## Deployment Options

### Option 1: Traditional Server (VPS)

1. Set up a VPS with Ubuntu or similar OS
2. Install Node.js and MongoDB
3. Clone the repository
4. Set up environment variables
5. Build and run as described above
6. Use Nginx as a reverse proxy

### Option 2: Docker

1. Create a Dockerfile for both frontend and backend
2. Use Docker Compose to orchestrate the services
3. Deploy to any container service (AWS ECS, Google Cloud Run, etc.)

### Option 3: Platform as a Service (PaaS)

1. Deploy backend to Heroku, Railway, or similar
2. Deploy frontend to Netlify, Vercel, or similar
3. Set up environment variables on each platform

## Monitoring and Maintenance

- Set up application monitoring with services like New Relic, Datadog, or Sentry
- Implement regular database backups
- Set up logging with tools like Winston or Pino
- Configure health check endpoints

## Security Considerations

- Ensure all API endpoints are properly authenticated
- Implement rate limiting to prevent abuse
- Use HTTPS for all communication
- Regularly update dependencies
- Sanitize and validate all user inputs
- Store sensitive data securely (JWT secret, API keys)

## Scaling Considerations

- Implement database indexing for performance
- Consider sharding for horizontal scaling
- Use caching for frequently accessed data
- Implement serverless functions for high-concurrency operations
