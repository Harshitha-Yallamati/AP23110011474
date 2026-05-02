import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotificationDetailsPage from "@/pages/NotificationDetailsPage";
import { log } from "@/services/logger";

export default function App() {
  useEffect(() => {
    void log("frontend", "info", "component", "Campus notifications app mounted");
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
