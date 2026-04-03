import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
} from "react-native";
import { getProductById } from "../services/productService";
import { addItemToCustomBox } from "../services/customBoxService";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "../services/favoriteService";
import {
  createReview,
  deleteMyReview,
  getMyReviewByProduct,
  getReviewsByProduct,
  updateMyReview,
} from "../services/reviewService";
export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const fetchProduct = async () => {
    try {
      const data = await getProductById(productId);
      const item = data.data || data.product || data;
      setProduct(item);
    } catch (error) {
      console.log(
        "PRODUCT DETAIL ERROR:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const data = await getReviewsByProduct(productId);
      const items =
        data?.reviews || data?.data?.reviews || data?.data || data || [];

      setReviews(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log("GET REVIEWS ERROR:", error?.response?.data || error.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const data = await getMyReviewByProduct(productId);
      
        console.log(data);
      const item =
        data?.review || data?.data?.review || data?.data || data || null;


      if (item && item._id) {
        setMyReview(item);
        setReviewRating(String(item.rating ?? 5));
        setReviewComment(item.comment || "");
      } else {
        setMyReview(null);
        setReviewRating("5");
        setReviewComment("");
      }
    } catch (error) {
      console.log(
        "GET MY REVIEW ERROR:",
        error?.response?.data || error.message,
      );
      setMyReview(null);
    }
  };

  const handleSubmitReview = async () => {
    const ratingNumber = Number(reviewRating);

    if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
      Alert.alert("Error", "La calificación debe ser entre 1 y 5");
      return;
    }

    try {
      setReviewSubmitting(true);

      if (myReview?._id) {
        await updateMyReview({
          productId,
          rating: ratingNumber,
          comment: reviewComment,
        });
        Alert.alert("Éxito", "Reseña actualizada");
      } else {
        await createReview({
          productId,
          rating: ratingNumber,
          comment: reviewComment,
        });
        Alert.alert("Éxito", "Reseña creada");
      }

      await fetchMyReview();
      await fetchReviews();
    } catch (error) {
      console.log(
        "SUBMIT REVIEW ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo guardar la reseña",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      setReviewSubmitting(true);
      await deleteMyReview(productId);
      setMyReview(null);
      setReviewRating("5");
      setReviewComment("");
      await fetchReviews();
      Alert.alert("Éxito", "Reseña eliminada");
    } catch (error) {
      console.log(
        "DELETE REVIEW ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo eliminar la reseña",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const data = await checkFavorite(productId);
      const favoriteValue = data.is_favorite ?? false;

      setIsFavorite(!!favoriteValue);
    } catch (error) {
      console.log(
        "CHECK FAVORITE ERROR:",
        error?.response?.data || error.message,
      );
    }
  };
  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(productId);
        setIsFavorite(false);
      } else {
        await addFavorite(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.log(
        "TOGGLE FAVORITE ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert("Error", "No se pudo actualizar favorito");
    } finally {
      setFavoriteLoading(false);
    }
  };
  const handleAddToCart = async () => {
    if (!product?._id) return;
    console.log(product);
    try {
      setAdding(true);

      await addItemToCustomBox({
        productId: product._id,
        quantity: 1,
      });

      Alert.alert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      console.log("ADD TO CART ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo agregar al carrito",
      );
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchFavoriteStatus();
    fetchMyReview();
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No se pudo cargar el producto</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
        {product.name}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        ${product?.pricing?.tiers?.[0]?.price || "—"}
      </Text>

      <Text style={{ color: "#666", marginBottom: 16 }}>
        Categoría: {product?.category?.name || "Sin categoría"}
      </Text>

      <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Descripción</Text>

      <Text style={{ color: "#444", lineHeight: 22, marginBottom: 20 }}>
        {product.description || "Sin descripción"}
      </Text>

      <Button
        title={adding ? "Agregando..." : "Agregar al carrito"}
        onPress={handleAddToCart}
        disabled={adding}
      />
      <View style={{ height: 12 }} />

      <Button
        title={
          favoriteLoading
            ? "Cargando..."
            : isFavorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"
        }
        onPress={handleToggleFavorite}
        disabled={favoriteLoading}
      />
      <View style={{ height: 24 }} />

      <View
        style={{
          borderWidth: 1,
          borderColor: "#e8e8e8",
          borderRadius: 14,
          padding: 16,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 14 }}>
          Tu reseña
        </Text>

        <Text style={{ marginBottom: 6, fontWeight: "600" }}>
          Rating (1 a 5)
        </Text>
        <TextInput
          value={reviewRating}
          onChangeText={setReviewRating}
          keyboardType="numeric"
          placeholder="5"
          style={{
            borderWidth: 1,
            borderColor: "#dcdcdc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
          }}
        />

        <Text style={{ marginBottom: 6, fontWeight: "600" }}>Comentario</Text>
        <TextInput
          value={reviewComment}
          onChangeText={setReviewComment}
          placeholder="Escribe tu reseña"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#dcdcdc",
            borderRadius: 10,
            padding: 12,
            minHeight: 100,
            textAlignVertical: "top",
            marginBottom: 14,
          }}
        />

        <Pressable
          onPress={handleSubmitReview}
          disabled={reviewSubmitting}
          style={{
            backgroundColor: "#111",
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: myReview?._id ? 10 : 0,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {reviewSubmitting
              ? "Guardando..."
              : myReview?._id
                ? "Actualizar reseña"
                : "Crear reseña"}
          </Text>
        </Pressable>

        {myReview?._id ? (
          <Pressable
            onPress={handleDeleteReview}
            disabled={reviewSubmitting}
            style={{
              borderWidth: 1,
              borderColor: "red",
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "red", fontWeight: "bold" }}>
              Eliminar reseña
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ height: 24 }} />

      <View
        style={{
          borderWidth: 1,
          borderColor: "#e8e8e8",
          borderRadius: 14,
          padding: 16,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 14 }}>
          Reseñas del producto
        </Text>

        {reviewsLoading ? (
          <Text>Cargando reseñas...</Text>
        ) : !reviews.length ? (
          <Text style={{ color: "#666" }}>
            Este producto aún no tiene reseñas.
          </Text>
        ) : (
          reviews.map((item) => (
            <View
              key={item._id}
              style={{
                borderTopWidth: 1,
                borderTopColor: "#eee",
                paddingTop: 12,
                marginTop: 12,
              }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                Rating: {item.rating}/5
              </Text>

              <Text style={{ color: "#444", marginBottom: 4 }}>
                {item.comment || "Sin comentario"}
              </Text>

              <Text style={{ color: "#777", fontSize: 12 }}>
                {item.user_id?.name || item.user_id?.email || "Usuario"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
