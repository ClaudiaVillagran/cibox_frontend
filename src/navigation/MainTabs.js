import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../constants/theme";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../store/authStore";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const user = useAuthStore((state) => state.user);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontWeight: "800",
          color: colors.text,
        },
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      {/* 🏠 INICIO */}
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/logo-cibox.png")}
              style={{ width: 90, height: 42, resizeMode: "contain" }}
            />
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ❤️ FAVORITOS */}
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          title: "Favoritos",
          headerTitle: "Favoritos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 📦 ÓRDENES (solo si hay login) */}
      {user && (
        <Tab.Screen
          name="OrdersTab"
          component={OrdersScreen}
          options={{
            title: "Órdenes",
            headerTitle: "Mis órdenes",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      )}

      {/* 👤 PERFIL */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          headerTitle: "Mi perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}