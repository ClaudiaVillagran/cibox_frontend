import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const GUEST_ID_KEY = "guest_id";

export const getGuestId = async () => {
  let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);

  if (guestId) return guestId;

  const res = await axios.get(
    "https://backend-app-cibox-tmvlv.ondigitalocean.app/",
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );

  guestId = res.data?.data?.guest_id;

  if (!guestId) {
    throw new Error("No se pudo obtener guest_id");
  }

  await AsyncStorage.setItem(GUEST_ID_KEY, guestId);

  return guestId;
};

export const clearGuestId = async () => {
  await AsyncStorage.removeItem(GUEST_ID_KEY);
};
