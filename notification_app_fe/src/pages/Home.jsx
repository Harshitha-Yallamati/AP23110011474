import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import NotificationCard from "../components/NotificationCard.jsx";

const API_URL = "http://localhost:3000/notifications";
const FILTERS = ["All", "Placement", "Result", "Event"];

const fallbackNotifications = [
  {
    Id: "fallback-1",
    Type: "Placement",
    Message: "New placement opportunity available for eligible students.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-2",
    Type: "Result",
    Message: "Semester result update is available for review.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-3",
    Type: "Event",
    Message: "Technical workshop registration is now open.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-4",
    Type: "Placement",
    Message: "Interview schedule has been released by the placement cell.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-5",
    Type: "Result",
    Message: "Revaluation application status has been updated.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-6",
    Type: "Event",
    Message: "Coding club hackathon registrations close tonight.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-7",
    Type: "Placement",
    Message: "Pre-placement talk for shortlisted candidates starts at 3 PM.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-8",
    Type: "Result",
    Message: "Internal assessment marks are available on the portal.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-9",
    Type: "Event",
    Message: "Alumni interaction session is scheduled for this weekend.",
    Timestamp: new Date().toISOString(),
  },
  {
    Id: "fallback-10",
    Type: "Placement",
    Message: "Resume submission deadline for campus hiring is tomorrow.",
    Timestamp: new Date().toISOString(),
  },
];

function Home() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const response = await axios.get(API_URL, { timeout: 6000 });
        const data = Array.isArray(response.data) ? response.data : [];

        if (isMounted) {
          setNotifications(data);
          setIsFallback(false);
        }
      } catch (error) {
        if (isMounted) {
          setNotifications(fallbackNotifications);
          setIsFallback(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.Type === activeFilter
    );
  }, [activeFilter, notifications]);

  const mostRecentId = useMemo(() => {
    if (notifications.length === 0) {
      return null;
    }

    return notifications.reduce((latest, current) => {
      return new Date(current.Timestamp) > new Date(latest.Timestamp)
        ? current
        : latest;
    }).Id;
  }, [notifications]);

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Notification dashboard</p>
          <h1>Campus Notifications</h1>
        </div>
        <span className="count-pill">{notifications.length} total</span>
      </section>

      <section className="toolbar" aria-label="Notification filters">
        {FILTERS.map((filter) => (
          <button
            className={filter === activeFilter ? "filter active" : "filter"}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      {isFallback && (
        <div className="notice" role="status">
          Using fallback data
        </div>
      )}

      {isLoading ? (
        <div className="state-card">Loading...</div>
      ) : filteredNotifications.length > 0 ? (
        <section className="notification-grid">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              isMostRecent={notification.Id === mostRecentId}
              key={notification.Id}
              notification={notification}
            />
          ))}
        </section>
      ) : (
        <div className="state-card">No notifications found.</div>
      )}
    </main>
  );
}

export default Home;
