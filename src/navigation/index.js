import { NavigationContainer } from "@react-navigation/native";
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
  return (
    <NavigationContainer linking={linking}>
      <AppStack />
    </NavigationContainer>
  );
}
