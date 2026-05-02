# Campus Notifications Microservice

Production-grade campus notification inbox with a TypeScript Express backend, a React TypeScript frontend, Material UI, Axios, custom logging, bearer-token auth, priority sorting, and no silent fake-data fallback by default.

## Stack

- Backend: Node.js, Express, TypeScript
- Frontend: React, TypeScript, Vite, Material UI
- API client: Axios
- Logging: custom `log(stack, level, package, message)` function only

## Folder Structure

```text
logging_middleware/
  backend_logger.ts
  frontend_logger.ts
  README.md
notification_system_design.md
notification_app_be/
  src/
    controllers/
    middleware/
      logger.ts
    repositories/
    routes/
    services/
    utils/
  .env
  .env.example
notification_app_fe/
  components/
  context/
  hooks/
  pages/
  services/
  styles/
  .env
  .env.example
```

## Environment

Backend `.env`:

```env
PORT=4000
EVALUATION_SERVICE_URL=http://20.207.122.201
EVALUATION_REGISTER_PATH=/evaluation-service/register
EVALUATION_AUTH_PATH=/evaluation-service/auth
EVALUATION_NOTIFICATIONS_PATH=/evaluation-service/notifications
EVALUATION_LOGS_PATH=/evaluation-service/logs
ENABLE_MOCK_FALLBACK=false
REGISTRATION_EMAIL=your_email@example.com
REGISTRATION_NAME=Your Name
REGISTRATION_MOBILE_NO=9999999999
REGISTRATION_GITHUB_USERNAME=your-github-username
REGISTRATION_ROLL_NO=YOUR_ROLL_NO
REGISTRATION_ACCESS_CODE=YOUR_ACCESS_CODE
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Setup

```bash
cd notification_app_be
npm install
npm run dev
```

```bash
cd notification_app_fe
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.
Frontend runs at `http://localhost:3000`.

## API

- `POST /register`
- `POST /auth`
- `POST /logs`
- `GET /notifications`
- `GET /notifications?limit=10&page=1&notification_type=Placement`
- `GET /notifications/priority?limit=10`
- `GET /notifications/:id`
- `PATCH /notifications/:id/read`

The backend uses `http://20.207.122.201` as the base URL and calls the explicit evaluation-service endpoint paths for register/auth/logs/notifications. The frontend asks the local backend `POST /auth` endpoint for the current bearer token and stores it in local storage.

## Logging

The reusable logger lives in `notification_app_be/src/middleware/logger.ts` and `notification_app_fe/services/logger.ts`. Reference copies are also available in `logging_middleware/`.

```ts
log(stack, level, packageName, message)
```

Allowed values:

- `stack`: `backend`, `frontend`
- `level`: `debug`, `info`, `warn`, `error`, `fatal`
- backend packages: `controller`, `service`, `repository`, `db`, `cache`, `cron_job`
- frontend packages: `component`, `hook`, `api`, `state`, `style`
- common packages: `auth`, `config`, `middleware`, `utils`

Every API call logs start as `info`, success as `debug`, failure as `error`, and startup registration failure as `fatal`. No external logging libraries or `console.log` calls are used.

Mock notification fallback is disabled by default with `ENABLE_MOCK_FALLBACK=false`, so the app will not silently show sample notifications when the evaluation service is unavailable.

## Priority Logic

Notifications are sorted by:

1. Type weight: `Placement > Result > Event`
2. Recency: newer notifications rank higher

```ts
priorityScore = typeWeight + timeWeight
```

The default `GET /notifications` limit is `10`, so the dashboard can show top-priority notifications immediately. The all-notifications page uses `limit`, `page`, and `notification_type`.

## Frontend Features

- Dashboard with top N priority notifications
- All Notifications page with pagination and type filtering
- Notification Details page
- Local read/unread state through React context
- Unread highlighting
- Skeleton loaders
- Error states
- Reusable memoized notification cards

## Postman

Import these two files into Postman:

- `postman/Campus Notifications.postman_collection.json`
- `postman/Campus Notifications.postman_environment.json`

Run the requests in this order:

1. `Register` saves `clientID` and `clientSecret`.
2. `Auth` saves `access_token`.
3. `Notifications` and `Logs` use `Authorization: Bearer {{access_token}}`.

The Postman environment keeps `baseUrl` as `http://20.207.122.201`. Requests include `/evaluation-service/...` in each endpoint path.
