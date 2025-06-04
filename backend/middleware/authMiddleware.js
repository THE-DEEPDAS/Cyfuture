import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Middleware to check if user is a company or admin
const companyOnly = (req, res, next) => {
  if (req.user && (req.user.role === "company" || req.user.isAdmin)) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a company or admin");
  }
};

// For backward compatibility
const company = companyOnly;

// Middleware to check if user is a candidate
const candidate = (req, res, next) => {
  if (req.user && req.user.role === "candidate") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a candidate");
  }
};

// For backward compatibility
const admin = company;

export { protect, companyOnly, company, admin, candidate };
