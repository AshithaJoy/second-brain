export interface CreatorProfile {
  creatorName: string;
  niche: string;
  creatorStyle: string;
  audienceType: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  creatorName: string;
  niche?: string;
  creatorStyle?: string;
  audienceType?: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem("sb_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("sb_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("sb_token");
};

export const getProfile = (userId: string): CreatorProfile | null => {
  const data = localStorage.getItem(`sb_profile_${userId}`);
  return data ? JSON.parse(data) : null;
};

export const setProfile = (userId: string, profile: CreatorProfile): void => {
  localStorage.setItem(`sb_profile_${userId}`, JSON.stringify(profile));
};

export const removeProfile = (userId: string): void => {
  localStorage.removeItem(`sb_profile_${userId}`);
};

export const clearAuthSession = (): void => {
  removeToken();
  // We intentionally do not remove the user's profile here so their settings (niche, creatorName) persist across logins
};
