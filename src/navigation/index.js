import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import AppStack from "./AppStack";
import { colors } from "../constants/theme";

const linking = {
  prefixes: ["myapp://", "http://192.168.1.3:8081", "http://localhost:8081"],
  config: {
    screens: {
      Inicio: "",
      Products: "products",
      ProductDetail: "products/:productId",
      Cart: "cart",
      Checkout: "checkout",
      OrderDetail: "orders/:orderId",
      OrderSuccess: "orders/success",
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
  return (
    <NavigationContainer
      linking={linking}
      fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }
    >
      <AppStack />
    </NavigationContainer>
  );
}