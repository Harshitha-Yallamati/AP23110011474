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

function getFallbackNotifications() {
  const currentTimestamp = new Date().toISOString();

  return [
    {
      Id: "fallback-1",
      Type: "Placement",
      Message: "New placement opportunity available for eligible students.",
      Timestamp: currentTimestamp,
    },
    {
      Id: "fallback-2",
      Type: "Result",
      Message: "Semester result update is available for review.",
      Timestamp: currentTimestamp,
    },
    {
      Id: "fallback-3",
      Type: "Event",
      Message: "Technical workshop registration is now open.",
      Timestamp: currentTimestamp,
    },
    {
      Id: "fallback-4",
      Type: "Placement",
      Message: "Interview schedule has been released by the placement cell.",
      Timestamp: currentTimestamp,
    },
    {
      Id: "fallback-5",
      Type: "Event",
      Message: "Campus seminar starts today in the main auditorium.",
      Timestamp: currentTimestamp,
    },
  ];
}

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

  try {
    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      timeout: 5000,
    });

    await Log(
      "backend",
      "info",
      "service",
      "Notifications fetched successfully from evaluation service"
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    await Log(
      "backend",
      "error",
      "service",
      `Notification API failed. Using fallback data. Error: ${errorMessage}`
    );

    console.log("Using fallback data due to API failure");
    return getFallbackNotifications();
  }
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
  getFallbackNotifications,
  getPriorityWeight,
  sortNotifications,
  fetchNotifications,
};
