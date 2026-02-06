import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../lib/error.js";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new NotFoundError("Route not found"));
}
