import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many read requests. Please try again after 15 minutes.",
      message: "Rate limit exceeded for read operations",
    });
  },
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many write requests. Please try again after 15 minutes.",
      message: "Rate limit exceeded for write operations",
    });
  },
});
