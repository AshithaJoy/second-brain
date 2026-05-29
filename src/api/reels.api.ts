import { api } from "./axios";

export async function getBreakdowns() {
  const response = await api.get("/reels");
  return response.data;
}

export async function breakdownReel(url: string) {
  const response = await api.post("/reels/breakdown", { url });
  return response.data;
}

export async function deleteBreakdown(id: string) {
  const response = await api.delete(`/reels/${id}`);
  return response.data;
}
