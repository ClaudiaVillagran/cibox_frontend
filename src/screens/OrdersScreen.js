import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { colors, radius, spacing, shadows } from "../constants/theme";
import { getMyOrders } from "../services/orderService";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";
import AppText from "../components/AppText";

export default function OrdersScreen({ navigation }) {
  const { token } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getMyOrders();
      const items = data?.orders || data?.data?.orders || data?.data || data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log("GET ORDERS ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  };

  const formatPrice = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("es-CL");
  };

  if (!token) {
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
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
              ...shadows.card,
            }}
          >
            <AppText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: colors.text,
                textAlign: "center",
                marginBottom: spacing.sm,
              }}
            >
              Inicia sesión para ver tus órdenes
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: spacing.lg,
              }}
            >
              Desde aquí podrás revisar el estado y detalle de tus compras
              asociadas a tu cuenta.
            </AppText>

            <Pressable
              onPress={() => navigation.navigate("Auth")}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
            >
              <AppText
                style={{
                  color: colors.primaryText,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Iniciar sesión
              </AppText>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "HomeTab" })
              }
              style={{
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                alignItems: "center",
              }}
            >
              <AppText
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Volver al catálogo
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={{ marginTop: spacing.sm, color: colors.muted }}>
            Cargando órdenes...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (!orders.length) {
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
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
              ...shadows.card,
            }}
          >
            <AppText
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
                marginBottom: spacing.sm,
                textAlign: "center",
              }}
            >
              Aún no tienes órdenes
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: spacing.lg,
              }}
            >
              Cuando completes una compra asociada a tu cuenta, aparecerá aquí.
            </AppText>

            <Pressable
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "HomeTab" })
              }
              style={{
                backgroundColor: colors.primary,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                alignItems: "center",
              }}
            >
              <AppText
                style={{
                  color: colors.primaryText,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Ir al catálogo
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <AppText
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Mis órdenes
            </AppText>

            <AppText style={{ color: colors.muted }}>
              Revisa el estado y detalle de tus compras.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
            style={cardStyle}
          >
            <AppText
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Orden #{item._id?.slice(-6)}
            </AppText>

            <AppText style={{ color: colors.muted, marginBottom: 4 }}>
              Estado: {item.status || "—"}
            </AppText>

            <AppText style={{ color: colors.muted, marginBottom: 4 }}>
              Total: ${formatPrice(item.total)}
            </AppText>

            <AppText style={{ color: colors.muted }}>
              Productos: {item.items?.length ?? 0}
            </AppText>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}