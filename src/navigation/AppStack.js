import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, useWindowDimensions } from "react-native";

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
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import OrderFailedScreen from "../screens/OrderFailedScreen";

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
  const { width } = useWindowDimensions();
  // const isWeb = Platform.OS === "web";
  const isWebDesktop = Platform.OS === "web" && width >= 800;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "800",
        },
      }}
    >
      {isWebDesktop  ? (
        <>
          <Stack.Screen
            name="Inicio"
            component={withWebLayout(HomeScreen)}
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

      <Stack.Screen
        name="Products"
        component={isWebDesktop ? withWebLayout(ProductsScreen) : ProductsScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Productos" }}
      />

      <Stack.Screen
        name="ProductDetail"
        component={
          isWebDesktop ? withWebLayout(ProductDetailScreen) : ProductDetailScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Detalle del producto" }
        }
      />

      <Stack.Screen
        name="Cart"
        component={isWebDesktop ? withWebLayout(CartScreen) : CartScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Mi carrito" }}
      />

      <Stack.Screen
        name="Checkout"
        component={isWebDesktop ? withWebLayout(CheckoutScreen) : CheckoutScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Checkout" }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={isWebDesktop ? withWebLayout(OrderDetailScreen) : OrderDetailScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Detalle de orden" }}
      />

      <Stack.Screen
        name="Notifications"
        component={
          isWebDesktop ? withWebLayout(NotificationsScreen) : NotificationsScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Notificaciones" }}
      />

      <Stack.Screen
        name="OrderSuccess"
        component={
          isWebDesktop ? withWebLayout(OrderSuccessScreen) : OrderSuccessScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Compra exitosa" }}
      />
      <Stack.Screen
        name="OrderFailed"
        component={isWebDesktop ? withWebLayout(OrderFailedScreen) : OrderFailedScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Compra fallida" }}
      />

      <Stack.Screen
        name="VendorProducts"
        component={
          isWebDesktop ? withWebLayout(VendorProductsScreen) : VendorProductsScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Mis productos" }}
      />

      <Stack.Screen
        name="CreateProduct"
        component={
          isWebDesktop ? withWebLayout(CreateProductScreen) : CreateProductScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Crear producto" }}
      />

      <Stack.Screen
        name="EditProduct"
        component={isWebDesktop ? withWebLayout(EditProductScreen) : EditProductScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Editar producto" }}
      />

      <Stack.Screen
        name="Webpay"
        component={isWebDesktop ? withWebLayout(WebpayScreen) : WebpayScreen}
        options={isWebDesktop ? { headerShown: false } : { title: "Pago con Webpay" }}
      />

      {!token && (
        <>
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="VerifyEmail"
            component={
              isWebDesktop ? withWebLayout(VerifyEmailScreen) : VerifyEmailScreen
            }
            options={
              isWebDesktop ? { headerShown: false } : { title: "Verificar correo" }
            }
          />

          <Stack.Screen
            name="ForgotPassword"
            component={
              isWebDesktop ? withWebLayout(ForgotPasswordScreen) : ForgotPasswordScreen
            }
            options={
              isWebDesktop ? { headerShown: false } : { title: "Recuperar contraseña" }
            }
          />

          <Stack.Screen
            name="ResetPassword"
            component={
              isWebDesktop ? withWebLayout(ResetPasswordScreen) : ResetPasswordScreen
            }
            options={
              isWebDesktop ? { headerShown: false } : { title: "Nueva contraseña" }
            }
          />
        </>
      )}
    </Stack.Navigator>
  );
}
