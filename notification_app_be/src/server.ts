import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./utils/config";
import { authRoutes } from "./routes/authRoutes";
import { logRoutes } from "./routes/logRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger, log } from "./middleware/logger";
import { bootstrapClientRegistration } from "./services/authService";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRoutes);
app.use(logRoutes);
app.use(notificationRoutes);
app.use(errorHandler);

app.listen(config.port, () => {
  void log("backend", "info", "config", `Backend listening on port ${config.port}`);
  void bootstrapClientRegistration();
});
