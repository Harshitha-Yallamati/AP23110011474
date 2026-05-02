import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const tokenKey = "campus_notifications_token";
const clientIdKey = "campus_notifications_client_id";
const clientSecretKey = "campus_notifications_client_secret";

interface AuthSession {
  clientID: string;
  clientSecret: string;
  token: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(tokenKey);
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(tokenKey);
  const clientID = window.localStorage.getItem(clientIdKey);
  const clientSecret = window.localStorage.getItem(clientSecretKey);

  return token && clientID && clientSecret ? { clientID, clientSecret, token } : null;
}

export async function ensureToken(): Promise<string> {
  const existingToken = getStoredToken();
  if (existingToken) {
    return existingToken;
  }

  const response = await axios.post(`${apiBaseUrl}/auth`);

  const token = response.data.access_token as string;
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(clientIdKey, response.data.clientID ?? "");
  window.localStorage.setItem(clientSecretKey, response.data.clientSecret ?? "");
  return token;
}
