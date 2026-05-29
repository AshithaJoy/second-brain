import { api } from "./axios";
import {
  mapCollabStatusToBackend,
  mapCollabStatusToFrontend,
  mapPaymentStatusToBackend,
  mapPaymentStatusToFrontend,
} from "../utils/enumMappers";

function mapCollabToFrontend(collab: any) {
  if (!collab) return collab;
  return {
    ...collab,
    status: collab.status ? mapCollabStatusToFrontend(collab.status) : "dream brand",
    paymentStatus: collab.paymentStatus ? mapPaymentStatusToFrontend(collab.paymentStatus) : "unpaid",
  };
}

function mapCollabToBackend(collab: any) {
  if (!collab) return collab;
  const mapped: any = { ...collab };
  if (collab.status) mapped.status = mapCollabStatusToBackend(collab.status);
  if (collab.paymentStatus) mapped.paymentStatus = mapPaymentStatusToBackend(collab.paymentStatus);
  return mapped;
}

export async function getCollabs() {
  const response = await api.get("/collabs");
  return response.data.map(mapCollabToFrontend);
}

export async function createCollab(collab: any) {
  const response = await api.post("/collabs", mapCollabToBackend(collab));
  return mapCollabToFrontend(response.data);
}

export async function updateCollab(id: string, patch: any) {
  const response = await api.put(`/collabs/${id}`, mapCollabToBackend(patch));
  return mapCollabToFrontend(response.data);
}

export async function deleteCollab(id: string) {
  const response = await api.delete(`/collabs/${id}`);
  return response.data;
}

export async function estimateCollab(payload: { collabId: string; brandName: string; profileUrl: string; niche: string }) {
  const response = await api.post("/collabs/estimate", payload);
  return response.data;
}

export async function discoverBrands(niche: string) {
  const response = await api.post("/collabs/discover", { niche });
  return response.data;
}
