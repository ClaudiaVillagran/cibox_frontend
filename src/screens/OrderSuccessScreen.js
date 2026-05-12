import { useMemo } from "react";
import { Platform, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, spacing } from "../constants/theme";
import AppText from "../components/AppText";
import useAuthStore from "../store/authStore";

export default function OrderSuccessScreen({ route, navigation }) {
  const params = route.params || {};
  const { token } = useAuthStore();
  const isGuest = !token;

  const orderId = useMemo(() => {
    if (params.orderId) return params.orderId;
    if (Platform.OS === "web") {
      const search = new URLSearchParams(window.location.search);
      return search.get("orderId") || null;
    }
    return null;
  }, [params.orderId]);

  const goToInicio = () => {
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: Platform.OS === "web" ? "Inicio" : "MainTabs" }],
      });
    } catch {
      navigation.navigate(Platform.OS === "web" ? "Inicio" : "MainTabs");
    }
  };

  const goToOrder = () => {
    try {
      navigation.navigate("OrderDetail", { orderId });
    } catch {
      navigation.reset({
        index: 0,
        routes: [
          { name: Platform.OS === "web" ? "Inicio" : "MainTabs" },
          { name: "OrderDetail", params: { orderId } },
        ],
      });
    }
  };

  return (
    <ScreenContainer maxWidth={720}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: spacing.xl,
        }}
      >
        <AppText style={{ fontSize: 48, marginBottom: 16 }}>🎉</AppText>

        <AppText
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          ¡Compra confirmada!
        </AppText>

        <AppText
          style={{
            color: colors.muted,
            marginBottom: 28,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          {isGuest
            ? "Tu pedido fue recibido. Te enviamos un correo con el resumen de tu compra y te avisaremos cuando sea despachado."
            : "Tu pedido fue creado correctamente. Revisa tu correo para ver el resumen y futuras actualizaciones."}
        </AppText>

        {!isGuest && orderId ? (
          <AppButton
            title="Ver mi orden"
            onPress={goToOrder}
            style={{ marginBottom: 12 }}
          />
        ) : null}

        <AppButton
          title="Volver al inicio"
          variant={isGuest ? "primary" : "secondary"}
          onPress={goToInicio}
        />
      </View>
    </ScreenContainer>
  );
}