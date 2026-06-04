import { api } from "./axios";
import {
  mapPostTypeToBackend,
  mapPostTypeToFrontend,
  mapPostStatusToBackend,
  mapPostStatusToFrontend,
} from "../utils/enumMappers";

function mapPostToFrontend(post: any) {
  if (!post) return post;
  return {
    ...post,
    type: post.type ? mapPostTypeToFrontend(post.type) : "reel",
    status: post.status ? mapPostStatusToFrontend(post.status) : "draft",
  };
}

function mapPostToBackend(post: any) {
  if (!post) return post;
  const mapped: any = { ...post };
  if (post.type) mapped.type = mapPostTypeToBackend(post.type);
  if (post.status) mapped.status = mapPostStatusToBackend(post.status);
  return mapped;
}

export async function getPosts() {
  const response = await api.get("/planner/posts");
  return response.data.map(mapPostToFrontend);
}

export async function createPost(post: any) {
  const response = await api.post("/planner/posts", mapPostToBackend(post));
  return mapPostToFrontend(response.data);
}

export async function updatePost(id: string, patch: any) {
  const response = await api.put(`/planner/posts/${id}`, mapPostToBackend(patch));
  return mapPostToFrontend(response.data);
}

export async function deletePost(id: string) {
  const response = await api.delete(`/planner/posts/${id}`);
  return response.data;
}

export async function schedulePost(id: string) {
  const response = await api.post(`/planner/posts/${id}/schedule`);
  return mapPostToFrontend(response.data);
}

export async function generateHooks(postId: string) {
  const response = await api.post("/planner/hooks", { postId });
  return response.data;
}

export async function generateCaptions(postId: string) {
  const response = await api.post("/planner/captions", { postId });
  return response.data;
}

export async function getPost(id: string) {
  const response = await api.get(`/planner/posts/${id}`);
  return mapPostToFrontend(response.data);
}

// Shoots CRUD API Integration
export async function getShoots() {
  const response = await api.get("/planner/shoots");
  return response.data.map((shoot: any) => ({
    ...shoot,
    slots: shoot.slotsJson ? JSON.parse(shoot.slotsJson) : { morning: [], afternoon: [], evening: [] },
  }));
}

export async function createShoot(shoot: any) {
  const payload = {
    name: shoot.name,
    shootDate: shoot.shootDate,
    slotsJson: JSON.stringify(shoot.slots || { morning: [], afternoon: [], evening: [] }),
    postId: shoot.postId || null,
  };
  const response = await api.post("/planner/shoots", payload);
  return {
    ...response.data,
    slots: response.data.slotsJson ? JSON.parse(response.data.slotsJson) : { morning: [], afternoon: [], evening: [] },
  };
}

export async function updateShoot(id: string, patch: any) {
  const payload: any = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.shootDate !== undefined) payload.shootDate = patch.shootDate;
  if (patch.slots !== undefined) payload.slotsJson = JSON.stringify(patch.slots);
  if (patch.postId !== undefined) payload.postId = patch.postId;

  const response = await api.put(`/planner/shoots/${id}`, payload);
  return {
    ...response.data,
    slots: response.data.slotsJson ? JSON.parse(response.data.slotsJson) : { morning: [], afternoon: [], evening: [] },
  };
}

export async function deleteShoot(id: string) {
  const response = await api.delete(`/planner/shoots/${id}`);
  return response.data;
}

export async function getPublishingHistory() {
  const response = await api.get("/planner/publishing-history");
  return response.data;
}

export async function retryPublishingJob(jobId: string) {
  const response = await api.post(`/planner/publishing-history/${jobId}/retry`);
  return response.data;
}
