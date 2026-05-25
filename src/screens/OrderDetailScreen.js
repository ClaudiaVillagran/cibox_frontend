import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import { getOrderById } from "../services/orderService";
import { addItemToCart } from "../services/cartService";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import { showAppAlert } from "../utils/appAlerts";

// ── Configuración del timeline ────────────────────────────────────────────────
const STEPS = [
  { key: "pending",   label: "Pedido recibido",  icon: "receipt-outline",          color: "#f59e0b" },
  { key: "paid",      label: "Pago confirmado",   icon: "checkmark-circle-outline", color: "#3b82f6" },
  { key: "preparing", label: "Preparando",        icon: "cube-outline",             color: "#8b5cf6" },
  { key: "shipped",   label: "En camino",         icon: "car-outline",              color: "#06b6d4" },
  { key: "delivered", label: "Entregado",         icon: "home-outline",             color: "#16a34a" },
];
const STATUS_ORDER    = ["pending", "paid", "preparing", "shipped", "delivered"];
const ACTIVE_STATUSES = ["pending", "paid", "preparing", "shipped"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d   = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatPrice = (n) => "$" + Number(n || 0).toLocaleString("es-CL");

const getStatusMeta = (status) => {
  const map = {
    pending:   { label: "Pendiente",   bg: "#fef3c7", text: "#92400e" },
    paid:      { label: "Pagada",      bg: "#dbeafe", text: "#1d4ed8" },
    preparing: { label: "Preparando",  bg: "#ede9fe", text: "#6d28d9" },
    shipped:   { label: "En camino",   bg: "#cffafe", text: "#0e7490" },
    delivered: { label: "Entregada",   bg: "#dcfce7", text: "#166534" },
    cancelled: { label: "Cancelada",   bg: "#fee2e2", text: "#b91c1c" },
    refunded:  { label: "Reembolsada", bg: "#f3f4f6", text: "#374151" },
  };
  return map[status] || { label: status || "Sin estado", bg: "#f3f4f6", text: "#374151" };
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function OrderDetailScreen({ route, navigation }) {
  const { token }           = useAuthStore();
  const { loadCartSummary } = useCartStore();
  const orderId             = route?.params?.orderId;

  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [copied, setCopied]       = useState(false);
  const refreshTimer              = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    if (!orderId || !token) { setLoading(false); return; }
    try {
      const data = await getOrderById(orderId);
      const item = data?.order || data?.data?.order || data?.data || data;
      setOrder(item);
    } catch (err) {
      console.log("ORDER DETAIL ERROR:", err?.response?.data || err.message);
      showAppAlert("Error", "No se pudo cargar la orden");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Auto-refresh cada 30 s mientras la orden está activa
  useEffect(() => {
    clearInterval(refreshTimer.current);
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return;
    refreshTimer.current = setInterval(fetchOrder, 30_000);
    return () => clearInterval(refreshTimer.current);
  }, [order?.status, fetchOrder]);

  // ── Volver a pedir ────────────────────────────────────────────────────────
  const handleReorder = async () => {
    if (!token) { navigation.navigate("Login"); return; }
    const items = Array.isArray(order?.items) ? order.items : [];
    if (!items.length) return;
    setAddingAll(true);
    try {
      for (const item of items) {
        if (!item.product_id) continue;
        await addItemToCart({ productId: item.product_id, quantity: item.quantity || 1 });
      }
      await loadCartSummary();
      showAppAlert("¡Listo!", "Productos añadidos al carrito");
      navigation.navigate("Cart");
    } catch {
      showAppAlert("Error", "No se pudieron agregar los productos");
    } finally {
      setAddingAll(false);
    }
  };

  // ── Copiar tracking ───────────────────────────────────────────────────────
  const handleCopyTracking = () => {
    const tn = order?.shipping?.tracking_number;
    if (!tn) return;
    Clipboard.setString(tn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Build timeline ────────────────────────────────────────────────────────
  const getStepTime = (stepKey) => {
    const history = Array.isArray(order?.status_history) ? order.status_history : [];
    const entry   = history.find((h) => h.status === stepKey);
    return entry?.changed_at ? formatDate(entry.changed_at) : null;
  };

  const buildSteps = () => {
    if (!order) return [];
    const norm = String(order.status || "").toLowerCase();
    if (norm === "cancelled") {
      return [
        { ...STEPS[0], done: true, active: false, time: getStepTime("pending") },
        {
          key: "cancelled", label: "Cancelada", icon: "close-circle-outline",
          color: "#ef4444", done: true, active: true,
          time: getStepTime("cancelled") || formatDate(order.cancelled_at),
        },
      ];
    }
    const currentIdx = STATUS_ORDER.indexOf(norm);
    return STEPS.map((step, i) => ({
      ...step,
      done:   currentIdx >= i,
      active: currentIdx === i,
      time:   getStepTime(step.key),
    }));
  };

  // ── Estados vacíos ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!token || !order) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <AppText style={{ color: colors.text, fontWeight: "700", textAlign: "center" }}>
            {!token ? "Inicia sesión para ver el detalle" : "No se encontró la orden"}
          </AppText>
          {!token && (
            <AppButton title="Iniciar sesión" onPress={() => navigation.navigate("Auth")} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  const statusMeta  = getStatusMeta(order.status);
  const steps       = buildSteps();
  const orderItems  = Array.isArray(order.items) ? order.items : [];
  const trackingNum = order.shipping?.tracking_number;
  const isCancelled = order.status === "cancelled";
  const isActive    = ACTIVE_STATUSES.includes(order.status);

  return (
    <ScreenContainer maxWidth={720}>
      {/* Volver */}
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back-outline" size={18} color={colors.text} />
        <AppText style={styles.backText}>Volver</AppText>
      </Pressable>

      <FlatList
        data={orderItems}
        keyExtractor={(item, i) => String(item.product_id || i)}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}

        ListHeaderComponent={
          <>
            {/* ── Cabecera ── */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <AppText style={styles.orderNumber}>
                  Orden #{String(order._id || "").slice(-6).toUpperCase()}
                </AppText>
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                  <AppText style={[styles.statusText, { color: statusMeta.text }]}>
                    {statusMeta.label}
                  </AppText>
                </View>
              </View>

              <AppText style={styles.mutedSm}>
                {formatDate(order.created_at) || "—"}
              </AppText>

              {isActive && (
                <View style={styles.refreshHint}>
                  <Ionicons name="refresh-outline" size={11} color={colors.primary} />
                  <AppText style={styles.refreshText}>
                    Se actualiza automáticamente cada 30 s
                  </AppText>
                </View>
              )}

              {order.cancellation_reason && (
                <View style={styles.cancelReason}>
                  <AppText style={styles.cancelReasonText}>
                    Motivo: {order.cancellation_reason}
                  </AppText>
                </View>
              )}
            </View>

            {/* ── Timeline ── */}
            <View style={styles.card}>
              <AppText style={styles.cardTitle}>Seguimiento del pedido</AppText>

              {steps.map((step, i) => {
                const isLast    = i === steps.length - 1;
                const isCancStep = step.key === "cancelled";
                const dotBg    = step.done
                  ? (isCancStep ? "#ef4444" : step.color)
                  : "#f3f4f6";
                const dotBorder = step.done
                  ? (isCancStep ? "#ef4444" : step.color)
                  : "#d1d5db";
                const lineColor = step.done && !isLast ? step.color : "#e5e7eb";

                return (
                  <View key={step.key}>
                    <View style={styles.stepRow}>
                      {/* Burbuja icono */}
                      <View style={styles.stepIconCol}>
                        <View style={[styles.stepDot, { backgroundColor: dotBg, borderColor: dotBorder }]}>
                          <Ionicons
                            name={step.icon}
                            size={13}
                            color={step.done ? "#fff" : "#9ca3af"}
                          />
                        </View>
                      </View>

                      {/* Texto */}
                      <View style={{ flex: 1, paddingVertical: 2 }}>
                        <AppText style={[
                          styles.stepLabel,
                          { color: step.done ? colors.text : colors.muted,
                            fontWeight: step.active ? "800" : step.done ? "700" : "500" },
                        ]}>
                          {step.label}
                          {step.active ? "  ●" : ""}
                        </AppText>
                        {step.time ? (
                          <AppText style={styles.stepTime}>{step.time}</AppText>
                        ) : step.done ? (
                          <AppText style={styles.stepTime}>En proceso</AppText>
                        ) : null}
                        {step.key === "shipped" && trackingNum && step.done && (
                          <AppText style={[styles.stepTime, { color: colors.primary }]}>
                            Seguimiento: {trackingNum}
                          </AppText>
                        )}
                      </View>
                    </View>

                    {!isLast && (
                      <View style={[styles.stepLine, { backgroundColor: lineColor }]} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* ── Tracking number ── */}
            {trackingNum && (
              <View style={styles.card}>
                <AppText style={styles.cardTitle}>Número de seguimiento</AppText>
                <View style={styles.trackingRow}>
                  <AppText style={styles.trackingNumber} numberOfLines={1}>
                    {trackingNum}
                  </AppText>
                  <Pressable onPress={handleCopyTracking} style={styles.copyBtn}>
                    <Ionicons
                      name={copied ? "checkmark-outline" : "copy-outline"}
                      size={15}
                      color={copied ? "#16a34a" : colors.primary}
                    />
                    <AppText style={[styles.copyText, copied && { color: "#16a34a" }]}>
                      {copied ? "Copiado" : "Copiar"}
                    </AppText>
                  </Pressable>
                </View>
                {order.shipping?.carrier && (
                  <AppText style={styles.mutedSm}>
                    Transportista: {order.shipping.carrier}
                  </AppText>
                )}
              </View>
            )}

            {/* ── Dirección ── */}
            <View style={styles.card}>
              <AppText style={styles.cardTitle}>Dirección de entrega</AppText>
              <AppText style={styles.mutedLine}>{order.shipping?.address || "—"}</AppText>
              {order.shipping?.addressLine2 ? (
                <AppText style={styles.mutedLine}>{order.shipping.addressLine2}</AppText>
              ) : null}
              <AppText style={styles.mutedLine}>
                {[order.shipping?.city, order.shipping?.region].filter(Boolean).join(", ")}
              </AppText>
              {order.shipping?.reference ? (
                <AppText style={styles.mutedLine}>Ref: {order.shipping.reference}</AppText>
              ) : null}
            </View>

            {/* ── Resumen de pago ── */}
            <View style={styles.card}>
              <AppText style={styles.cardTitle}>Resumen</AppText>

              <View style={styles.summaryRow}>
                <AppText style={styles.mutedSm}>Subtotal</AppText>
                <AppText style={styles.mutedSm}>{formatPrice(order.subtotal)}</AppText>
              </View>

              {Number(order.discount_amount) > 0 && (
                <View style={styles.summaryRow}>
                  <AppText style={[styles.mutedSm, { color: "#16a34a" }]}>Descuento</AppText>
                  <AppText style={[styles.mutedSm, { color: "#16a34a" }]}>
                    -{formatPrice(order.discount_amount)}
                  </AppText>
                </View>
              )}

              <View style={styles.summaryRow}>
                <AppText style={styles.mutedSm}>Despacho</AppText>
                <AppText style={styles.mutedSm}>
                  {Number(order.shipping_amount) === 0 ? "Gratis" : formatPrice(order.shipping_amount)}
                </AppText>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <AppText style={styles.totalLabel}>Total</AppText>
                <AppText style={styles.totalValue}>{formatPrice(order.total)}</AppText>
              </View>
            </View>

            {/* ── Título lista de productos ── */}
            <AppText style={[styles.cardTitle, { marginHorizontal: 2, marginBottom: 8 }]}>
              Productos ({orderItems.length})
            </AppText>
          </>
        }

        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText style={styles.productName}>{item.name || "Producto"}</AppText>
              {item.tier_label ? (
                <View style={styles.tierBadge}>
                  <AppText style={styles.tierText}>{item.tier_label}</AppText>
                </View>
              ) : null}
              <AppText style={styles.mutedSm}>x{item.quantity}</AppText>
              {item.discount_applied ? (
                <AppText style={{ fontSize: 11, color: "#16a34a" }}>
                  Descuento {item.discount_source || ""}: -{item.discount_percent || 0}%
                </AppText>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {item.discount_applied && item.original_subtotal ? (
                <AppText style={styles.originalPrice}>{formatPrice(item.original_subtotal)}</AppText>
              ) : null}
              <AppText style={styles.productSubtotal}>{formatPrice(item.subtotal)}</AppText>
            </View>
          </View>
        )}

        ListEmptyComponent={
          <View style={styles.card}>
            <AppText style={{ color: colors.muted }}>Esta orden no tiene productos.</AppText>
          </View>
        }

        ListFooterComponent={
          !isCancelled && orderItems.length > 0 ? (
            <Pressable
              onPress={handleReorder}
              disabled={addingAll}
              style={[styles.reorderBtn, addingAll && { opacity: 0.6 }]}
            >
              <Ionicons name="refresh-circle-outline" size={18} color="#fff" />
              <AppText style={styles.reorderText}>
                {addingAll ? "Agregando..." : "Volver a pedir"}
              </AppText>
            </Pressable>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backBtn: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginBottom: spacing.md,
  },
  backText: { fontSize: 14, fontWeight: "700", color: colors.text },

  card: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    padding: spacing.md, marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16, fontWeight: "800",
    color: colors.text, marginBottom: 12,
  },

  rowBetween: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  orderNumber: { fontSize: 20, fontWeight: "800", color: colors.text },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  statusText:  { fontSize: 12, fontWeight: "700" },

  refreshHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 10, backgroundColor: `${colors.primary}10`,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: "flex-start",
  },
  refreshText: { fontSize: 10, color: colors.primary, fontStyle: "italic" },

  cancelReason: {
    marginTop: 10, backgroundColor: "#fee2e2",
    borderRadius: 8, padding: 8,
  },
  cancelReasonText: { fontSize: 12, color: "#b91c1c" },

  // Timeline
  stepRow:     { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepIconCol: { width: 28, alignItems: "center" },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2,
  },
  stepLine:  { width: 2, height: 22, marginLeft: 13, marginVertical: 3 },
  stepLabel: { fontSize: 14 },
  stepTime:  { fontSize: 11, color: colors.muted, marginTop: 2 },

  // Tracking
  trackingRow: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 6,
  },
  trackingNumber: {
    fontSize: 17, fontWeight: "800",
    color: colors.text, letterSpacing: 1, flex: 1,
  },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, backgroundColor: `${colors.primary}12`,
  },
  copyText: { fontSize: 12, fontWeight: "700", color: colors.primary },

  mutedLine: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  mutedSm:   { color: colors.muted, fontSize: 13 },

  // Resumen
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 6,
  },
  summaryTotal: {
    borderTopWidth: 1, borderColor: colors.border,
    marginTop: 4, paddingTop: 10, marginBottom: 0,
  },
  totalLabel: { fontSize: 15, fontWeight: "800", color: colors.text },
  totalValue: { fontSize: 15, fontWeight: "800", color: colors.text },

  // Productos
  productCard: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: colors.surface,
    padding: spacing.md, marginBottom: 10,
  },
  productName:    { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
  tierBadge:      { alignSelf: "flex-start", backgroundColor: colors.text, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  tierText:       { fontSize: 10, fontWeight: "700", color: colors.surface },
  originalPrice:  { fontSize: 11, color: colors.muted, textDecorationLine: "line-through" },
  productSubtotal:{ fontSize: 15, fontWeight: "800", color: colors.text },

  // Volver a pedir
  reorderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: 14, marginTop: 8,
  },
  reorderText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
