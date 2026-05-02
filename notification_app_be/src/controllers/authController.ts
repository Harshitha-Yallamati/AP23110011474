import { Request, Response, NextFunction } from "express";
import { ensureEvaluationAuth, registerEvaluationClient } from "../services/authService";
import { log } from "../middleware/logger";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "controller", "Register API call started");
    const result = await registerEvaluationClient();
    await log("backend", "debug", "controller", "Register API call succeeded");
    res.status(201).json(result);
  } catch (error) {
    await log("backend", "error", "controller", `Register API failed: ${(error as Error).message}`);
    next(error);
  }
}

export async function authSession(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "auth", "Auth session API call started");
    const result = await ensureEvaluationAuth();
    await log("backend", "debug", "auth", "Auth session API call succeeded");
    res.json(result);
  } catch (error) {
    await log("backend", "error", "auth", `Auth session API failed: ${(error as Error).message}`);
    next(error);
  }
}
