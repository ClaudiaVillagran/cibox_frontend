import { useMemo } from "react";
import { Platform, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, spacing } from "../constants/theme";
import AppText from "../components/AppText";

export default function OrderSuccessScreen({ route, navigation }) {
  const params = route.params || {};

  const webQuery = useMemo(() => {
    if (Platform.OS !== "web") return {};

    const search = new URLSearchParams(window.location.search);

    return {
      orderId: search.get("orderId") || "",
      guestEmail: search.get("guestEmail") || "",
    };
  }, []);

  const orderId = params.orderId || webQuery.orderId;
  const guestEmail = params.guestEmail || webQuery.guestEmail;

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
            marginBottom: 20,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          Tu pedido fue creado correctamente. Revisa tu correo para ver el
          resumen de la compra y futuras actualizaciones del pedido.
        </AppText>

        {orderId ? (
          <AppText
            style={{
              color: colors.text,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Orden: {orderId}
          </AppText>
        ) : null}

        {guestEmail ? (
          <AppText
            style={{
              color: colors.muted,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Correo asociado: {guestEmail}
          </AppText>
        ) : (
          <View style={{ marginBottom: 20 }} />
        )}

        <AppButton
          title="Ver mi orden"
          onPress={() =>
            navigation.replace("OrderDetail", { orderId, guestEmail })
          }
          style={{ marginBottom: 12 }}
          disabled={!orderId}
        />

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
