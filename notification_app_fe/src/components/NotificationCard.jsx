import React from "react";

const badgeClasses = {
  Placement: "badge placement",
  Result: "badge result",
  Event: "badge event",
};

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function NotificationCard({ notification, isMostRecent }) {
  const badgeClass = badgeClasses[notification.Type] || "badge";

  return (
    <article className={isMostRecent ? "card recent" : "card"}>
      <div className="card-topline">
        <span className={badgeClass}>{notification.Type}</span>
        {isMostRecent && <span className="recent-label">Most recent</span>}
      </div>

      <p className="message">{notification.Message}</p>

      <time className="timestamp" dateTime={notification.Timestamp}>
        {formatTimestamp(notification.Timestamp)}
      </time>
    </article>
  );
}

export default NotificationCard;
