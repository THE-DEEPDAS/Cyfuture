import mongoose from "mongoose";
import dotenv from "dotenv";
import { jest, beforeAll, afterAll } from "@jest/globals";

dotenv.config();

// Create an in-memory MongoDB instance for testing
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/test";
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
});

// Clean up and close the connection after tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log("Closed MongoDB connection");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
});
