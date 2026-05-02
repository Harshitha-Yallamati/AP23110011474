const axios = require("axios");
const Log = require("../logging_middleware/logger");

const NOTIFICATIONS_URL =
  "http://20.207.122.201/evaluation-service/notifications";
const TOKEN = process.env.AUTH_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoYXJzaGl0aGF5MjI1QGdtYWlsLmNvbSIsImV4cCI6MTc3NzcwMjg2MywiaWF0IjoxNzc3NzAxOTYzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMjhhMjg4ODktZDU1YS00OTMwLWJhMGQtNjJiNzg5NmI5NmJjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2hpdGhhIHlhbGxhbWF0aSIsInN1YiI6ImJiNDQ4MDc0LTEzMWUtNGZkNi1hOTg4LWMzZjY1ZTUzYzE1NSJ9LCJlbWFpbCI6ImhhcnNoaXRoYXkyMjVAZ21haWwuY29tIiwibmFtZSI6ImhhcnNoaXRoYSB5YWxsYW1hdGkiLCJyb2xsTm8iOiJhcDIzMTEwMDExNDc0aCIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImJiNDQ4MDc0LTEzMWUtNGZkNi1hOTg4LWMzZjY1ZTUzYzE1NSIsImNsaWVudFNlY3JldCI6InJQVUFXUkt2WE55VEFLQ3YifQ.TxjyXbc1JNFRsCeVCQodlrykQU5X7Tf78YSDp20eLTc";

const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getPriorityWeight(type) {
  return PRIORITY_WEIGHTS[type] || 0;
}

function sortNotifications(notifications) {
  return [...notifications].sort((first, second) => {
    const priorityDifference =
      getPriorityWeight(second.Type) - getPriorityWeight(first.Type);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(second.Timestamp) - new Date(first.Timestamp);
  });
}

async function fetchNotifications() {
  await Log(
    "backend",
    "info",
    "service",
    "Fetching notifications from evaluation service"
  );

  const response = await axios.get(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.data;
}

async function main() {
  try {
    const notifications = await fetchNotifications();

    if (!Array.isArray(notifications)) {
      throw new Error("Invalid notifications response: expected an array");
    }

    const sortedNotifications = sortNotifications(notifications);
    await Log(
      "backend",
      "info",
      "service",
      "Notifications sorted by priority and timestamp"
    );

    const topNotifications = sortedNotifications.slice(0, 10);

    console.log("Top 10 Notifications:");
    console.table(topNotifications);
  } catch (error) {
    const errorMessage = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    await Log("backend", "error", "service", `Error: ${errorMessage}`);
    console.error("Failed to process notifications:", errorMessage);
  }
}

main();

module.exports = {
  getPriorityWeight,
  sortNotifications,
  fetchNotifications,
};
