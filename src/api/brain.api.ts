import { api } from "./axios";

export async function getDumps() {
  const response = await api.get("/brain/dumps");
  return response.data;
}

export async function createDump(dump: any) {
  const response = await api.post("/brain/dumps", dump);
  return response.data;
}

export async function updateDump(id: string, patch: any) {
  const response = await api.put(`/brain/dumps/${id}`, patch);
  return response.data;
}

export async function deleteDump(id: string) {
  const response = await api.delete(`/brain/dumps/${id}`);
  return response.data;
}

export async function rewriteDump(dumpId: string) {
  const response = await api.post("/brain/rewrite", { dumpId });
  return response.data;
}

export async function getJobStatus(id: string) {
  const response = await api.get(`/ai/job/${id}`);
  return response.data;
}
