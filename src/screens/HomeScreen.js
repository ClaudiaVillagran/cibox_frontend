import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { getProducts } from "../services/productService";
import { useLayoutEffect } from "react";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontWeight: "bold" }}>Notif</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Favorites")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontWeight: "bold" }}>Favoritos</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Orders")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontWeight: "bold" }}>Órdenes</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Cart")}>
            <Text style={{ fontWeight: "bold" }}>Carrito</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const items = data.data || data.products || data;
      setProducts(items);
    } catch (error) {
      console.log("ERROR PRODUCTS:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{
        padding: 16,
        width: "100%",
        maxWidth: 900,
        alignSelf: "center",
      }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item._id })
          }
          style={{
            padding: 16,
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>

          <Text>${item?.pricing?.tiers?.[0]?.price || "—"}</Text>

          <Text style={{ color: "#666", marginTop: 4 }}>
            {item.category?.name}
          </Text>
        </Pressable>
      )}
    />
  );
}
