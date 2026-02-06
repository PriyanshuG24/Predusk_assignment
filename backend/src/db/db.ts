import mongoose, { Document, Model, Query } from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI || 'mongodb://localhost:27017/test');
    logger.info("Connected to MongoDB1");
  } catch (err) {
    logger.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

export async function assertDatabaseConnection() {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    logger.info("Connected to MongoDB2");
  } else {
    await connectDatabase();
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (err) {
    logger.error("Error disconnecting from MongoDB:", err);
    throw err;
  }
}

export { mongoose, Document, Model, Query };
