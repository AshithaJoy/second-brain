import { api } from "./axios";

export async function getJournalEntries() {
  const response = await api.get("/journal");
  return response.data;
}

export async function createJournalEntry(entry: any) {
  const response = await api.post("/journal", entry);
  return response.data;
}

export async function updateJournalEntry(id: string, patch: any) {
  const response = await api.put(`/journal/${id}`, patch);
  return response.data;
}

export async function deleteJournalEntry(id: string) {
  const response = await api.delete(`/journal/${id}`);
  return response.data;
}
