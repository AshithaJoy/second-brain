import { api } from "./axios";

export async function getBRolls() {
  const response = await api.get("/broll");
  return response.data;
}

export async function createBRoll(broll: any) {
  const response = await api.post("/broll", broll);
  return response.data;
}

export async function updateBRoll(id: string, patch: any) {
  const response = await api.put(`/broll/${id}`, patch);
  return response.data;
}

export async function deleteBRoll(id: string) {
  const response = await api.delete(`/broll/${id}`);
  return response.data;
}
