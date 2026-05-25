import { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import AppStack from "./AppStack";
import { colors } from "../constants/theme";
import { usePushNotifications } from "../hooks/usePushNotifications";

const linking = {
  prefixes: [
    "myapp://",
    "https://cibox-frontend-j7257.ondigitalocean.app",
    "https://app.cibox.cl",
    "http://192.168.1.3:8081",
    "http://localhost:8081",
  ],
  config: {
    screens: {
      Inicio: "",
      Products: "products",
      CustomBox: "custom-box",
      CustomBoxCheckout: "custom-box/checkout",
      ProductDetail: "products/:productId",
      Cart: "cart",
      Checkout: "checkout",
      // Rutas específicas ANTES que la dinámica
      OrderSuccess: "orders/success",
      OrderFailed: "orders/failed",
      OrderDetail: "orders/:orderId",
      VerifyEmail: "auth/verify-email",
      ResetPassword: "auth/reset-password",
      Notifications: "notifications",
      PantryTab: "pantry",
      FavoritesTab: "favorites",
      OrdersTab: "orders",
      ProfileTab: "profile",
      Auth: "auth",
    },
  },
};

export default function RootNavigation() {
  const navigationRef = useRef(null);

  // Registra el dispositivo para push y maneja taps en notificaciones
  usePushNotifications(navigationRef);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }
    >
      <AppStack />
    </NavigationContainer>
  );
}
