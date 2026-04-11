import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_ID_KEY = "guest_id";

const generateGuestId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getGuestId = async () => {
  let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = generateGuestId();
    await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
};

export const clearGuestId = async () => {
  await AsyncStorage.removeItem(GUEST_ID_KEY);
};