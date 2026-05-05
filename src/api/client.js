import axios from "axios";
import useAuthStore from "../store/authStore";
import { getGuestId } from "../utils/guestId";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

client.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    const guestId = await getGuestId();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (guestId) {
      config.headers["x-guest-id"] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    const shouldLogout =
      status === 401 &&
      (
        url.includes("/auth/me") ||
        url.includes("/auth/profile") ||
        url.includes("/auth/refresh")
      );

    if (shouldLogout) {
      await useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default client;
