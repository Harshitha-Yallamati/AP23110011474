import { NextFunction, Request, Response } from "express";
import { log } from "../middleware/logger";
import { Level, LogPackage, Stack } from "../types";
import { HttpError } from "../utils/httpError";

const stacks: Stack[] = ["backend", "frontend"];
const levels: Level[] = ["debug", "info", "warn", "error", "fatal"];
const packages: LogPackage[] = [
  "controller",
  "service",
  "repository",
  "db",
  "cache",
  "cron_job",
  "component",
  "hook",
  "api",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils"
];

export async function createLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stack = req.body.stack as Stack;
    const level = req.body.level as Level;
    const packageName = req.body.package as LogPackage;
    const message = req.body.message as string;

    if (!stacks.includes(stack) || !levels.includes(level) || !packages.includes(packageName) || !message) {
      throw new HttpError("Invalid log payload", 400);
    }

    await log(stack, level, packageName, message);
    res.status(202).json({ accepted: true });
  } catch (error) {
    next(error);
  }
}
