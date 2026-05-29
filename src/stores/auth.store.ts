import { create } from "zustand";
import { login as apiLogin, register as apiRegister, me as apiMe, googleLogin as apiGoogleLogin } from "../api/auth.api";
import {
  getToken,
  setToken,
  removeToken,
  getProfile,
  setProfile,
  removeProfile,
  clearAuthSession,
} from "../utils/auth.utils";
import type { UserProfile } from "../utils/auth.utils";

interface AuthState {
  token: string | null;
  user: (UserProfile & { creatorName: string; niche?: string; creatorStyle?: string; audienceType?: string }) | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (creatorName: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string, fallbackName?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getToken(),
  user: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await apiLogin(email, password);
      setToken(data.accessToken);
      
      const localProfile = getProfile(data.user.id);
      let userProfile = {
        ...data.user,
        creatorName: email.split("@")[0],
        niche: "minimalist-productivity",
        creatorStyle: "cinematic",
        audienceType: "creators"
      };

      if (localProfile) {
        userProfile = { ...userProfile, ...localProfile };
      } else {
        setProfile(data.user.id, {
          creatorName: userProfile.creatorName,
          niche: userProfile.niche,
          creatorStyle: userProfile.creatorStyle,
          audienceType: userProfile.audienceType
        });
      }
      
      set({ token: data.accessToken, user: userProfile, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  googleLogin: async (idToken: string, fallbackName?: string) => {
    set({ loading: true });
    try {
      const data = await apiGoogleLogin(idToken);
      setToken(data.accessToken);
      
      const localProfile = getProfile(data.user.id);
      let userProfile = {
        ...data.user,
        creatorName: fallbackName || data.user.email.split("@")[0],
        niche: "minimalist-productivity",
        creatorStyle: "cinematic",
        audienceType: "creators"
      };

      if (localProfile) {
        userProfile = { ...userProfile, ...localProfile };
      } else {
        setProfile(data.user.id, {
          creatorName: userProfile.creatorName,
          niche: userProfile.niche,
          creatorStyle: userProfile.creatorStyle,
          audienceType: userProfile.audienceType
        });
      }
      
      set({ token: data.accessToken, user: userProfile, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (creatorName, email, password) => {
    set({ loading: true });
    try {
      const user = await apiRegister(email, password);
      // Persist profile context keys locally
      setProfile(user.id, {
        creatorName,
        niche: "minimalist-productivity",
        creatorStyle: "cinematic",
        audienceType: "creators",
      });
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    clearAuthSession();
    set({ token: null, user: null });
  },

  restoreSession: async () => {
    const token = getToken();
    if (!token) {
      set({ initialized: true });
      return;
    }
    set({ loading: true });
    try {
      const user = await apiMe();
      const localProfile = getProfile(user.id);
      let userProfile = {
        ...user,
        creatorName: user.email.split("@")[0],
        niche: "minimalist-productivity",
        creatorStyle: "cinematic",
        audienceType: "creators"
      };

      if (localProfile) {
        userProfile = { ...userProfile, ...localProfile };
      } else {
        setProfile(user.id, {
          creatorName: userProfile.creatorName,
          niche: userProfile.niche,
          creatorStyle: userProfile.creatorStyle,
          audienceType: userProfile.audienceType
        });
      }
      set({ token, user: userProfile, loading: false, initialized: true });
    } catch (err) {
      console.warn("[AuthStore] Token verification failed, clearing credentials.");
      clearAuthSession();
      set({ token: null, user: null, loading: false, initialized: true });
    }
  },
}));
export { UserProfile };
