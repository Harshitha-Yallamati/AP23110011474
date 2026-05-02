import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { config, evaluationUrl } from "../utils/config";
import { authStore } from "../utils/authStore";
import { Level, LogPackage, Stack } from "../types";

export async function log(stack: Stack, level: Level, packageName: LogPackage, message: string): Promise<void> {
  try {
    await axios.post(
      evaluationUrl(config.evaluationEndpoints.logs),
      {
        stack,
        level,
        package: packageName,
        message,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken()}`
        },
        timeout: 2500
      }
    );
  } catch {
    // Logging must never break the request path.
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (req.path === "/logs") {
    next();
    return;
  }

  void log("backend", "info", "middleware", `${req.method} ${req.path} started`);
  res.on("finish", () => {
    const level: Level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "debug";
    void log("backend", level, "middleware", `${req.method} ${req.path} completed with ${res.statusCode}`);
  });
  next();
}
