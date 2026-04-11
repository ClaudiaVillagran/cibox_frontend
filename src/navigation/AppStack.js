import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import VendorProductsScreen from "../screens/VendorProductsScreen";
import CreateProductScreen from "../screens/CreateProductScreen";
import EditProductScreen from "../screens/EditProductScreen";
import WebpayScreen from "../screens/WebpayScreen";
const Stack = createNativeStackNavigator();
import useAuthStore from "../store/authStore";
import AuthStack from "./AuthStack";
import ProductsScreen from "../screens/ProductsScreen";
export default function AppStack() {
  const { token } = useAuthStore();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "800",
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      {!token && (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}

      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Detalle del producto" }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: "Productos" }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Mi carrito" }}
      />

      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Detalle de orden" }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notificaciones" }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ title: "Compra exitosa" }}
      />
      <Stack.Screen
        name="VendorProducts"
        component={VendorProductsScreen}
        options={{ title: "Mis productos" }}
      />

      <Stack.Screen
        name="CreateProduct"
        component={CreateProductScreen}
        options={{ title: "Crear producto" }}
      />

      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: "Editar producto" }}
      />
      <Stack.Screen
        name="Webpay"
        component={WebpayScreen}
        options={{ title: "Pago con Webpay" }}
      />
    </Stack.Navigator>
  );
}
