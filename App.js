import { useEffect } from "react";
import { SafeAreaView, Text, ActivityIndicator, View } from "react-native";
import useAuthStore from "./src/store/authStore";
import RootNavigation from "./src/navigation";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import AppText from "./src/components/AppText";

export default function App() {
  const { loadAuth, isLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // ⛔ Espera a que carguen fuentes Y auth
  if (isLoading || !fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <AppText style={{ marginTop: 10 }}>Cargando...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return <RootNavigation />;
}