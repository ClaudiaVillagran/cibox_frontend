import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import PantryScreen from "../screens/PantryScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../constants/theme";
import { Image } from "react-native";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
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
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <Image
              source={require("../../assets/logo-cibox.png")}
              style={{ width: 90, height: 56, resizeMode: "contain" }}
            />
          ),
          headerTitleAlign: "left",
        })}
      />
      <Tab.Screen
        name="PantryTab"
        component={PantryScreen}
        options={{ title: "Despensa", headerTitle: "Mi despensa" }}
      />

      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{ title: "Favoritos", headerTitle: "Favoritos" }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: "Órdenes", headerTitle: "Mis órdenes" }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Perfil", headerTitle: "Mi perfil" }}
      />
    </Tab.Navigator>
  );
}
