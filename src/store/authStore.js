import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import useCartStore from "./cartStore";

const AUTH_KEY = "auth";

const authStorage = {
  getItem: async (key) => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  },

  setItem: async (key, value) => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key) => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  },
};

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async ({ user, token }) => {
    const payload = JSON.stringify({ user, token });

    await authStorage.setItem(AUTH_KEY, payload);

    set({
      user,
      token,
    });
  },

  logout: async () => {
    await authStorage.removeItem(AUTH_KEY);

    useCartStore.getState().clearCartSummary();

    set({
      user: null,
      token: null,
    });
  },

  loadAuth: async () => {
    try {
      const data = await authStorage.getItem(AUTH_KEY);

      if (data) {
        const parsed = JSON.parse(data);

        set({
          user: parsed?.user || null,
          token: parsed?.token || null,
        });
      } else {
        set({
          user: null,
          token: null,
        });
      }
    } catch (error) {
      console.log("LOAD AUTH ERROR:", error);
      set({
        user: null,
        token: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;