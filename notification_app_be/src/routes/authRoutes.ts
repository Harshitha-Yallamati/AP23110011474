import { Router } from "express";
import { authSession, register } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/evaluation-service/register", register);
authRoutes.post("/register", register);
authRoutes.post("/auth", authSession);
