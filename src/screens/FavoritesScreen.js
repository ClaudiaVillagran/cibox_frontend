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
import { getFavorites, removeFavorite } from "../services/favoriteService";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      const items =
        data?.favorites || data?.data?.favorites || data?.data || data || [];
      setFavorites(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log(
        "GET FAVORITES ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudieron cargar los favoritos");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFavorite(productId);
      await fetchFavorites();
    } catch (error) {
      console.log(
        "REMOVE FAVORITE ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudo quitar de favoritos");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!favorites.length) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            No tienes favoritos
          </Text>
          <Text style={{ color: "#666", textAlign: "center" }}>
            Guarda productos para revisarlos más tarde.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 16,
          width: "100%",
          maxWidth: 900,
          alignSelf: "center",
        }}
        renderItem={({ item }) => {
          const product = item?.product_id;

          const productId = product?._id;
          const productName = product?.name || "Producto";

          const price = product?.pricing?.tiers?.[0]?.price ?? "—";

          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e8e8e8",
                borderRadius: 14,
                padding: 16,
                marginBottom: 12,
                backgroundColor: "#fff",
              }}
            >
              <Pressable
                onPress={() =>
                  productId &&
                  navigation.navigate("ProductDetail", { productId })
                }
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}
                >
                  {productName}
                </Text>

                <Text style={{ color: "#666", marginBottom: 12 }}>
                  ${price}
                </Text>
              </Pressable>

              <Pressable onPress={() => handleRemove(productId)}>
                <Text style={{ color: "red", fontWeight: "bold" }}>
                  Quitar de favoritos
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
