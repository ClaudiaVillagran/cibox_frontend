import AsyncStorage from "@react-native-async-storage/async-storage";

const CHECKOUT_ADDRESS_KEY = "cibox_checkout_address";

export const saveCheckoutAddress = async (addressData) => {
  try {
    await AsyncStorage.setItem(
      CHECKOUT_ADDRESS_KEY,
      JSON.stringify(addressData)
    );
  } catch (error) {
    console.log("SAVE CHECKOUT ADDRESS ERROR:", error);
  }
};

export const getCheckoutAddress = async () => {
  try {
    const raw = await AsyncStorage.getItem(CHECKOUT_ADDRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.log("GET CHECKOUT ADDRESS ERROR:", error);
    return null;
  }
};

export const clearCheckoutAddress = async () => {
  try {
    await AsyncStorage.removeItem(CHECKOUT_ADDRESS_KEY);
  } catch (error) {
    console.log("CLEAR CHECKOUT ADDRESS ERROR:", error);
  }
};