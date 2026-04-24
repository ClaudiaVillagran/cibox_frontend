import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { getPantry, movePantryItemToCart } from "../services/pantryService";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";
import { colors, spacing, radius, shadows } from "../constants/theme";
import AppText from "../components/AppText";

export default function PantryScreen({ navigation }) {
  const { token } = useAuthStore();

  const [pantry, setPantry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);

  const fetchPantry = useCallback(async () => {
    if (!token) {
      setPantry(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getPantry();
      setPantry(data);
    } catch (error) {
      console.log("GET PANTRY ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo cargar la despensa");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleMoveToCart = async (productId) => {
    if (!token) {
      showAppAlert("Inicia sesión", "Debes iniciar sesión para usar tu despensa");
      navigation.navigate("Auth");
      return;
    }

    try {
      setMovingId(productId);
      await movePantryItemToCart(productId);
      showAppAlert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      console.log(
        "MOVE PANTRY TO CART ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo mover al carrito"
      );
    } finally {
      setMovingId(null);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, [fetchPantry]);

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.card,
            }}
          >
            <AppText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: colors.text,
                marginBottom: spacing.sm,
                textAlign: "center",
              }}
            >
              Inicia sesión para ver tu despensa
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                textAlign: "center",
                marginBottom: spacing.lg,
                lineHeight: 22,
              }}
            >
              Guarda productos frecuentes y mantén una lista recurrente de compra
              para agregarlos fácilmente cuando quieras.
            </AppText>

            <Pressable
              onPress={() => navigation.navigate("Auth")}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.lg,
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
                paddingHorizontal: spacing.lg,
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
      </SafeAreaView>
    );
  }

  const items = pantry?.items || [];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText
            style={{
              marginTop: spacing.sm,
              color: colors.muted,
            }}
          >
            Cargando despensa...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (!items.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
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
              Tu despensa está vacía
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                textAlign: "center",
                marginBottom: spacing.lg,
                lineHeight: 22,
              }}
            >
              Agrega productos para mantener una lista recurrente de compra.
            </AppText>

            <Pressable
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "HomeTab" })
              }
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.lg,
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => String(item.product_id || index)}
        contentContainerStyle={{
          padding: spacing.md,
          width: "100%",
          maxWidth: 900,
          alignSelf: "center",
          paddingBottom: spacing.xl,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <AppText
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: spacing.xs,
              }}
            >
              Mi despensa
            </AppText>

            <AppText
              style={{
                color: colors.muted,
                fontSize: 15,
              }}
            >
              Guarda productos frecuentes y agrégalos al carrito cuando quieras.
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          const isMoving = movingId === item.product_id;

          return (
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                ...shadows.card,
              }}
            >
              <AppText
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: spacing.xs,
                }}
              >
                {item.name}
              </AppText>

              <AppText
                style={{
                  color: colors.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Cantidad: {item.quantity}
              </AppText>

              <AppText
                style={{
                  color: colors.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Frecuencia: {item.frequency || "monthly"}
              </AppText>

              <AppText
                style={{
                  color: colors.muted,
                  marginBottom: spacing.md,
                }}
              >
                Precio referencia: ${item.price ?? "—"}
              </AppText>

              <Pressable
                onPress={() => handleMoveToCart(item.product_id)}
                disabled={isMoving}
                style={{
                  backgroundColor: isMoving ? colors.muted : colors.primary,
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
                  {isMoving ? "Agregando..." : "Agregar al carrito"}
                </AppText>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}