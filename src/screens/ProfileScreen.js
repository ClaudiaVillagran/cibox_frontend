import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import { colors, radius, spacing, shadows } from "../constants/theme";
import { getMyProfile } from "../services/userService";
import VendorDashboardScreen from "./VendorDashboardScreen";
import { showAppAlert } from "../utils/appAlerts";
import AppText from "../components/AppText";

export default function ProfileScreen({ navigation }) {
  const { user, logout, token } = useAuthStore();
  const { cartCount } = useCartStore();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!!token);

  const isVendor = profile?.role === "vendor";

  const cardStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.card,
    }),
    []
  );

  const halfCardStyle = useMemo(
    () => ({
      ...cardStyle,
      width: "48%",
    }),
    [cardStyle]
  );

  const getDisplayName = useCallback(() => {
    return (
      profile?.name ||
      profile?.full_name ||
      profile?.first_name ||
      profile?.username ||
      profile?.email?.split("@")?.[0] ||
      "Usuario"
    );
  }, [profile]);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getMyProfile();
      const profileData = data?.user || data?.data?.user || data?.data || data;

      setProfile(profileData || null);
    } catch (error) {
      console.log("GET PROFILE ERROR:", error?.response?.data || error.message);

      if (error?.response?.status === 401) {
        await logout();
        navigation.replace("Auth");
        return;
      }

      showAppAlert("Error", "No se pudo cargar el perfil");
      setProfile(user || null);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigation, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
              Inicia sesión para ver tu perfil
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: spacing.lg,
              }}
            >
              Accede a tu cuenta para revisar tus datos, tus órdenes y tus accesos
              rápidos en CIBOX.
            </AppText>

            <AppButton
              title="Iniciar sesión"
              onPress={() => navigation.navigate("Auth")}
            />

            <AppButton
              title="Volver al catálogo"
              onPress={() => navigation.navigate("Inicio")}
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText
            style={{
              marginTop: spacing.sm,
              color: colors.muted,
            }}
          >
            Cargando perfil...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <AppText
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Mi perfil
        </AppText>

        <AppText
          style={{
            color: colors.muted,
            marginBottom: spacing.md,
          }}
        >
          Revisa tu cuenta y tus accesos rápidos.
        </AppText>

        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Hola, {getDisplayName()}
          </AppText>

          <AppText style={{ color: colors.muted }}>
            Email: {profile?.email || "—"}
          </AppText>
        </View>

        {isVendor && (
          <View style={{ marginBottom: spacing.md }}>
            <VendorDashboardScreen hideHeaderInfo />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: spacing.sm,
          }}
        >
          <View style={halfCardStyle}>
            <AppText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.muted,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Rol actual
            </AppText>

            <AppText
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              {profile?.role || "—"}
            </AppText>
          </View>

          <View style={halfCardStyle}>
            <AppText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.muted,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Carrito
            </AppText>

            <AppText
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              {cartCount} Producto(s)
            </AppText>
          </View>
        </View>

        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Accesos rápidos
          </AppText>

          <AppButton title="Refrescar perfil" onPress={loadProfile} />

          <AppButton
            title="Ver notificaciones"
            onPress={() => navigation.navigate("Notifications")}
            variant="secondary"
            style={{ marginTop: 10 }}
          />

          <AppButton
            title="Ver mis órdenes"
            onPress={() => navigation.navigate("OrdersTab")}
            variant="secondary"
            style={{ marginTop: 10 }}
          />

          <AppButton
            title="Ver favoritos"
            onPress={() => navigation.navigate("FavoritesTab")}
            variant="secondary"
            style={{ marginTop: 10 }}
          />

          <AppButton
            title="Ver despensa"
            onPress={() => navigation.navigate("PantryTab")}
            variant="secondary"
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Sesión
          </AppText>

          <AppButton
            title="Cerrar sesión"
            onPress={async () => {
              await logout();
              navigation.replace("Auth");
            }}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}