export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage =
  | "controller"
  | "service"
  | "repository"
  | "db"
  | "cache"
  | "cron_job"
  | "component"
  | "hook"
  | "api"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export type NotificationType = "Event" | "Result" | "Placement";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}
