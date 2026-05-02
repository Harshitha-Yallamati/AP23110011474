import axios from "axios";
import { Level, LogPackage, Stack } from "./types";
import { ensureToken, getStoredToken } from "./auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function log(stack: Stack, level: Level, packageName: LogPackage, message: string): Promise<void> {
  try {
    const token = getStoredToken() ?? (await ensureToken());
    await axios.post(
      `${apiBaseUrl}/logs`,
      {
        stack,
        level,
        package: packageName,
        message,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 2500
      }
    );
  } catch {
    // Logging failures are intentionally swallowed to protect UX.
  }
}
