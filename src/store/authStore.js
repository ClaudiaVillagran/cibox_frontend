import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useCartStore from "./cartStore";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async ({ user, token }) => {
    await AsyncStorage.setItem("auth", JSON.stringify({ user, token }));

    set({
      user,
      token,
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem("auth");

    useCartStore.getState().clearCartSummary();

    set({
      user: null,
      token: null,
    });
  },

  loadAuth: async () => {
    try {
      const data = await AsyncStorage.getItem("auth");

      if (data) {
        const parsed = JSON.parse(data);

        set({
          user: parsed.user,
          token: parsed.token,
        });
      }
    } catch (error) {
      console.log("LOAD AUTH ERROR:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
