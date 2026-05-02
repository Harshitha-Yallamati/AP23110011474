import { randomUUID } from "crypto";
import { config } from "./config";

interface AuthState {
  clientID: string;
  clientSecret: string;
  token: string;
}

let authState: AuthState = {
  clientID: config.clientId,
  clientSecret: config.clientSecret,
  token: randomUUID()
};

export const authStore = {
  register(clientID: string, clientSecret: string): AuthState {
    authState = {
      clientID,
      clientSecret,
      token: randomUUID()
    };
    return authState;
  },
  setCredentials(clientID: string, clientSecret: string): AuthState {
    authState = {
      ...authState,
      clientID,
      clientSecret
    };
    return authState;
  },
  setSession(clientID: string, clientSecret: string, token: string): AuthState {
    authState = {
      clientID,
      clientSecret,
      token
    };
    return authState;
  },
  getCredentials(): Pick<AuthState, "clientID" | "clientSecret"> {
    return {
      clientID: authState.clientID,
      clientSecret: authState.clientSecret
    };
  },
  getToken(): string {
    return authState.token;
  },
  getSession(): AuthState {
    return authState;
  },
  validate(token?: string): boolean {
    return Boolean(token && token === authState.token);
  }
};
