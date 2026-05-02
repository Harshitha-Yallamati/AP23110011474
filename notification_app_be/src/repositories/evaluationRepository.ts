import axios from "axios";
import { log } from "../middleware/logger";
import { Notification } from "../types";
import { authStore } from "../utils/authStore";
import { config, evaluationUrl } from "../utils/config";

interface NotificationsResponse {
  data?: Notification[];
  notifications?: Notification[];
}

function normalizeNotifications(payload: Notification[] | NotificationsResponse): Notification[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.notifications)) {
    return payload.notifications;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  throw new Error("Notifications API returned an unsupported response shape");
}

export async function fetchEvaluationNotifications(): Promise<Notification[]> {
  await log("backend", "info", "repository", "Evaluation notifications API call started");

  try {
    const response = await axios.get<Notification[] | NotificationsResponse>(evaluationUrl(config.evaluationEndpoints.notifications), {
      headers: {
        Authorization: `Bearer ${authStore.getToken()}`
      },
      timeout: 3500
    });

    await log("backend", "debug", "repository", "Evaluation notifications API call succeeded");
    return normalizeNotifications(response.data);
  } catch (error) {
    await log("backend", "error", "repository", `Evaluation notifications API call failed: ${(error as Error).message}`);
    throw error;
  }
}
