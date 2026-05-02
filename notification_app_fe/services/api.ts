import axios from "axios";
import { ensureToken, getStoredToken } from "./auth";
import { log } from "./logger";
import { Notification, NotificationType, PaginatedNotifications } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000
});

apiClient.interceptors.request.use(async (config) => {
  const token = getStoredToken() ?? (typeof window !== "undefined" ? await ensureToken() : "");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchPriorityNotifications(limit = 10): Promise<Notification[]> {
  await log("frontend", "info", "api", "Priority notifications API call started");
  try {
    const response = await apiClient.get<PaginatedNotifications>("/notifications", {
      params: {
        page: 1,
        limit
      }
    });
    await log("frontend", "debug", "api", "Priority notifications API call succeeded");
    return response.data.data;
  } catch (error) {
    await log("frontend", "error", "api", `Priority notifications API call failed: ${(error as Error).message}`);
    throw error;
  }
}

export async function fetchNotifications(page: number, limit: number, notificationType?: NotificationType): Promise<PaginatedNotifications> {
  await log("frontend", "info", "api", "Notifications API call started");
  try {
    const response = await apiClient.get<PaginatedNotifications>("/notifications", {
      params: {
        page,
        limit,
        notification_type: notificationType || undefined
      }
    });
    await log("frontend", "debug", "api", "Notifications API call succeeded");
    return response.data;
  } catch (error) {
    await log("frontend", "error", "api", `Notifications API call failed: ${(error as Error).message}`);
    throw error;
  }
}

export async function fetchNotification(id: string): Promise<Notification> {
  await log("frontend", "info", "api", "Notification details API call started");
  try {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    await log("frontend", "debug", "api", "Notification details API call succeeded");
    return response.data;
  } catch (error) {
    await log("frontend", "error", "api", `Notification details API call failed: ${(error as Error).message}`);
    throw error;
  }
}

export async function updateReadState(id: string, read: boolean): Promise<Notification> {
  await log("frontend", "info", "api", "Update read state API call started");
  try {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`, { read });
    await log("frontend", "debug", "api", "Update read state API call succeeded");
    return response.data;
  } catch (error) {
    await log("frontend", "error", "api", `Update read state API call failed: ${(error as Error).message}`);
    throw error;
  }
}
