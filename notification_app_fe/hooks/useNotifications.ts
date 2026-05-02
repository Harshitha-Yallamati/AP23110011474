import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotificationState } from "@/context/NotificationStateContext";
import { fetchNotification, fetchNotifications, fetchPriorityNotifications } from "@/services/api";
import { log } from "@/services/logger";
import { Notification, NotificationType } from "@/services/types";

export function usePriorityNotifications(limit = 10) {
  const { applyReadState } = useNotificationState();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void log("frontend", "info", "hook", "Loading priority notifications");
    fetchPriorityNotifications(limit)
      .then((data) => {
        if (active) {
          setRawNotifications(data);
          setError(null);
        }
      })
      .catch(() => {
        void log("frontend", "error", "hook", "Priority notifications hook failed");
        if (active) {
          setError("Unable to load priority notifications.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [limit]);

  const notifications = useMemo(() => applyReadState(rawNotifications), [applyReadState, rawNotifications]);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
  return { notifications, loading, error, unreadCount };
}

export function useNotificationList(page: number, limit: number, type?: NotificationType) {
  const { applyReadState } = useNotificationState();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void log("frontend", "info", "hook", "Loading paginated notifications");
    fetchNotifications(page, limit, type)
      .then((result) => {
        if (active) {
          setRawNotifications(result.data);
          setTotal(result.total);
          setError(null);
        }
      })
      .catch(() => {
        void log("frontend", "error", "hook", "Notification list hook failed");
        if (active) {
          setError("Unable to load notifications.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [page, limit, type]);

  const notifications = useMemo(() => applyReadState(rawNotifications), [applyReadState, rawNotifications]);
  return { notifications, total, loading, error };
}

export function useNotificationDetails(id?: string) {
  const { getReadState, setReadState } = useNotificationState();
  const [rawNotification, setRawNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    setLoading(true);
    void log("frontend", "info", "hook", "Loading notification details");
    fetchNotification(id)
      .then((data) => {
        if (active) {
          setRawNotification(data);
          setError(null);
        }
      })
      .catch(() => {
        void log("frontend", "error", "hook", "Notification details hook failed");
        if (active) {
          setError("Unable to load notification details.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  const notification = useMemo(() => {
    if (!rawNotification) {
      return null;
    }

    return {
      ...rawNotification,
      read: getReadState(rawNotification)
    };
  }, [getReadState, rawNotification]);

  const toggleRead = useCallback(() => {
    if (!notification) {
      return;
    }

    setReadState(notification.id, !notification.read);
    void log("frontend", "debug", "state", "Notification read state changed");
  }, [notification, setReadState]);

  return { notification, loading, error, toggleRead };
}
