import { api } from "./axios";

export async function connectInstagram(accessToken: string) {
  const response = await api.post("/instagram/connect", { accessToken });
  return response.data;
}

export async function getInstagramProfile() {
  const response = await api.get("/instagram/profile");
  return response.data;
}

export async function getInstagramMedia() {
  const response = await api.get("/instagram/media");
  return response.data;
}

export async function disconnectInstagram() {
  const response = await api.delete("/instagram/disconnect");
  return response.data;
}

export async function syncInstagram() {
  const response = await api.post("/instagram/sync");
  return response.data;
}

export async function getInstagramIntelligence() {
  const response = await api.get("/instagram/intelligence");
  return response.data;
}

export async function getInstagramOAuthUrl(state: string) {
  const response = await api.get(`/instagram/oauth/start?state=${encodeURIComponent(state)}`);
  return response.data;
}

