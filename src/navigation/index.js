import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./AppStack";

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
    <NavigationContainer linking={linking}>
      <AppStack />
    </NavigationContainer>
  );
}