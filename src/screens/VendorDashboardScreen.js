import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import {
  getVendorDashboard,
  getVendorSalesSummary,
} from "../services/vendorService";
import useAuthStore from "../store/authStore";
import { useNavigation } from "@react-navigation/native";

export default function VendorDashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout, setAuth, token } = useAuthStore();
  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };
  const navigation = useNavigation();

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
        keyExtractor={(item) => item.product_id}
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
              Dashboard Vendor
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
                Vendor ID: {vendor.id || "—"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Aprobado: {vendor.approved ? "Sí" : "No"}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Activo: {vendor.is_active ? "Sí" : "No"}
              </Text>

              <Text style={{ color: colors.muted }}>
                Rating: {vendor.rating ?? 0}
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
                  }}
                >
                  {stats.total_products ?? 0}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 6 }}>
                  {stats.active_products ?? 0} activos ·{" "}
                  {stats.inactive_products ?? 0} inactivos
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
              </View>
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
                recentOrders.map((order) => (
                  <View
                    key={order.order_id}
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: 12,
                      marginTop: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                    >
                      Orden #{String(order.order_id).slice(-6)}
                    </Text>

                    <Text style={{ color: colors.muted, marginBottom: 4 }}>
                      Estado: {order.status || "—"}
                    </Text>

                    <Text style={{ color: colors.muted, marginBottom: 4 }}>
                      Total vendor: ${order.vendor_total ?? 0}
                    </Text>

                    <Text style={{ color: colors.muted }}>
                      Ítems: {order.items_count ?? 0}
                    </Text>
                  </View>
                ))
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
                  marginBottom: 12,
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
