import rateLimit from "express-rate-limit";

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many messages sent. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: "Too many chat requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
