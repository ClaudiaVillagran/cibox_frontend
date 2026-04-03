import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  getCustomBox,
  removeCustomBoxItem,
  updateCustomBoxItemQuantity,
} from "../services/customBoxService";

export default function CartScreen({ navigation }) {
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBox = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomBox();
      setBox(data);
    } catch (error) {
      console.log(
        "GET CUSTOM BOX ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert("Error", "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleIncrease = async (item) => {
    console.log(item);
    try {
      setUpdatingId(item.product_id);

      await updateCustomBoxItemQuantity({
        productId: item.product_id,
        quantity: item.quantity + 1,
      });

      await fetchBox();
    } catch (error) {
      console.log("UPDATE ITEM ERROR:", error?.response?.data || error.message);
      Alert.alert("Error", "No se pudo actualizar la cantidad");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      handleRemove(item.product_id);
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
      Alert.alert("Error", "No se pudo actualizar la cantidad");
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
      Alert.alert("Error", "No se pudo eliminar el producto");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchBox();
  }, [fetchBox]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const items = box?.items || [];
  const total = box?.total || 0;

  if (!items.length) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Tu carrito está vacío
        </Text>

        <Text style={{ color: "#666", marginBottom: 20, textAlign: "center" }}>
          Agrega productos desde el catálogo para comenzar tu compra.
        </Text>

        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={{
            backgroundColor: "#111",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Ir al catálogo
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        maxWidth: 900,
        alignSelf: "center",
        padding: 16,
      }}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isUpdating = updatingId === item.product_id;

          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}
              >
                {item.name}
              </Text>

              <Text style={{ color: "#666", marginBottom: 4 }}>
                Tier: {item.tier_label || "—"}
              </Text>

              <Text style={{ color: "#666", marginBottom: 4 }}>
                Precio unitario: ${item.price ?? item.unit_price ?? "—"}
              </Text>

              {item.discount_applied ? (
                <Text style={{ color: "#0a7", marginBottom: 4 }}>
                  Descuento {item.discount_source}: -{item.discount_percent}%
                </Text>
              ) : null}

              <Text style={{ color: "#666" }}>
                Subtotal: ${item.subtotal ?? item.original_subtotal ?? "—"}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => handleDecrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#eee",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>-</Text>
                  </Pressable>

                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() => handleIncrease(item)}
                    disabled={isUpdating}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#eee",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>+</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => handleRemove(item.product_id)}>
                  <Text style={{ color: "red", fontWeight: "bold" }}>
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
              marginTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#eee",
              paddingTop: 16,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}
            >
              Total: ${total}
            </Text>

            <Pressable
              onPress={() => navigation.navigate("Checkout")}
              style={{
                backgroundColor: "#111",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Continuar al checkout
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
