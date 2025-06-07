import express from "express";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

// Mount routes - ensure this comes after middleware
app.use("/api/analytics", analyticsRoutes);

export default app;
