import { useMemo } from "react";
import { Platform, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, spacing } from "../constants/theme";
import AppText from "../components/AppText";

export default function OrderFailedScreen({ route, navigation }) {
  const params = route.params || {};

  const orderId = useMemo(() => {
    if (params.orderId) return params.orderId;
    if (Platform.OS === "web") {
      const search = new URLSearchParams(window.location.search);
      return search.get("orderId") || null;
    }
    return null;
  }, [params.orderId]);

  const status = useMemo(() => {
    if (params.status) return params.status;
    if (Platform.OS === "web") {
      const search = new URLSearchParams(window.location.search);
      return search.get("status") || "rejected";
    }
    return "rejected";
  }, [params.status]);

  const isCancelled = status === "cancelled";

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
        <AppText style={{ fontSize: 48, marginBottom: 16 }}>
          {isCancelled ? "😔" : "❌"}
        </AppText>

        <AppText
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {isCancelled ? "Pago cancelado" : "Pago no completado"}
        </AppText>

        <AppText
          style={{
            color: colors.muted,
            marginBottom: 28,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          {isCancelled
            ? "Cancelaste el proceso de pago. Tu orden sigue pendiente, puedes intentarlo de nuevo."
            : "No se pudo completar el pago. Tu orden sigue pendiente y no se realizó ningún cobro."}
        </AppText>

        {orderId ? (
          <AppButton
            title="Ver mi orden"
            onPress={() => navigation.replace("OrderDetail", { orderId })}
            style={{ marginBottom: 12 }}
          />
        ) : null}

        <AppButton
          title="Volver al inicio"
          variant="secondary"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: Platform.OS === "web" ? "Inicio" : "MainTabs" }],
            })
          }
        />
      </View>
    </ScreenContainer>
  );
}