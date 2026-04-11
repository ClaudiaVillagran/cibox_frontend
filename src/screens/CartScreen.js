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
import { colors, spacing } from "../constants/theme";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import useCartStore from "../store/cartStore";
import { showAppAlert } from "../utils/appAlerts";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const { loadCartSummary } = useCartStore();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      await loadCartSummary();
    } catch (error) {
      console.log("GET CART ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [loadCartSummary]);

  const handleIncrease = async (item) => {
    try {
      setUpdatingId(item.product_id);

      await updateCartItem({
        productId: item.product_id,
        quantity: item.quantity + 1,
      });

      await fetchCart();
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

      await updateCartItem({
        productId: item.product_id,
        quantity: item.quantity - 1,
      });

      await fetchCart();
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
      await removeCartItem(productId);
      await fetchCart();
    } catch (error) {
      console.log("REMOVE ITEM ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", "No se pudo eliminar el producto");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart?.items || [];
  const total = cart?.total || 0;

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
        keyExtractor={(item, index) => String(item.product_id || index)}
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

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "800",
                      marginBottom: 4,
                    }}
                  >
                    ${formatPrice(item.unit_price)}
                  </Text>

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