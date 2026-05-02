# Notification System Design

## Overview

This project is a small Node.js notification processing service. It retrieves notifications from the AffordMed evaluation service, sorts them by business priority and recency, logs important processing events through a reusable logging middleware, and prints the top 10 notifications to the console.

The implementation is split into two main modules:

- `notification_app_be/app.js`: notification fetching, validation, sorting, and console output.
- `logging_middleware/logger.js`: reusable log sender that posts application logs to the evaluation logging endpoint.

## Goals

- Fetch notifications from the remote evaluation API.
- Authenticate requests with a bearer token.
- Rank notifications by type priority.
- Break priority ties using the latest timestamp first.
- Display the top 10 highest ranked notifications.
- Send informational and error logs to the external logging API.
- Keep logging reusable so other backend modules can call the same middleware.

## Non-Goals

- This version does not expose an HTTP server or frontend UI.
- This version does not persist notifications in a database.
- This version does not schedule repeated polling.
- This version does not implement retries, caching, pagination, or queueing.

## High-Level Architecture

```text
+--------------------------+
| notification_app_be      |
| app.js                   |
+------------+-------------+
             |
             | GET /evaluation-service/notifications
             v
+--------------------------+
| Evaluation Notification  |
| Service                  |
+--------------------------+

+--------------------------+
| notification_app_be      |
| app.js                   |
+------------+-------------+
             |
             | Log(stack, level, package, message)
             v
+--------------------------+
| logging_middleware       |
| logger.js                |
+------------+-------------+
             |
             | POST /evaluation-service/logs
             v
+--------------------------+
| Evaluation Logging       |
| Service                  |
+--------------------------+
```

## Components

### Notification Application

File: `notification_app_be/app.js`

Responsibilities:

- Stores the notification endpoint URL.
- Reads `AUTH_TOKEN` from the environment, with a fallback token currently present in code.
- Fetches notifications using `axios.get`.
- Validates that the API response is an array.
- Sorts notifications using `sortNotifications`.
- Selects the top 10 notifications.
- Prints output using `console.table`.
- Logs normal processing and error events using the logging middleware.

Important exported functions:

- `getPriorityWeight(type)`: returns the configured numeric weight for a notification type.
- `sortNotifications(notifications)`: returns a sorted copy of the input notifications.
- `fetchNotifications()`: fetches raw notifications from the remote API.

### Logging Middleware

File: `logging_middleware/logger.js`

Responsibilities:

- Stores the logging endpoint URL.
- Reads `AUTH_TOKEN` from the environment, with a fallback token currently present in code.
- Sends structured logs with `stack`, `level`, `package`, and `message`.
- Handles logging failures without crashing the main notification flow.
- Returns the remote logging API response when successful, or `null` when logging fails.

## Data Flow

1. The application starts by running `main()` in `app.js`.
2. `fetchNotifications()` logs that notification fetching is starting.
3. `fetchNotifications()` sends an authenticated GET request to the notification endpoint.
4. The response is returned to `main()`.
5. `main()` checks whether the response body is an array.
6. `sortNotifications()` sorts the notifications by priority and timestamp.
7. The application logs that sorting completed.
8. The first 10 sorted notifications are displayed in the terminal.
9. If any step fails, the error is logged and printed to the terminal.

## Sorting Rules

Notifications are sorted by two rules:

1. Higher type priority appears first.
2. If two notifications have the same priority, the newer `Timestamp` appears first.

Current priority weights:

| Type | Weight | Meaning |
| --- | ---: | --- |
| `Placement` | 3 | Highest priority |
| `Result` | 2 | Medium priority |
| `Event` | 1 | Lowest known priority |
| Unknown type | 0 | Falls below known types |

The sorting function does not mutate the original notification array. It creates a shallow copy first:

```js
return [...notifications].sort(...)
```

## API Contracts

### Notification API

Request:

```http
GET http://20.207.122.201/evaluation-service/notifications
Authorization: Bearer <token>
```

Expected response:

```json
[
  {
    "Type": "Placement",
    "Timestamp": "2026-05-02T10:30:00.000Z"
  }
]
```

The application expects the top-level response body to be an array. Each notification should include at least:

- `Type`: used for priority ranking.
- `Timestamp`: used for recency ranking within the same type.

### Logging API

Request:

```http
POST http://20.207.122.201/evaluation-service/logs
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "stack": "backend",
  "level": "info",
  "package": "service",
  "message": "Fetching notifications from evaluation service"
}
```

## Error Handling

The notification application wraps the main flow in a `try/catch` block.

Handled failures include:

- Network errors while fetching notifications.
- Authorization failures from the remote service.
- Unexpected response shape when notifications are not returned as an array.
- Logging API failures.

When notification processing fails:

- The error is converted into a readable message.
- The error is sent to the logging API with level `error`.
- The error is printed with `console.error`.

When logging itself fails:

- The logging middleware prints `Logging failed`.
- It returns `null`.
- It does not throw, so logging failures do not hide the original application behavior.

## Configuration

The project uses the `AUTH_TOKEN` environment variable for authentication:

```powershell
$env:AUTH_TOKEN = "your-token-here"
node notification_app_be/app.js
```

If `AUTH_TOKEN` is not set, both modules currently fall back to a hard-coded token. For a production or shared repository, the safer design is to remove hard-coded credentials and require tokens through environment variables or a secret manager.

## Security Considerations

- Bearer tokens should not be committed to source control.
- `.env` files are ignored by Git and can be used for local configuration.
- The current fallback token should be rotated if it has been committed publicly.
- Logs should avoid sensitive personal data, credentials, and full remote error payloads when possible.
- HTTPS should be preferred for production API endpoints. The current endpoints use HTTP.

## Scalability Considerations

The current implementation is suitable for a small evaluation script. If the system grows, the following improvements would help:

- Add pagination support if the notification API returns large datasets.
- Add retry with exponential backoff for transient network errors.
- Add request timeouts to avoid hanging indefinitely.
- Add scheduled polling through a cron job or worker process.
- Add persistence for historical notifications.
- Add metrics for request latency, success count, failure count, and sort count.
- Add a queue if notification processing becomes asynchronous or multi-step.

## Testing Strategy

Recommended unit tests:

- `getPriorityWeight` returns correct weights for known and unknown types.
- `sortNotifications` orders types as `Placement`, `Result`, `Event`, then unknown.
- `sortNotifications` orders newer timestamps first for equal priority.
- `sortNotifications` does not mutate the input array.
- `fetchNotifications` sends the authorization header.
- `Log` sends the expected request body and headers.
- `Log` returns `null` when the logging request fails.

Recommended integration checks:

- Run the application with a valid `AUTH_TOKEN`.
- Confirm the top 10 notifications print in the expected order.
- Confirm informational and error logs reach the logging endpoint.

## Run Instructions

Install dependencies:

```powershell
npm install
```

Run the notification processor:

```powershell
$env:AUTH_TOKEN = "your-token-here"
node notification_app_be/app.js
```

Expected terminal output:

```text
Top 10 Notifications:
<table of sorted notifications>
```

## Future Enhancements

- Move endpoint URLs into environment variables.
- Remove hard-coded tokens from source files.
- Add a real `npm start` script.
- Add Jest or Node test runner tests for sorting and logging behavior.
- Add schema validation for remote notification objects.
- Add timeout and retry policies for Axios requests.
- Add structured output options such as JSON or CSV.
