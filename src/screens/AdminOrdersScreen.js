import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import { colors, radius, spacing } from "../constants/theme";
import { adminGetOrders, adminUpdateOrderStatus } from "../services/orderService";
import { showAppAlert } from "../utils/appAlerts";

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: null,        label: "Todas" },
  { key: "pending",   label: "Pendientes" },
  { key: "paid",      label: "Pagadas" },
  { key: "preparing", label: "Preparando" },
  { key: "shipped",   label: "En camino" },
  { key: "delivered", label: "Entregadas" },
  { key: "cancelled", label: "Canceladas" },
];

const NEXT_STATUS = {
  pending:   [{ value: "paid",      label: "✅ Marcar pagada" }],
  paid:      [{ value: "preparing", label: "📦 Comenzar preparación" }],
  preparing: [{ value: "shipped",   label: "🚚 Marcar en camino" }],
  shipped:   [{ value: "delivered", label: "🏠 Marcar entregada" }],
  delivered: [],
  cancelled: [],
  refunded:  [],
};

const STATUS_META = {
  pending:   { label: "Pendiente",   bg: "#fef3c7", text: "#92400e" },
  paid:      { label: "Pagada",      bg: "#dbeafe", text: "#1d4ed8" },
  preparing: { label: "Preparando",  bg: "#ede9fe", text: "#6d28d9" },
  shipped:   { label: "En camino",   bg: "#cffafe", text: "#0e7490" },
  delivered: { label: "Entregada",   bg: "#dcfce7", text: "#166534" },
  cancelled: { label: "Cancelada",   bg: "#fee2e2", text: "#b91c1c" },
  refunded:  { label: "Reembolsada", bg: "#f3f4f6", text: "#374151" },
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt  = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const formatPrice = (n) => "$" + Number(n || 0).toLocaleString("es-CL");

// ── Componente ────────────────────────────────────────────────────────────────
export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal de cambio de estado
  const [modalOrder, setModalOrder]     = useState(null);
  const [newStatus, setNewStatus]       = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [noteInput, setNoteInput]       = useState("");
  const [updating, setUpdating]         = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async ({ pageNum = 1, status = filterStatus, replace = true } = {}) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const data = await adminGetOrders({ page: pageNum, limit: 20, status });
      const list = Array.isArray(data?.orders) ? data.orders : [];
      const totalPages = data?.pagination?.pages || 1;

      setOrders((prev) => (replace ? list : [...prev, ...list]));
      setPage(pageNum);
      setHasMore(pageNum < totalPages);
    } catch (err) {
      console.log("ADMIN ORDERS ERROR:", err?.response?.data || err.message);
      showAppAlert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders({ pageNum: 1, replace: true });
  }, [filterStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders({ pageNum: 1, replace: true });
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchOrders({ pageNum: page + 1, replace: false });
  };

  // ── Modal: abrir ──────────────────────────────────────────────────────────
  const openModal = (order) => {
    setModalOrder(order);
    setNewStatus(NEXT_STATUS[order.status]?.[0]?.value || "");
    setTrackingInput(order.shipping?.tracking_number || "");
    setNoteInput("");
  };

  const closeModal = () => {
    setModalOrder(null);
    setNewStatus("");
    setTrackingInput("");
    setNoteInput("");
  };

  // ── Actualizar estado ─────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!newStatus || !modalOrder) return;
    setUpdating(true);
    try {
      await adminUpdateOrderStatus(modalOrder._id, {
        status: newStatus,
        tracking_number: trackingInput.trim() || null,
        note: noteInput.trim() || null,
      });

      // Actualizar en la lista local sin refetch
      setOrders((prev) =>
        prev.map((o) =>
          o._id === modalOrder._id
            ? { ...o, status: newStatus, shipping: { ...o.shipping, tracking_number: trackingInput.trim() || o.shipping?.tracking_number } }
            : o
        )
      );

      showAppAlert("¡Listo!", `Orden actualizada a "${STATUS_META[newStatus]?.label || newStatus}"`);
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "No se pudo actualizar";
      showAppAlert("Error", msg);
    } finally {
      setUpdating(false);
    }
  };

  // ── Render item ───────────────────────────────────────────────────────────
  const renderOrder = ({ item }) => {
    const meta      = STATUS_META[item.status] || STATUS_META.pending;
    const nextSteps = NEXT_STATUS[item.status] || [];
    const canUpdate = nextSteps.length > 0;

    return (
      <View style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.orderId}>
              #{String(item._id).slice(-6).toUpperCase()}
            </AppText>
            <AppText style={styles.orderDate}>{formatDate(item.created_at)}</AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <AppText style={[styles.statusText, { color: meta.text }]}>
              {meta.label}
            </AppText>
          </View>
        </View>

        {/* Info cliente */}
        {item.customer?.fullName && (
          <AppText style={styles.customerName}>
            <Ionicons name="person-outline" size={12} color={colors.muted} />{" "}
            {item.customer.fullName}
          </AppText>
        )}
        {item.customer?.email && (
          <AppText style={styles.customerEmail}>{item.customer.email}</AppText>
        )}

        {/* Total + items */}
        <View style={styles.orderMeta}>
          <AppText style={styles.orderTotal}>{formatPrice(item.total)}</AppText>
          <AppText style={styles.orderItems}>
            {Array.isArray(item.items) ? item.items.length : 0} producto(s)
          </AppText>
        </View>

        {/* Tracking si existe */}
        {item.shipping?.tracking_number && (
          <View style={styles.trackingRow}>
            <Ionicons name="car-outline" size={13} color={colors.primary} />
            <AppText style={styles.trackingText}>
              {item.shipping.tracking_number}
            </AppText>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.orderActions}>
          <Pressable
            onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
            style={styles.viewBtn}
          >
            <Ionicons name="eye-outline" size={14} color={colors.primary} />
            <AppText style={styles.viewBtnText}>Ver detalle</AppText>
          </Pressable>

          {canUpdate && (
            <Pressable onPress={() => openModal(item)} style={styles.updateBtn}>
              <Ionicons name="arrow-forward-circle-outline" size={14} color="#fff" />
              <AppText style={styles.updateBtnText}>Cambiar estado</AppText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer maxWidth={760} padded>

      {/* Título */}
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Panel de órdenes</AppText>
        <Pressable onPress={handleRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Filtros de estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={String(f.key)}
            onPress={() => setFilterStatus(f.key)}
            style={[
              styles.filterChip,
              filterStatus === f.key && styles.filterChipActive,
            ]}
          >
            <AppText style={[
              styles.filterText,
              filterStatus === f.key && styles.filterTextActive,
            ]}>
              {f.label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <AppText style={{ color: colors.muted, textAlign: "center" }}>
                No hay órdenes {filterStatus ? `con estado "${STATUS_META[filterStatus]?.label}"` : ""}.
              </AppText>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
            ) : null
          }
        />
      )}

      {/* ── Modal cambio de estado ── */}
      <Modal visible={!!modalOrder} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Header modal */}
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                Orden #{String(modalOrder?._id || "").slice(-6).toUpperCase()}
              </AppText>
              <Pressable onPress={closeModal}>
                <Ionicons name="close-outline" size={22} color={colors.text} />
              </Pressable>
            </View>

            <AppText style={styles.modalSub}>
              Estado actual:{" "}
              <AppText style={{ fontWeight: "800", color: STATUS_META[modalOrder?.status]?.text }}>
                {STATUS_META[modalOrder?.status]?.label}
              </AppText>
            </AppText>

            {/* Selector de nuevo estado */}
            <AppText style={styles.inputLabel}>Nuevo estado</AppText>
            <View style={styles.statusOptions}>
              {(NEXT_STATUS[modalOrder?.status] || []).map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setNewStatus(opt.value)}
                  style={[
                    styles.statusOption,
                    newStatus === opt.value && styles.statusOptionActive,
                  ]}
                >
                  <AppText style={[
                    styles.statusOptionText,
                    newStatus === opt.value && { color: "#fff" },
                  ]}>
                    {opt.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {/* Tracking number (solo para shipped) */}
            {newStatus === "shipped" && (
              <>
                <AppText style={styles.inputLabel}>Número de tracking</AppText>
                <TextInput
                  value={trackingInput}
                  onChangeText={setTrackingInput}
                  placeholder="Ej: BX123456789"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </>
            )}

            {/* Nota */}
            <AppText style={styles.inputLabel}>Nota interna (opcional)</AppText>
            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Ej: Sale hoy en la tarde"
              placeholderTextColor={colors.muted}
              style={[styles.input, { minHeight: 60 }]}
              multiline
            />

            {/* Botón confirmar */}
            <Pressable
              onPress={handleUpdate}
              disabled={!newStatus || updating}
              style={[styles.confirmBtn, (!newStatus || updating) && { opacity: 0.5 }]}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                  <AppText style={styles.confirmBtnText}>Confirmar cambio</AppText>
                </>
              )}
            </Pressable>

            <Pressable onPress={closeModal} style={styles.cancelBtn}>
              <AppText style={styles.cancelBtnText}>Cancelar</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  pageTitle: { fontSize: 22, fontWeight: "900", color: colors.text },
  refreshBtn: {
    padding: 8, borderRadius: 10,
    backgroundColor: `${colors.primary}12`,
  },

  // Filtros
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  filterText: { fontSize: 13, fontWeight: "600", color: colors.muted },
  filterTextActive: { color: "#fff", fontWeight: "700" },

  // Card de orden
  orderCard: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    padding: spacing.md, marginBottom: 12,
  },
  orderHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  orderId:     { fontSize: 16, fontWeight: "800", color: colors.text },
  orderDate:   { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:  { fontSize: 11, fontWeight: "700" },

  customerName:  { fontSize: 13, color: colors.text, fontWeight: "600", marginBottom: 1 },
  customerEmail: { fontSize: 12, color: colors.muted, marginBottom: 8 },

  orderMeta: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  orderTotal: { fontSize: 17, fontWeight: "800", color: colors.text },
  orderItems: { fontSize: 12, color: colors.muted },

  trackingRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginBottom: 10, backgroundColor: `${colors.primary}10`,
    padding: 6, borderRadius: 8,
  },
  trackingText: { fontSize: 12, fontWeight: "700", color: colors.primary },

  orderActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  viewBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1,
    borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}08`,
  },
  viewBtnText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  updateBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5,
    paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.primary,
  },
  updateBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },

  emptyBox: {
    padding: spacing.xl, alignItems: "center",
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, backgroundColor: colors.surface,
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, width: "100%", maxWidth: 420,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  modalSub:   { fontSize: 13, color: colors.muted, marginBottom: 16 },

  inputLabel: {
    fontSize: 12, fontWeight: "700",
    color: colors.text, marginBottom: 6, marginTop: 12,
  },
  input: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 10,
    fontSize: 14, color: colors.text,
    backgroundColor: colors.background,
  },

  statusOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusOption: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.background,
  },
  statusOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusOptionText:   { fontSize: 13, fontWeight: "700", color: colors.text },

  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.primary,
    borderRadius: radius.md, paddingVertical: 13,
    marginTop: 20,
  },
  confirmBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  cancelBtn: {
    alignItems: "center", paddingVertical: 11, marginTop: 8,
  },
  cancelBtnText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
});
