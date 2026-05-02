import { NextFunction, Request, Response } from "express";
import { log } from "./logger";
import { authStore } from "../utils/authStore";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!authStore.validate(token)) {
    void log("backend", "warn", "auth", "Unauthorized request blocked");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}
