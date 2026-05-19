import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import MainTabs from "./MainTabs";
import AuthStack from "./AuthStack";
import WebLayout from "../layout/WebLayout";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import { colors } from "../constants/theme";
import AppText from "../components/AppText";
import MissionsScreen from "../screens/MissionsScreen";

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
import CustomBoxScreen from "../screens/CustomBoxScreen";
import CustomBoxCheckoutScreen from "../screens/CustomBoxCheckoutScreen";
import HowItWorksScreen from "../screens/HowItWorksScreen";
import RecipesScreen from "../screens/RecipesScreen";

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

function CartHeaderButton() {
  const navigation = useNavigation();
  const { cartCount } = useCartStore();

  return (
    <Pressable
      onPress={() => navigation.navigate("Cart")}
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `${colors.primaryLight}33`,
        position: "relative",
        marginRight: 8,
      }}
    >
      <Ionicons name="bag-outline" size={21} color={colors.text} />
      {cartCount > 0 ? (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
            {cartCount}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function AppStack() {
  const { token } = useAuthStore();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= 800;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800" },
        headerRight: () => (!isWebDesktop ? <CartHeaderButton /> : null),
      }}
    >
      {isWebDesktop ? (
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
        component={
          isWebDesktop ? withWebLayout(ProductsScreen) : ProductsScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Productos" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={
          isWebDesktop
            ? withWebLayout(ProductDetailScreen)
            : ProductDetailScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Detalle del producto" }
        }
      />
      <Stack.Screen
        name="Cart"
        component={isWebDesktop ? withWebLayout(CartScreen) : CartScreen}
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Mi carrito", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="Checkout"
        component={
          isWebDesktop ? withWebLayout(CheckoutScreen) : CheckoutScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Checkout", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="OrderDetail"
        component={
          isWebDesktop ? withWebLayout(OrderDetailScreen) : OrderDetailScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Detalle de orden" }
        }
      />
      <Stack.Screen
        name="Notifications"
        component={
          isWebDesktop
            ? withWebLayout(NotificationsScreen)
            : NotificationsScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Notificaciones" }
        }
      />
      <Stack.Screen
        name="OrderSuccess"
        component={
          isWebDesktop ? withWebLayout(OrderSuccessScreen) : OrderSuccessScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Compra exitosa", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="OrderFailed"
        component={
          isWebDesktop ? withWebLayout(OrderFailedScreen) : OrderFailedScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Compra fallida", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="VendorProducts"
        component={
          isWebDesktop
            ? withWebLayout(VendorProductsScreen)
            : VendorProductsScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Mis productos" }
        }
      />
      <Stack.Screen
        name="CreateProduct"
        component={
          isWebDesktop
            ? withWebLayout(CreateProductScreen)
            : CreateProductScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Crear producto" }
        }
      />
      <Stack.Screen
        name="EditProduct"
        component={
          isWebDesktop ? withWebLayout(EditProductScreen) : EditProductScreen
        }
        options={
          isWebDesktop ? { headerShown: false } : { title: "Editar producto" }
        }
      />
      <Stack.Screen
        name="Webpay"
        component={isWebDesktop ? withWebLayout(WebpayScreen) : WebpayScreen}
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Pago con Webpay", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="CustomBox"
        component={
          isWebDesktop ? withWebLayout(CustomBoxScreen) : CustomBoxScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Arma tu caja", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="CustomBoxCheckout"
        component={
          isWebDesktop
            ? withWebLayout(CustomBoxCheckoutScreen)
            : CustomBoxCheckoutScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Confirmar pedido", headerRight: () => null }
        }
      />
      <Stack.Screen
        name="HowItWorks"
        component={
          isWebDesktop ? withWebLayout(HowItWorksScreen) : HowItWorksScreen
        }
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Cómo funciona CIBOX" }
        }
      />
      <Stack.Screen
        name="Recipes"
        component={isWebDesktop ? withWebLayout(RecipesScreen) : RecipesScreen}
        options={
          isWebDesktop
            ? { headerShown: false }
            : { title: "Ideas para cocinar" }
        }
      />
      <Stack.Screen
        name="Missions"
        component={
          isWebDesktop ? withWebLayout(MissionsScreen) : MissionsScreen
        }
        options={isWebDesktop ? { headerShown: false } : { title: "Misiones" }}
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
              isWebDesktop
                ? withWebLayout(VerifyEmailScreen)
                : VerifyEmailScreen
            }
            options={
              isWebDesktop
                ? { headerShown: false }
                : { title: "Verificar correo", headerRight: () => null }
            }
          />
          <Stack.Screen
            name="ForgotPassword"
            component={
              isWebDesktop
                ? withWebLayout(ForgotPasswordScreen)
                : ForgotPasswordScreen
            }
            options={
              isWebDesktop
                ? { headerShown: false }
                : { title: "Recuperar contraseña", headerRight: () => null }
            }
          />
          <Stack.Screen
            name="ResetPassword"
            component={
              isWebDesktop
                ? withWebLayout(ResetPasswordScreen)
                : ResetPasswordScreen
            }
            options={
              isWebDesktop
                ? { headerShown: false }
                : { title: "Nueva contraseña", headerRight: () => null }
            }
          />
        </>
      )}
    </Stack.Navigator>
  );
}
