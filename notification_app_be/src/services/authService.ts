import axios from "axios";
import { authStore } from "../utils/authStore";
import { config, evaluationUrl, RegistrationDetails } from "../utils/config";
import { log } from "../middleware/logger";
import { HttpError } from "../utils/httpError";

interface AuthSessionResponse {
  clientID: string;
  clientSecret: string;
  access_token: string;
  token_type: "Bearer";
}

let evaluationAuthReady = false;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as { message?: string } | undefined)?.message;
    return responseMessage ?? error.message;
  }

  return error instanceof Error ? error.message : "Unknown error";
}

interface RegisterResponse extends Partial<RegistrationDetails> {
  clientID?: string;
  clientId?: string;
  clientSecret?: string;
  data?: {
    clientID?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  token_type?: "Bearer";
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    token_type?: "Bearer";
  };
}

function hasRegistrationDetails(details: RegistrationDetails): boolean {
  return Object.values(details).every(Boolean);
}

function extractClientCredentials(response: RegisterResponse): Pick<AuthSessionResponse, "clientID" | "clientSecret"> {
  const clientID = response.clientID ?? response.clientId ?? response.data?.clientID ?? response.data?.clientId ?? config.clientId;
  const clientSecret = response.clientSecret ?? response.data?.clientSecret ?? config.clientSecret;

  if (!clientID || !clientSecret) {
    throw new HttpError("Register API did not return clientID and clientSecret", 502);
  }

  return { clientID, clientSecret };
}

function extractAccessToken(response: AuthResponse): string {
  const token = response.access_token ?? response.accessToken ?? response.token ?? response.data?.access_token ?? response.data?.accessToken ?? response.data?.token;

  if (!token) {
    throw new Error("Auth API did not return an access token");
  }

  return token;
}

async function registerWithEvaluationService(): Promise<Pick<AuthSessionResponse, "clientID" | "clientSecret">> {
  if (!hasRegistrationDetails(config.registration)) {
    throw new HttpError("Registration details are incomplete. Check backend .env.", 400);
  }

  await log("backend", "info", "auth", "Evaluation register API call started");

  const response = await axios.post<RegisterResponse>(evaluationUrl(config.evaluationEndpoints.register), config.registration, {
    timeout: 5000
  });
  const credentials = extractClientCredentials(response.data);
  authStore.setCredentials(credentials.clientID, credentials.clientSecret);
  await log("backend", "debug", "auth", "Evaluation register API call succeeded");
  return credentials;
}

export async function registerEvaluationClient(): Promise<Pick<AuthSessionResponse, "clientID" | "clientSecret">> {
  try {
    return await registerWithEvaluationService();
  } catch (error) {
    const message = getErrorMessage(error);
    await log("backend", "error", "auth", `Evaluation register API failed: ${message}`);
    throw new HttpError(message, axios.isAxiosError(error) ? error.response?.status ?? 502 : 502);
  }
}

async function authenticateWithEvaluationService(
  credentials: Pick<AuthSessionResponse, "clientID" | "clientSecret">
): Promise<AuthSessionResponse> {
  await log("backend", "info", "auth", "Evaluation auth API call started");

  const response = await axios.post<AuthResponse>(
    evaluationUrl(config.evaluationEndpoints.auth),
    {
      ...config.registration,
      clientID: credentials.clientID,
      clientSecret: credentials.clientSecret
    },
    {
      timeout: 5000
    }
  );
  const token = extractAccessToken(response.data);
  const session = authStore.setSession(credentials.clientID, credentials.clientSecret, token);
  evaluationAuthReady = true;
  await log("backend", "debug", "auth", "Evaluation auth API call succeeded");

  return {
    clientID: session.clientID,
    clientSecret: session.clientSecret,
    access_token: session.token,
    token_type: "Bearer"
  };
}

export async function ensureEvaluationAuth(force = false): Promise<AuthSessionResponse> {
  const existing = authStore.getSession();

  if (!force && evaluationAuthReady && existing.token) {
    return {
      clientID: existing.clientID,
      clientSecret: existing.clientSecret,
      access_token: existing.token,
      token_type: "Bearer"
    };
  }

  try {
    const credentials = await registerWithEvaluationService();
    return await authenticateWithEvaluationService(credentials);
  } catch (error) {
    const message = getErrorMessage(error);
    await log("backend", "fatal", "auth", `Evaluation auth flow failed: ${message}`);
    throw new HttpError(message, axios.isAxiosError(error) ? error.response?.status ?? 502 : 502);
  }
}

export async function bootstrapClientRegistration(): Promise<void> {
  await log("backend", "info", "auth", "Backend evaluation-service registration started");

  try {
    await ensureEvaluationAuth(true);
    await log("backend", "debug", "auth", "Backend evaluation-service auth bootstrap succeeded");
  } catch (error) {
    await log("backend", "fatal", "auth", `Backend auth bootstrap failed: ${(error as Error).message}`);
  }
}
