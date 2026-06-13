import { api } from "./axios";

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function register(creatorName: string, email: string, password: string) {
  const response = await api.post("/auth/register", { email, password, name: creatorName, creatorName });
  return response.data;
}

export async function me() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function googleLogin(idToken: string) {
  const response = await api.post("/auth/google", { idToken });
  return response.data;
}
