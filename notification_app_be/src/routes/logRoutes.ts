import { Router } from "express";
import { createLog } from "../controllers/logController";
import { requireAuth } from "../middleware/authMiddleware";

export const logRoutes = Router();

logRoutes.post("/logs", requireAuth, createLog);
