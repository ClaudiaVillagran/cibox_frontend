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

  const fetchBox = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomBox();
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

  const formatPrice = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("es-CL");
  };

  const cardStyle = {
    borderWidth: 1,
    borderColor: "#DDE7D7",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  };

  if (loading) {
    return (
      <ScreenContainer maxWidth={900}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4E9B27" />
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
            Agrega productos de tu supermercado CIBOX para comenzar tu compra.
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
        showsVerticalScrollIndicator={false}
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
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {(item.thumbnail || item.image || item.product?.thumbnail) ? (
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 16,
                      backgroundColor: "#F7F8F5",
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      borderWidth: 1,
                      borderColor: "#EEF3EA",
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

                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
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
                      marginBottom: 6,
                    }}
                  >
                    {item.tier_label ? (
                      <View
                        style={{
                          backgroundColor: "#4E9B27",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 999,
                          marginRight: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "800",
                          }}
                        >
                          {item.tier_label}
                        </Text>
                      </View>
                    ) : null}

                    {item.discount_applied ? (
                      <View
                        style={{
                          backgroundColor: "#C3E062",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 999,
                          marginRight: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "#234014",
                            fontSize: 10,
                            fontWeight: "800",
                          }}
                        >
                          {item.discount_source || "descuento"} -{item.discount_percent || 0}%
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "800",
                      marginBottom: 2,
                    }}
                  >
                    ${formatPrice(item.unit_price)}
                  </Text>

                  {item.original_unit_price &&
                  item.original_unit_price !== item.unit_price ? (
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 12,
                        textDecorationLine: "line-through",
                        marginBottom: 4,
                      }}
                    >
                      ${formatPrice(item.original_unit_price)}
                    </Text>
                  ) : null}

                  {totalSavings > 0 ? (
                    <Text
                      style={{
                        color: "#4E9B27",
                        fontSize: 12,
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      Ahorras ${formatPrice(totalSavings)}
                    </Text>
                  ) : null}

                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                    }}
                  >
                    Subtotal:{" "}
                    <Text style={{ color: colors.text, fontWeight: "800" }}>
                      ${formatPrice(item.subtotal)}
                    </Text>
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#EEF3EA",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  rowGap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F6F8F3",
                    borderRadius: 999,
                    paddingVertical: 4,
                    paddingHorizontal: 4,
                  }}
                >
                  <Pressable
                    onPress={() => handleDecrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#E8F1E1",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#2E5F16",
                      }}
                    >
                      -
                    </Text>
                  </Pressable>

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: colors.text,
                      minWidth: 30,
                      textAlign: "center",
                      marginHorizontal: 8,
                    }}
                  >
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() => handleIncrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#4E9B27",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#fff",
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => handleRemove(item.product_id)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#C2410C",
                      fontWeight: "700",
                      fontSize: 13,
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
              marginTop: 4,
              backgroundColor: "#F7FAF4",
              borderColor: "#DDE7D7",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginBottom: 6,
              }}
            >
              Total de tu compra
            </Text>

            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              ${formatPrice(total)}
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