import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { getOrderById } from "../services/orderService";

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      const item = data?.order || data?.data?.order || data?.data || data;
      setOrder(item);
      console.log(item);
    } catch (error) {
      console.log(
        "GET ORDER DETAIL ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert("Error", "No se pudo cargar la orden");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No se encontró la orden</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={order.items || []}
        keyExtractor={(item, index) => `${item.product_id || index}`}
        contentContainerStyle={{
          padding: 16,
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
              Orden #{order._id?.slice(-6)}
            </Text>

            <Text style={{ color: "#666", marginBottom: 4 }}>
              Estado: {order.status || "—"}
            </Text>

            <Text style={{ color: "#666", marginBottom: 4 }}>
              Total: ${order.total ?? "—"}
            </Text>

            <Text style={{ color: "#666" }}>
              Dirección: {order.shipping?.address || "—"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e8e8e8",
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 6 }}>
              {item.name || "Producto"}
            </Text>
            <Text style={{ color: "#666", marginBottom: 4 }}>
              Cantidad: {item.quantity ?? "—"}
            </Text>
            <Text style={{ color: "#666", marginBottom: 4 }}>
              Precio unitario: ${item.price ?? "—"}
            </Text>
            <Text style={{ color: "#666" }}>
              Subtotal: ${item.subtotal ?? item.original_subtotal ?? "—"}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
