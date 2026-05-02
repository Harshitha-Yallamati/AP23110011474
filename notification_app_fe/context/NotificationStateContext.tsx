import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { log } from "@/services/logger";
import { Notification } from "@/services/types";

type ReadState = Record<string, boolean>;

interface NotificationContextValue {
  applyReadState: (notifications: Notification[]) => Notification[];
  getReadState: (notification: Notification) => boolean;
  setReadState: (id: string, read: boolean) => void;
}

const storageKey = "campus_notifications_read_state";
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function readStoredState(): ReadState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as ReadState) : {};
  } catch {
    void log("frontend", "error", "state", "Failed to read notification state from localStorage");
    return {};
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [readState, setReadStateMap] = useState<ReadState>(() => readStoredState());

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(readState));
      void log("frontend", "debug", "state", "Notification read state persisted");
    } catch {
      void log("frontend", "error", "state", "Failed to persist notification read state");
    }
  }, [readState]);

  const getReadState = useCallback((notification: Notification) => {
    return readState[notification.id] ?? notification.read;
  }, [readState]);

  const applyReadState = useCallback((notifications: Notification[]) => {
    return notifications.map((notification) => ({
      ...notification,
      read: readState[notification.id] ?? notification.read
    }));
  }, [readState]);

  const setReadState = useCallback((id: string, read: boolean) => {
    setReadStateMap((current) => ({
      ...current,
      [id]: read
    }));
    void log("frontend", "info", "state", `Notification ${id} marked as ${read ? "read" : "unread"}`);
  }, []);

  const value = useMemo(
    () => ({
      applyReadState,
      getReadState,
      setReadState
    }),
    [applyReadState, getReadState, setReadState]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationState(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationState must be used within NotificationProvider");
  }

  return context;
}
