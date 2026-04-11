import { Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, spacing } from "../constants/theme";

export default function OrderSuccessScreen({ route, navigation }) {
  const { orderId, guestEmail } = route.params || {};

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
        <Text
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          🎉
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          ¡Compra confirmada!
        </Text>

        <Text
          style={{
            color: colors.muted,
            marginBottom: 20,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          Tu pedido fue creado correctamente. Te notificaremos cuando avance.
        </Text>

        {orderId ? (
          <Text
            style={{
              color: colors.text,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Orden: {orderId}
          </Text>
        ) : null}

        {guestEmail ? (
          <Text
            style={{
              color: colors.muted,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Correo asociado: {guestEmail}
          </Text>
        ) : (
          <View style={{ marginBottom: 20 }} />
        )}

        <AppButton
          title="Ver mi orden"
          onPress={() =>
            navigation.replace("OrderDetail", { orderId, guestEmail })
          }
          style={{ marginBottom: 12 }}
        />

        <AppButton
          title="Volver al inicio"
          variant="secondary"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            })
          }
        />
      </View>
    </ScreenContainer>
  );
}