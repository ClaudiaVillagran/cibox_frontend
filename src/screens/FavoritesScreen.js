import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  View,
} from "react-native";
import { getFavorites, removeFavorite } from "../services/favoriteService";
import { showAppAlert } from "../utils/appAlerts";
import useAuthStore from "../store/authStore";
import AppText from "../components/AppText";

export default function FavoritesScreen({ navigation }) {
  const { token } = useAuthStore();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getFavorites();
      const items = data?.items || [];
      setFavorites(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log(
        "GET FAVORITES ERROR:",
        error?.response?.data || error.message,
      );
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRemove = async (productId) => {
    if (!token) {
      navigation.navigate("Auth");
      return;
    }

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

  if (!token) {
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
          <AppText
            style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
          >
            Inicia sesión
          </AppText>

          <AppText
            style={{ color: "#666", textAlign: "center", marginBottom: 18 }}
          >
            Debes iniciar sesión para ver tus favoritos.
          </AppText>

          <Pressable
            onPress={() => navigation.navigate("Auth")}
            style={{
              backgroundColor: "#4E9B27",
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <AppText style={{ color: "#fff", fontWeight: "800" }}>
              Iniciar sesión
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <AppText
            style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
          >
            No tienes favoritos
          </AppText>

          <AppText style={{ color: "#666", textAlign: "center" }}>
            Guarda productos para revisarlos más tarde.
          </AppText>
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
          const product = item?.product_id || item?.product || item;
          const productId = product?._id || item?.product_id;
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
                <AppText
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}
                >
                  {productName}
                </AppText>

                <AppText style={{ color: "#666", marginBottom: 12 }}>
                  ${price}
                </AppText>
              </Pressable>

              <Pressable onPress={() => handleRemove(productId)}>
                <AppText style={{ color: "red", fontWeight: "bold" }}>
                  Quitar de favoritos
                </AppText>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
