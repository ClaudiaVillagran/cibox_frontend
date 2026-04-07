import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  Image,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import {
  getCustomBox,
  removeCustomBoxItem,
  updateCustomBoxItemQuantity,
} from "../services/customBoxService";
import useCartStore from "../store/cartStore";
import { showAppAlert } from "../utils/appAlerts";

export default function CartScreen({ navigation }) {
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const { loadCartSummary } = useCartStore();

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
  };

  const fetchBox = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomBox();
      console.log(data);
      setBox(data);
      await loadCartSummary();
    } catch (error) {
      console.log(
        "GET CUSTOM BOX ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [loadCartSummary]);

  const handleIncrease = async (item) => {
    try {
      setUpdatingId(item.product_id);

      await updateCustomBoxItemQuantity({
        productId: item.product_id,
        quantity: item.quantity + 1,
      });

      await fetchBox();
    } catch (error) {
      console.log("UPDATE ITEM ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo actualizar la cantidad");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      await handleRemove(item.product_id);
      return;
    }

    try {
      setUpdatingId(item.product_id);

      await updateCustomBoxItemQuantity({
        productId: item.product_id,
        quantity: item.quantity - 1,
      });

      await fetchBox();
    } catch (error) {
      console.log("UPDATE ITEM ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo actualizar la cantidad");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);
      await removeCustomBoxItem(productId);
      await fetchBox();
    } catch (error) {
      console.log("REMOVE ITEM ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo eliminar el producto");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchBox();
  }, [fetchBox]);

  const items = box?.items || [];
  const total = box?.total || 0;

  if (loading) {
    return (
      <ScreenContainer maxWidth={900}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!items.length) {
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
              fontSize: 24,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Tu carrito está vacío
          </Text>

          <Text
            style={{
              color: colors.muted,
              marginBottom: 20,
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            Agrega productos desde el catálogo para comenzar tu compra.
          </Text>

          <AppButton
            title="Ir al catálogo"
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "HomeTab" })
            }
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={900}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
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
              Mi carrito
            </Text>

            <Text style={{ color: colors.muted, fontSize: 15 }}>
              Revisa tus productos antes de continuar al checkout.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          console.log(item);
          const isUpdating = updatingId === item.product_id;
          const hasDiscount =
            item.discount_applied &&
            item.original_unit_price &&
            item.original_unit_price > item.unit_price;

          const savingsPerUnit = hasDiscount
            ? item.original_unit_price - item.unit_price
            : 0;

          const totalSavings = hasDiscount ? savingsPerUnit * item.quantity : 0;

          return (
            <View
              style={{
                ...cardStyle,
                marginBottom: spacing.md,
              }}
            >
              {item.thumbnail || item.image || item.product?.thumbnail ? (
                <View
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: radius.md,
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={{
                      uri:
                        item.thumbnail || item.image || item.product?.thumbnail,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {item.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {item.tier_label ? (
                  <View
                    style={{
                      backgroundColor: "#111",
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 999,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {item.tier_label}
                    </Text>
                  </View>
                ) : null}

                {item.discount_applied ? (
                  <View
                    style={{
                      backgroundColor: "#0f766e",
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 999,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {item.discount_source || "descuento"} -
                      {item.discount_percent || 0}%
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Cantidad: {item.quantity}
              </Text>

              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Precio unitario: ${item.unit_price}
              </Text>

              {item.original_unit_price &&
              item.original_unit_price !== item.unit_price ? (
                <Text style={{ color: colors.muted, marginBottom: 4 }}>
                  Precio original: ${item.original_unit_price}
                </Text>
              ) : null}

              {totalSavings > 0 ? (
                <Text style={{ color: colors.success, marginBottom: 6 }}>
                  Ahorro total en este producto: ${totalSavings}
                </Text>
              ) : null}

              <Text
                style={{
                  marginBottom: 14,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Subtotal: ${item.subtotal}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  rowGap: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    onPress={() => handleDecrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#f0f0f0",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      -
                    </Text>
                  </Pressable>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                      minWidth: 20,
                      textAlign: "center",
                      marginRight: 12,
                    }}
                  >
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() => handleIncrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#f0f0f0",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => handleRemove(item.product_id)}>
                  <Text
                    style={{
                      color: colors.danger,
                      fontWeight: "700",
                    }}
                  >
                    Eliminar
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View
            style={{
              ...cardStyle,
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Total: ${total}
            </Text>

            <AppButton
              title="Continuar al checkout"
              onPress={() => navigation.navigate("Checkout")}
            />
          </View>
        }
      />
    </ScreenContainer>
  );
}
