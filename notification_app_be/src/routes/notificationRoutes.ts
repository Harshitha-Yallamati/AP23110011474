import { Router } from "express";
import {
  listNotifications,
  notificationDetails,
  priorityNotifications,
  updateReadState
} from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/notifications", listNotifications);
notificationRoutes.get("/notifications/priority", priorityNotifications);
notificationRoutes.get("/notifications/:id", notificationDetails);
notificationRoutes.patch("/notifications/:id/read", updateReadState);
