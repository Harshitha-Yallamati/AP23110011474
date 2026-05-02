import { NextFunction, Request, Response } from "express";
import { log } from "./logger";
import { HttpError } from "../utils/httpError";

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  void log("backend", "error", "middleware", error.message);
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  res.status(statusCode).json({ message: error.message || "Something went wrong. Please try again." });
}
