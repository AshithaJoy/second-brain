import { api } from "./axios";

export async function getProfile() {
  const response = await api.get("/profile");
  return response.data;
}

export async function saveProfile(data: any) {
  const response = await api.post("/profile", data);
  return response.data;
}

export async function updateProfile(data: any) {
  const response = await api.put("/profile", data);
  return response.data;
}

export async function getProfileCompletionStatus() {
  const response = await api.get("/profile/completion-status");
  return response.data;
}
