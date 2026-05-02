import dotenv from "dotenv";

dotenv.config();

export interface RegistrationDetails {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientId: process.env.CLIENT_ID ?? "",
  clientSecret: process.env.CLIENT_SECRET ?? "",
  evaluationServiceUrl: process.env.EVALUATION_SERVICE_URL ?? "http://20.207.122.201",
  enableMockFallback: process.env.ENABLE_MOCK_FALLBACK === "true",
  evaluationEndpoints: {
    register: process.env.EVALUATION_REGISTER_PATH ?? "/register",
    auth: process.env.EVALUATION_AUTH_PATH ?? "/auth",
    notifications: process.env.EVALUATION_NOTIFICATIONS_PATH ?? "/notifications",
    logs: process.env.EVALUATION_LOGS_PATH ?? "/logs"
  },
  registration: {
    email: process.env.REGISTRATION_EMAIL ?? "",
    name: process.env.REGISTRATION_NAME ?? "",
    mobileNo: process.env.REGISTRATION_MOBILE_NO ?? "",
    githubUsername: process.env.REGISTRATION_GITHUB_USERNAME ?? "",
    rollNo: process.env.REGISTRATION_ROLL_NO ?? "",
    accessCode: process.env.REGISTRATION_ACCESS_CODE ?? ""
  } satisfies RegistrationDetails
};

export function evaluationUrl(path: string): string {
  const baseUrl = config.evaluationServiceUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
