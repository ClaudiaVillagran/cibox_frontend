import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { colors, radius, spacing } from "../constants/theme";
import {
  getGuestOrderById,
  getOrderById,
} from "../services/orderService";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";

export default function OrderDetailScreen({ route, navigation }) {
  const { token } = useAuthStore();
  const orderId = route?.params?.orderId;
  const guestEmail = route?.params?.guestEmail || null;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };

  const fetchOrder = useCallback(async () => {
    try {
      if (!orderId) {
        showAppAlert("Error", "No se recibió el ID de la orden");
        setLoading(false);
        return;
      }

      setLoading(true);

      let data;

      if (token) {
        data = await getOrderById(orderId);
      } else if (guestEmail) {
        data = await getGuestOrderById({
          orderId,
          email: guestEmail,
        });
      } else {
        showAppAlert(
          "Acceso restringido",
          "Inicia sesión o usa el correo asociado a la compra"
        );
        setLoading(false);
        return;
      }

      const item = data?.order || data?.data?.order || data?.data || data;
      setOrder(item);
    } catch (error) {
      console.log(
        "GET ORDER DETAIL ERROR:",
        error?.response?.data || error.message
      );
      showAppAlert("Error", "No se pudo cargar la orden");
    } finally {
      setLoading(false);
    }
  }, [orderId, token, guestEmail]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusMeta = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "pending") {
      return {
        label: "Pendiente",
        backgroundColor: "#fef3c7",
        textColor: "#92400e",
      };
    }

    if (normalized === "paid") {
      return {
        label: "Pagada",
        backgroundColor: "#dcfce7",
        textColor: "#166534",
      };
    }

    if (normalized === "processing" || normalized === "preparing") {
      return {
        label: "Procesando",
        backgroundColor: "#dbeafe",
        textColor: "#1d4ed8",
      };
    }

    if (normalized === "shipped") {
      return {
        label: "Enviada",
        backgroundColor: "#e0e7ff",
        textColor: "#4338ca",
      };
    }

    if (normalized === "delivered") {
      return {
        label: "Entregada",
        backgroundColor: "#dcfce7",
        textColor: "#166534",
      };
    }

    if (normalized === "cancelled") {
      return {
        label: "Cancelada",
        backgroundColor: "#fee2e2",
        textColor: "#b91c1c",
      };
    }

    return {
      label: status || "Sin estado",
      backgroundColor: "#f3f4f6",
      textColor: "#374151",
    };
  };

  const getProgressSteps = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "cancelled") {
      return [
        { key: "pending", label: "Pendiente", done: true },
        { key: "cancelled", label: "Cancelada", done: true, danger: true },
      ];
    }

    const orderSteps = [
      { key: "pending", label: "Pendiente" },
      { key: "paid", label: "Pagada" },
      { key: "preparing", label: "Preparando" },
      { key: "shipped", label: "Enviada" },
      { key: "delivered", label: "Entregada" },
    ];

    const statusOrder = [
      "pending",
      "paid",
      "preparing",
      "shipped",
      "delivered",
    ];

    const currentIndex = statusOrder.indexOf(normalized);

    return orderSteps.map((step, index) => ({
      ...step,
      done: currentIndex >= index,
      active: currentIndex === index,
    }));
  };

  if (loading) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!order) {
    return (
      <ScreenContainer maxWidth={720}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No se encontró la orden</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusMeta = getStatusMeta(order.status);
  const progressSteps = getProgressSteps(order.status);
  const orderItems = Array.isArray(order.items) ? order.items : [];

  return (
    <ScreenContainer maxWidth={720}>
      <View style={{ marginBottom: spacing.md }}>
        <Text
          onPress={() => navigation.goBack()}
          style={{
            color: colors.text,
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          ← Volver
        </Text>
      </View>

      <FlatList
        data={orderItems}
        keyExtractor={(item, index) =>
          String(item.product_id || item._id || index)
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <>
            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Orden #{String(order._id || order.id || "").slice(-6)}
              </Text>

              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: statusMeta.backgroundColor,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: statusMeta.textColor,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {statusMeta.label}
                </Text>
              </View>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Total: ${order.total ?? "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Ítems: {orderItems.length}
              </Text>

              <Text style={{ color: colors.muted }}>
                ID: {order._id || order.id || "—"}
              </Text>
            </View>

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 14,
                }}
              >
                Progreso del pedido
              </Text>

              {progressSteps.map((step, index) => {
                const isLast = index === progressSteps.length - 1;
                const circleColor = step.danger
                  ? "#b91c1c"
                  : step.done
                    ? colors.text
                    : "#d1d5db";
                const lineColor = step.done ? colors.text : "#e5e7eb";

                return (
                  <View key={step.key}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: circleColor,
                          }}
                        />
                      </View>

                      <View style={{ flex: 1, paddingVertical: 4 }}>
                        <Text
                          style={{
                            color: step.done ? colors.text : colors.muted,
                            fontWeight:
                              step.active || step.done ? "700" : "500",
                          }}
                        >
                          {step.label}
                        </Text>
                      </View>
                    </View>

                    {!isLast ? (
                      <View
                        style={{
                          marginLeft: 6,
                          width: 2,
                          height: 18,
                          backgroundColor: lineColor,
                          marginBottom: 4,
                          marginTop: 4,
                        }}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Envío
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Región: {order.shipping?.region || "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Ciudad: {order.shipping?.city || "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Dirección: {order.shipping?.address || "—"}
              </Text>

              <Text style={{ color: colors.muted }}>
                Servicio: {order.shipping?.service_name || "—"}
              </Text>
            </View>

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Pago
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Método: {order.payment?.method || "—"}
              </Text>

              <Text style={{ color: colors.muted }}>
                Estado pago: {order.payment?.status || order.status || "—"}
              </Text>
            </View>

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Productos
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const unitPrice = item.price ?? item.unit_price ?? 0;
          const subtotal = item.subtotal ?? 0;

          return (
            <View style={cardStyle}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: colors.text,
                  marginBottom: 6,
                }}
              >
                {item.name || "Producto"}
              </Text>

              {item.tier_label ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: colors.text,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: 999,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primaryText,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {item.tier_label}
                  </Text>
                </View>
              ) : null}

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Cantidad: {item.quantity ?? "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Precio unitario: ${unitPrice}
              </Text>

              {item.discount_applied ? (
                <Text style={{ color: colors.success, marginBottom: 4 }}>
                  Descuento {item.discount_source || "aplicado"}: -
                  {item.discount_percent || 0}%
                </Text>
              ) : null}

              <Text
                style={{
                  color: colors.text,
                  fontWeight: "700",
                }}
              >
                Subtotal: ${subtotal}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={cardStyle}>
            <Text style={{ color: colors.muted }}>
              Esta orden no tiene productos.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}