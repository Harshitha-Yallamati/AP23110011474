import { NextFunction, Request, Response } from "express";
import { getNotificationById, getNotifications, getTopNotifications, setReadState } from "../services/notificationService";
import { NotificationType } from "../types";
import { log } from "../middleware/logger";

const validTypes: NotificationType[] = ["Event", "Result", "Placement"];

function readPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "controller", "List notifications API call started");
    const page = readPositiveInt(req.query.page, 1);
    const limit = readPositiveInt(req.query.limit, 10);
    const notificationType = req.query.notification_type as NotificationType | undefined;
    const type = validTypes.includes(notificationType as NotificationType) ? notificationType : undefined;

    if (notificationType && !type) {
      await log("backend", "warn", "controller", `Ignored invalid notification_type: ${notificationType}`);
    }

    const result = await getNotifications(page, limit, type);
    await log("backend", "debug", "controller", "List notifications API call succeeded");
    res.json(result);
  } catch (error) {
    await log("backend", "error", "controller", `List notifications API failed: ${(error as Error).message}`);
    next(error);
  }
}

export async function priorityNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "controller", "Priority notifications API call started");
    const limit = readPositiveInt(req.query.limit, 10);
    const result = await getTopNotifications(limit);
    await log("backend", "debug", "controller", "Priority notifications API call succeeded");
    res.json(result);
  } catch (error) {
    await log("backend", "error", "controller", `Priority notifications API failed: ${(error as Error).message}`);
    next(error);
  }
}

export async function notificationDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "controller", "Notification details API call started");
    const notification = await getNotificationById(req.params.id);
    if (!notification) {
      await log("backend", "warn", "controller", "Notification details not found");
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    await log("backend", "debug", "controller", "Notification details API call succeeded");
    res.json(notification);
  } catch (error) {
    await log("backend", "error", "controller", `Notification details API failed: ${(error as Error).message}`);
    next(error);
  }
}

export async function updateReadState(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await log("backend", "info", "controller", "Update read state API call started");
    const notification = await setReadState(req.params.id, Boolean(req.body.read));
    if (!notification) {
      await log("backend", "warn", "controller", "Update read state target not found");
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    await log("backend", "debug", "controller", "Update read state API call succeeded");
    res.json(notification);
  } catch (error) {
    await log("backend", "error", "controller", `Update read state API failed: ${(error as Error).message}`);
    next(error);
  }
}
