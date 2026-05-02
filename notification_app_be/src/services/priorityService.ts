import { Notification } from "../types";

const typeWeights: Record<Notification["type"], number> = {
  Placement: 3000,
  Result: 2000,
  Event: 1000
};

export function getPriorityScore(notification: Notification): number {
  const timestamp = new Date(notification.timestamp).getTime();
  const timeWeight = Number.isFinite(timestamp) ? timestamp / 1_000_000_000 : 0;
  return typeWeights[notification.type] + timeWeight;
}

export function getPriorityNotifications(notifications: Notification[], limit = 10): Notification[] {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, limit);
}
