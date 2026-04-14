import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import MainTabs from "./MainTabs";
import AuthStack from "./AuthStack";
import WebLayout from "../layout/WebLayout";
import useAuthStore from "../store/authStore";

import HomeScreen from "../screens/HomeScreen";
import PantryScreen from "../screens/PantryScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductsScreen from "../screens/ProductsScreen";
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

function withWebLayout(Component) {
  return function WrappedScreen(props) {
    return (
      <WebLayout>
        <Component {...props} />
      </WebLayout>
    );
  };
}

export default function AppStack() {
  const { token } = useAuthStore();
  const isWeb = Platform.OS === "web";

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "800",
        },
      }}
    >
      {isWeb ? (
        <>
          <Stack.Screen
            name="Inicio"
            component={withWebLayout(HomeScreen)}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Products"
            component={withWebLayout(ProductsScreen)}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PantryTab"
            component={withWebLayout(PantryScreen)}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FavoritesTab"
            component={withWebLayout(FavoritesScreen)}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrdersTab"
            component={withWebLayout(OrdersScreen)}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileTab"
            component={withWebLayout(ProfileScreen)}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      )}

      {!token && (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}

      <Stack.Screen
        name="ProductDetail"
        component={isWeb ? withWebLayout(ProductDetailScreen) : ProductDetailScreen}
        options={isWeb ? { headerShown: false } : { title: "Detalle del producto" }}
      />

      <Stack.Screen
        name="Cart"
        component={isWeb ? withWebLayout(CartScreen) : CartScreen}
        options={isWeb ? { headerShown: false } : { title: "Mi carrito" }}
      />

      <Stack.Screen
        name="Checkout"
        component={isWeb ? withWebLayout(CheckoutScreen) : CheckoutScreen}
        options={isWeb ? { headerShown: false } : { title: "Checkout" }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={isWeb ? withWebLayout(OrderDetailScreen) : OrderDetailScreen}
        options={isWeb ? { headerShown: false } : { title: "Detalle de orden" }}
      />

      <Stack.Screen
        name="Notifications"
        component={isWeb ? withWebLayout(NotificationsScreen) : NotificationsScreen}
        options={isWeb ? { headerShown: false } : { title: "Notificaciones" }}
      />

      <Stack.Screen
        name="OrderSuccess"
        component={isWeb ? withWebLayout(OrderSuccessScreen) : OrderSuccessScreen}
        options={isWeb ? { headerShown: false } : { title: "Compra exitosa" }}
      />

      <Stack.Screen
        name="VendorProducts"
        component={isWeb ? withWebLayout(VendorProductsScreen) : VendorProductsScreen}
        options={isWeb ? { headerShown: false } : { title: "Mis productos" }}
      />

      <Stack.Screen
        name="CreateProduct"
        component={isWeb ? withWebLayout(CreateProductScreen) : CreateProductScreen}
        options={isWeb ? { headerShown: false } : { title: "Crear producto" }}
      />

      <Stack.Screen
        name="EditProduct"
        component={isWeb ? withWebLayout(EditProductScreen) : EditProductScreen}
        options={isWeb ? { headerShown: false } : { title: "Editar producto" }}
      />

      <Stack.Screen
        name="Webpay"
        component={isWeb ? withWebLayout(WebpayScreen) : WebpayScreen}
        options={isWeb ? { headerShown: false } : { title: "Pago con Webpay" }}
      />
    </Stack.Navigator>
  );
}