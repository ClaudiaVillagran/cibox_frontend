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
import { colors, radius, spacing, shadows } from "../constants/theme";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";

export default function NotificationsScreen({ navigation }) {
  const { token } = useAuthStore();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(!!token);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getNotifications({
        unreadOnly: activeFilter === "unread",
        limit: 50,
      });

      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(data?.unread_count ?? 0);
    } catch (error) {
      console.log(
        "GET NOTIFICATIONS ERROR:",
        error?.response?.data || error.message
      );
      showAppAlert("Error", "No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, token]);

  const handleMarkOne = async (notificationId, isRead) => {
    if (!token) {
      navigation.navigate("Auth");
      return;
    }

    if (isRead) return;

    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.log(
        "MARK NOTIFICATION ERROR:",
        error?.response?.data || error.message
      );
      showAppAlert("Error", "No se pudo marcar la notificación");
    }
  };

  const handleMarkAll = async () => {
    if (!token) {
      navigation.navigate("Auth");
      return;
    }

    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (error) {
      console.log(
        "MARK ALL NOTIFICATIONS ERROR:",
        error?.response?.data || error.message
      );
      showAppAlert("Error", "No se pudieron marcar todas");
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  };

  const renderNotification = ({ item }) => {
    const title = item?.title || item?.type || "Notificación";
    const message = item?.message || "Sin detalle";
    const isRead = item?.is_read;
    const createdAt = item?.created_at
      ? new Date(item.created_at).toLocaleString()
      : "";

    return (
      <Pressable
        onPress={() => handleMarkOne(item._id, isRead)}
        style={{
          ...cardStyle,
          backgroundColor: isRead ? colors.surface : "#f3f4f6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.text,
              flex: 1,
              marginRight: 12,
            }}
          >
            {title}
          </Text>

          {!isRead ? (
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: colors.primaryText,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Nueva
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={{
            color: colors.muted,
            marginBottom: 8,
            lineHeight: 20,
          }}
        >
          {message}
        </Text>

        <Text style={{ color: colors.muted, fontSize: 12 }}>{createdAt}</Text>
      </Pressable>
    );
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
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: colors.text,
                textAlign: "center",
                marginBottom: spacing.sm,
              }}
            >
              Inicia sesión para ver tus notificaciones
            </Text>

            <Text
              style={{
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: spacing.lg,
              }}
            >
              Aquí verás novedades importantes sobre tus compras, tu cuenta y el
              estado de tus pedidos.
            </Text>

            <AppButton
              title="Iniciar sesión"
              onPress={() => navigation.navigate("Auth")}
            />

            <AppButton
              title="Volver al catálogo"
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "HomeTab" })
              }
              variant="secondary"
              style={{ marginTop: spacing.sm }}
            />
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
          <Text style={{ marginTop: spacing.sm, color: colors.muted }}>
            Cargando notificaciones...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Notificaciones
            </Text>

            <Text style={{ color: colors.muted, marginBottom: spacing.md }}>
              No leídas: {unreadCount}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.md,
              }}
            >
              <Pressable
                onPress={() => setActiveFilter("all")}
                style={{
                  backgroundColor:
                    activeFilter === "all" ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: radius.md,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color:
                      activeFilter === "all"
                        ? colors.primaryText
                        : colors.primary,
                    fontWeight: "700",
                  }}
                >
                  Todas
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveFilter("unread")}
                style={{
                  backgroundColor:
                    activeFilter === "unread" ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: radius.md,
                }}
              >
                <Text
                  style={{
                    color:
                      activeFilter === "unread"
                        ? colors.primaryText
                        : colors.primary,
                    fontWeight: "700",
                  }}
                >
                  No leídas
                </Text>
              </Pressable>
            </View>

            <AppButton
              title={markingAll ? "Marcando..." : "Marcar todas como leídas"}
              onPress={handleMarkAll}
              disabled={markingAll || unreadCount === 0}
            />
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: spacing.xl,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              No hay notificaciones
            </Text>
            <Text
              style={{
                color: colors.muted,
                textAlign: "center",
                maxWidth: 420,
              }}
            >
              Cuando ocurran eventos importantes, aparecerán aquí.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}