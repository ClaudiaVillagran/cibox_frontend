import { NavigationContainer } from "@react-navigation/native";
import useAuthStore from "../store/authStore";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

const linking = {
  prefixes: ["myapp://", "http://192.168.1.3:8081"],
  config: {
    screens: {
      OrderSuccess: "orders/success",
      OrderDetail: "orders/:orderId",
    },
  },
};
export default function RootNavigation() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer linking={linking}>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}