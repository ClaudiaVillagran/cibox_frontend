import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import {
  getVendorDashboard,
  getVendorSalesSummary,
} from "../services/vendorService";
import useAuthStore from "../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { showAppAlert } from "../utils/appAlerts";

export default function VendorDashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout, setAuth, token } = useAuthStore();
  const navigation = useNavigation();

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [dashboardData, summaryData] = await Promise.all([
        getVendorDashboard(),
        getVendorSalesSummary(),
      ]);

      setDashboard(dashboardData);
      setSalesSummary(summaryData?.summary || null);
    } catch (error) {
      console.log(
        "GET VENDOR DASHBOARD ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudo cargar el dashboard del vendor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <ScreenContainer maxWidth={900}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!dashboard) {
    return (
      <ScreenContainer maxWidth={720}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No se pudo cargar el dashboard</Text>
        </View>
      </ScreenContainer>
    );
  }

  const vendor = dashboard.vendor || {};
  const stats = dashboard.stats || {};
  const topProducts = Array.isArray(dashboard.top_products)
    ? dashboard.top_products
    : [];
  const recentOrders = Array.isArray(dashboard.recent_orders)
    ? dashboard.recent_orders
    : [];

  return (
    <ScreenContainer maxWidth={900}>
      <FlatList
        data={topProducts}
        keyExtractor={(item, index) =>
          String(item.product_id || item._id || index)
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Panel de vendedor
            </Text>

            <Text
              style={{
                color: colors.muted,
                marginBottom: spacing.md,
              }}
            >
              Resumen de tu tienda, ventas y productos.
            </Text>

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {vendor.store_name || "Mi tienda"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                 ID de vendedor: {vendor.id || "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Aprobado: {vendor.approved ? "Sí" : "No"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Activo: {vendor.is_active ? "Sí" : "No"}
              </Text>

              <Text style={{ color: colors.muted }}>
                Puntuación: {vendor.rating ?? 0}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ ...cardStyle, width: "48%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.muted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Productos
                </Text>

                <AppButton
                  title="Gestionar productos"
                  onPress={() => navigation.navigate("VendorProducts")}
                />

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.text,
                    marginTop: 12,
                  }}
                >
                  {stats.total_products ?? 0}
                </Text>

                <Text style={{ color: colors.muted, marginTop: 6 }}>
                  {stats.active_products ?? 0} activos ·{" "}
                  {stats.inactive_products ?? 0} inactivos
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  navigation.navigate("MainTabs", {
                    screen: "OrdersTab",
                  })
                }
                style={({ pressed }) => [
                  {
                    ...cardStyle,
                    width: "48%",
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.muted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Órdenes
                </Text>

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  {stats.total_orders ?? 0}
                </Text>

                <Text style={{ color: colors.muted, marginTop: 6 }}>
                  {stats.total_units_sold ?? 0} unidades vendidas
                </Text>

                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Ver todas →
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ ...cardStyle, width: "48%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.muted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Ingresos
                </Text>

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  ${stats.total_revenue ?? 0}
                </Text>
              </View>

              <View style={{ ...cardStyle, width: "48%" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.muted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Ticket promedio
                </Text>

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  ${salesSummary?.average_ticket ?? 0}
                </Text>
              </View>
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
                Resumen de ventas
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Órdenes: {salesSummary?.total_orders ?? 0}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Unidades vendidas: {salesSummary?.total_units_sold ?? 0}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Ingresos: ${salesSummary?.total_revenue ?? 0}
              </Text>

              <Text style={{ color: colors.muted }}>
                Ticket promedio: ${salesSummary?.average_ticket ?? 0}
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
                Órdenes recientes
              </Text>

              {!recentOrders.length ? (
                <Text style={{ color: colors.muted }}>
                  No hay órdenes recientes.
                </Text>
              ) : (
                recentOrders.map((order) => {
                  const normalizedStatus = String(
                    order.status || "",
                  ).toLowerCase();

                  const statusMeta =
                    normalizedStatus === "pending"
                      ? {
                          label: "Pendiente",
                          bg: "#FEF3C7",
                          color: "#92400E",
                        }
                      : normalizedStatus === "paid"
                        ? {
                            label: "Pagada",
                            bg: "#DCFCE7",
                            color: "#166534",
                          }
                        : normalizedStatus === "processing"
                          ? {
                              label: "Procesando",
                              bg: "#DBEAFE",
                              color: "#1D4ED8",
                            }
                          : normalizedStatus === "shipped"
                            ? {
                                label: "Enviada",
                                bg: "#E0E7FF",
                                color: "#4338CA",
                              }
                            : normalizedStatus === "delivered"
                              ? {
                                  label: "Entregada",
                                  bg: "#DCFCE7",
                                  color: "#166534",
                                }
                              : normalizedStatus === "cancelled"
                                ? {
                                    label: "Cancelada",
                                    bg: "#FEE2E2",
                                    color: "#B91C1C",
                                  }
                                : {
                                    label: order.status || "Sin estado",
                                    bg: "#F3F4F6",
                                    color: "#374151",
                                  };

                  return (
                    <View
                      key={String(order.order_id || order._id)}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        padding: spacing.md,
                        marginBottom: 12,
                        backgroundColor: colors.background,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 10,
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text
                            style={{
                              fontWeight: "800",
                              color: colors.text,
                              fontSize: 16,
                              marginBottom: 4,
                            }}
                          >
                            Orden #
                            {String(order.order_id || order._id || "").slice(
                              -6,
                            )}
                          </Text>

                          <Text
                            style={{
                              color: colors.muted,
                              fontSize: 13,
                            }}
                          >
                            {order.items_count ?? order.items?.length ?? 0}{" "}
                            ítem(s) · ${order.vendor_total ?? order.total ?? 0}
                          </Text>
                        </View>

                        <View
                          style={{
                            backgroundColor: statusMeta.bg,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 999,
                          }}
                        >
                          <Text
                            style={{
                              color: statusMeta.color,
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {statusMeta.label}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          alignItems: "flex-end",
                        }}
                      >
                        <Text
                          onPress={() =>
                            navigation.navigate("OrderDetail", {
                              orderId: order.order_id || order._id,
                            })
                          }
                          style={{
                            color: colors.text,
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          Ver detalle →
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View
              style={{
                ...cardStyle,
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Top productos
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={cardStyle}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              {item.name}
            </Text>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              Unidades vendidas: {item.total_quantity ?? 0}
            </Text>

            <Text style={{ color: colors.muted }}>
              Ingresos: ${item.total_revenue ?? 0}
            </Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
