import { Notification, NotificationType, PaginatedNotifications } from "../types";
import { mockNotifications } from "../utils/mockNotifications";
import { log } from "../middleware/logger";
import { getPriorityNotifications } from "./priorityService";
import { fetchEvaluationNotifications } from "../repositories/evaluationRepository";
import { config } from "../utils/config";
import { HttpError } from "../utils/httpError";

const localReadState = new Map<string, boolean>();

function applyReadState(notifications: Notification[]): Notification[] {
  return notifications.map((notification) => ({
    ...notification,
    read: localReadState.get(notification.id) ?? notification.read ?? false
  }));
}

function paginate(notifications: Notification[], page: number, limit: number): PaginatedNotifications {
  const start = (page - 1) * limit;
  return {
    data: notifications.slice(start, start + limit),
    total: notifications.length,
    page,
    limit
  };
}

async function loadNotifications(): Promise<Notification[]> {
  await log("backend", "info", "service", "Notification source load started");

  try {
    const source = await fetchEvaluationNotifications();
    await log("backend", "debug", "service", "Notification source load succeeded");
    return source;
  } catch (error) {
    await log("backend", "error", "service", `Notification source load failed: ${(error as Error).message}`);

    if (!config.enableMockFallback) {
      throw new HttpError("Unable to load real notifications from the evaluation service.", 502);
    }

    await log("backend", "warn", "service", "Using explicitly enabled mock notification fallback");

    if (mockNotifications.length === 0) {
      await log("backend", "fatal", "service", "Mock notification fallback is empty");
    }

    return mockNotifications;
  }
}

export async function getNotifications(page = 1, limit = 10, notificationType?: NotificationType): Promise<PaginatedNotifications> {
  const source = await loadNotifications();
  const filtered = applyReadState(source).filter((item) => !notificationType || item.type === notificationType);
  const prioritized = getPriorityNotifications(filtered, filtered.length);
  return paginate(prioritized, page, limit);
}

export async function getTopNotifications(limit = 10): Promise<Notification[]> {
  const notifications = applyReadState(await loadNotifications());
  return getPriorityNotifications(notifications, limit);
}

export async function getNotificationById(id: string): Promise<Notification | undefined> {
  const notifications = applyReadState(await loadNotifications());
  return notifications.find((notification) => notification.id === id);
}

export async function setReadState(id: string, read: boolean): Promise<Notification | undefined> {
  localReadState.set(id, read);
  await log("backend", "info", "service", `Notification ${id} read state updated`);
  return getNotificationById(id);
}
