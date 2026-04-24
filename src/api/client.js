import axios from "axios";
import useAuthStore from "../store/authStore";
import { getGuestId } from "../utils/guestId";

const client = axios.create({
  baseURL: "https://jarring-mashing-buckshot.ngrok-free.dev/api",
});

client.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = await getGuestId();
      config.headers["x-guest-id"] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default client;