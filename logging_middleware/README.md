# Logging Middleware Reference

This folder keeps centralized reference copies for the shared logging contract:

- `backend_logger.ts`: backend logger implementation used by `notification_app_be`.
- `frontend_logger.ts`: frontend logger implementation used by `notification_app_fe`.

Contract:

```ts
log(stack, level, packageName, message)
```

Allowed values:
- `stack`: `backend` | `frontend`
- `level`: `debug` | `info` | `warn` | `error` | `fatal`
- `packageName`:
  backend -> `controller`, `service`, `repository`, `db`, `cache`, `cron_job`
  frontend -> `component`, `hook`, `api`, `state`, `style`
  common -> `auth`, `config`, `middleware`, `utils`
