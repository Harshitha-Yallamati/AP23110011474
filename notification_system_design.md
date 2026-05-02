# Notification System Design

## Objective
Build a campus notification system that securely consumes evaluation APIs, prioritizes notifications, and serves a React UI for dashboard, list, and details workflows.

## Components
- `notification_app_be`: Express + TypeScript backend.
- `notification_app_fe`: React + TypeScript frontend.
- `logging_middleware`: shared reference copies of backend/frontend logger implementations.
- `postman`: API collection and environment for register/auth/notifications/logs.

## Backend Design
- Auth flow:
  `POST /register` and `POST /auth` are used against the evaluation service.
  The backend stores `clientID`, `clientSecret`, and `Bearer` token in memory.
- Logging flow:
  Every important event calls `log(stack, level, package, message)`.
  Logs are forwarded to evaluation `/logs` with bearer auth.
- Notifications flow:
  `GET /notifications` supports `limit`, `page`, `notification_type`.
  Priority sorting applies `Placement > Result > Event` and then recency.
- Read state:
  Read/unread toggles are maintained in memory for current service runtime.

## Frontend Design
- Pages:
  Dashboard, All Notifications, Notification Details.
- State:
  Local read/unread state is kept in React context and persisted in `localStorage`.
- API:
  Axios client with bearer token injection from local backend `/auth`.
- Error behavior:
  API failures surface in UI with alerts and loading skeletons.

## Priority Algorithm
`priorityScore = typeWeight + timeWeight`

- Type weights:
  `Placement = 3000`, `Result = 2000`, `Event = 1000`
- Time weight:
  normalized timestamp contribution for newer-first ordering.

## Reliability Notes
- Mock notification fallback is disabled by default (`ENABLE_MOCK_FALLBACK=false`) to avoid fake data presentation.
- If evaluation service rejects registration/auth, backend returns real failure status instead of synthetic tokens.
