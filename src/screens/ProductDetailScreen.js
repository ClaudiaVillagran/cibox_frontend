import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import ProductRowSection from "../components/ProductRowSection";
import { colors, radius, spacing } from "../constants/theme";
import { addItemToCart } from "../services/cartService";
import { addItemToPantry } from "../services/pantryService";
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
import { getProductById, getRelatedProducts } from "../services/productService";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { token } = useAuthStore();
  const isWeb = Platform.OS === "web";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [addingToPantry, setAddingToPantry] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const { loadCartSummary } = useCartStore();

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surface,
    color: colors.text,
  };

  const requireAuth = () => {
    showAppAlert(
      "Inicia sesión",
      "Debes iniciar sesión para usar esta función"
    );
    navigation.navigate("Auth");
  };

  const fetchProduct = async () => {
    try {
      const data = await getProductById(productId);
      const item = data?.data || data?.product || data;
      setProduct(item);
    } catch (error) {
      console.log(
        "PRODUCT DETAIL ERROR:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      setRelatedLoading(true);
      const data = await getRelatedProducts(productId, { limit: 8 });
      const items = data?.related_products || [];
      setRelatedProducts(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log(
        "RELATED PRODUCTS ERROR:",
        error?.response?.data || error.message
      );
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
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
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!token) {
      setMyReview(null);
      setReviewRating("5");
      setReviewComment("");
      return;
    }

    try {
      const data = await getMyReviewByProduct(productId);
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
        error?.response?.data || error.message
      );
      setMyReview(null);
      setReviewRating("5");
      setReviewComment("");
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const data = await checkFavorite(productId);
      const favoriteValue =
        data?.is_favorite ?? data?.isFavorite ?? data?.favorite ?? false;
      setIsFavorite(!!favoriteValue);
    } catch (error) {
      console.log(
        "CHECK FAVORITE ERROR:",
        error?.response?.data || error.message
      );
      setIsFavorite(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product?._id) return;

    try {
      setAdding(true);

      await addItemToCart({
        productId: product._id,
        quantity: selectedQuantity,
      });

      await loadCartSummary();
      showAppAlert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      console.log("ADD TO CART ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo agregar al carrito"
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAddToPantry = async () => {
    if (!token) {
      requireAuth();
      return;
    }

    if (!product?._id) return;

    try {
      setAddingToPantry(true);

      await addItemToPantry({
        productId: product._id,
        quantity: 1,
        frequency: "monthly",
      });

      showAppAlert("Éxito", "Producto agregado a la despensa");
    } catch (error) {
      console.log(
        "ADD TO PANTRY ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo agregar a la despensa"
      );
    } finally {
      setAddingToPantry(false);
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
        error?.response?.data || error.message
      );
      showAppAlert("Error", "No se pudo actualizar favorito");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      requireAuth();
      return;
    }

    const ratingNumber = Number(reviewRating);

    if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
      showAppAlert("Error", "La calificación debe ser entre 1 y 5");
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
        showAppAlert("Éxito", "Reseña actualizada");
      } else {
        await createReview({
          productId,
          rating: ratingNumber,
          comment: reviewComment,
        });
        showAppAlert("Éxito", "Reseña creada");
      }

      await fetchMyReview();
      await fetchReviews();
    } catch (error) {
      console.log(
        "SUBMIT REVIEW ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo guardar la reseña"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!token) {
      requireAuth();
      return;
    }

    try {
      setReviewSubmitting(true);
      await deleteMyReview(productId);
      setMyReview(null);
      setReviewRating("5");
      setReviewComment("");
      await fetchReviews();
      showAppAlert("Éxito", "Reseña eliminada");
    } catch (error) {
      console.log(
        "DELETE REVIEW ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo eliminar la reseña"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDecreaseQuantity = () => {
    const minQty = selectedTier?.min_qty || 1;

    setSelectedQuantity((prev) => {
      if (prev <= minQty) return minQty;
      return prev - 1;
    });
  };

  const handleIncreaseQuantity = () => {
    setSelectedQuantity((prev) => prev + 1);
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
  }, [productId]);

  useEffect(() => {
    fetchFavoriteStatus();
  }, [productId]);

  useEffect(() => {
    fetchMyReview();
  }, [productId, token]);

  useEffect(() => {
    if (product?.pricing?.tiers?.length) {
      const firstTier = product.pricing.tiers[0];
      setSelectedTier(firstTier);
      setSelectedQuantity(firstTier.min_qty || 1);
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    } else if (product?.thumbnail) {
      setSelectedImage(product.thumbnail);
    }
  }, [product]);

  const imageList = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    if (product?.thumbnail) {
      return [product.thumbnail];
    }
    return [];
  }, [product]);

  const boxItems = useMemo(() => {
    if (product?.product_type !== "box") return [];
    if (!Array.isArray(product?.box_items)) return [];
    return product.box_items.filter((item) => item?.product_id);
  }, [product]);

  if (loading) {
    return (
      <ScreenContainer maxWidth={1200}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!product) {
    return (
      <ScreenContainer maxWidth={1200}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: colors.text }}>
            No se pudo cargar el producto
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const baseTierPrice = product?.pricing?.tiers?.[0]?.price || 0;
  const selectedTierPrice = selectedTier?.price || baseTierPrice || 0;
  const estimatedSubtotal = selectedTierPrice * selectedQuantity;
  const baseSubtotal = baseTierPrice * selectedQuantity;
  const estimatedSavings =
    selectedTierPrice < baseTierPrice ? baseSubtotal - estimatedSubtotal : 0;

  const renderBoxContents = () => {
    if (product?.product_type !== "box" || !boxItems.length) return null;

    return (
      <View style={cardStyle}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Qué contiene esta caja
        </Text>

        <Text
          style={{
            color: colors.muted,
            marginBottom: 16,
            lineHeight: 22,
          }}
        >
          Esta caja incluye los siguientes productos:
        </Text>

        {boxItems.map((item, index) => {
          const childProduct = item.product_id;
          const image =
            childProduct?.thumbnail ||
            childProduct?.images?.[0] ||
            "https://via.placeholder.com/120";

          const unitPrice = childProduct?.pricing?.tiers?.[0]?.price || 0;

          return (
            <View
              key={`${childProduct?._id || index}-${index}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: radius.md,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {item.quantity} x {childProduct?.name || "Producto"}
                </Text>

                {childProduct?.brand ? (
                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    Marca: {childProduct.brand}
                  </Text>
                ) : null}

                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 13,
                  }}
                >
                  Precio referencia: ${unitPrice}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPurchaseCard = () => (
    <View
      style={{
        ...cardStyle,
        ...(isWeb
          ? {
              position: "sticky",
              top: 24,
              alignSelf: "flex-start",
            }
          : {}),
      }}
    >
      <Text
        style={{
          fontSize: isWeb ? 30 : 28,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {product.name}
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 4,
        }}
      >
        ${selectedTierPrice || "—"}
      </Text>

      <Text style={{ color: colors.muted, marginBottom: 14 }}>
        {product?.product_type === "box"
          ? "Precio de la caja completa"
          : "Precio por unidad según opción seleccionada"}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {(product?.reviews_count ?? 0) > 0 ? (
          <View
            style={{
              backgroundColor: "#111",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              ⭐ {(product?.average_rating ?? 0).toFixed(1)} ·{" "}
              {product?.reviews_count} reseñas
            </Text>
          </View>
        ) : null}

        {(product?.pricing?.tiers?.length || 0) > 1 ? (
          <View
            style={{
              backgroundColor: "#0f766e",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              Pack disponible
            </Text>
          </View>
        ) : null}

        {product?.cibox_plus?.enabled ? (
          <View
            style={{
              backgroundColor: "#7c3aed",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              Beneficio Cibox+
            </Text>
          </View>
        ) : null}

        {product?.product_type === "box" ? (
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              Caja CIBOX
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={{ color: colors.muted, marginBottom: 6 }}>
        Categoría: {product?.category?.name || "Sin categoría"}
      </Text>

      <Text style={{ color: colors.muted, marginBottom: 18 }}>
        Puntuación promedio: {product?.average_rating ?? 0} · Reseñas:{" "}
        {product?.reviews_count ?? 0}
      </Text>

      {(product?.pricing?.tiers?.length || 0) > 0 ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: colors.text,
              marginBottom: 12,
              fontSize: 16,
            }}
          >
            {product?.product_type === "box"
              ? "Opciones de compra"
              : "Opciones de precio"}
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.muted,
                marginBottom: 10,
              }}
            >
              Cantidad seleccionada: {selectedQuantity}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={handleDecreaseQuantity}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
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
                  minWidth: 30,
                  textAlign: "center",
                  marginRight: 12,
                }}
              >
                {selectedQuantity}
              </Text>

              <Pressable
                onPress={handleIncreaseQuantity}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
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

            {selectedTier?.min_qty > 1 ? (
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Mínimo para este tier: {selectedTier.min_qty} unidades
              </Text>
            ) : null}
          </View>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: 12,
              backgroundColor: "#fafafa",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Resumen estimado
            </Text>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              {product?.product_type === "box"
                ? `Precio por caja: $${selectedTierPrice}`
                : `Precio unitario: $${selectedTierPrice}`}
            </Text>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              Cantidad: {selectedQuantity}
            </Text>

            <Text
              style={{
                color: colors.text,
                fontWeight: "700",
                marginBottom: estimatedSavings > 0 ? 4 : 0,
              }}
            >
              Subtotal estimado: ${estimatedSubtotal}
            </Text>

            {estimatedSavings > 0 ? (
              <Text style={{ color: colors.success, fontSize: 12 }}>
                Ahorro estimado vs precio base: ${estimatedSavings}
              </Text>
            ) : null}
          </View>

          {product.pricing.tiers.map((tier, index) => {
            const isSelected = selectedTier?.min_qty === tier.min_qty;
            const savingsPerUnit =
              tier.min_qty > 1 ? Math.max(baseTierPrice - tier.price, 0) : 0;
            const savingsAtMinimum =
              tier.min_qty > 1 ? savingsPerUnit * tier.min_qty : 0;

            return (
              <Pressable
                key={`${tier.min_qty}-${index}`}
                onPress={() => {
                  setSelectedTier(tier);
                  setSelectedQuantity(tier.min_qty || 1);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? colors.text : colors.border,
                  borderRadius: radius.md,
                  padding: 12,
                  marginBottom: 10,
                  backgroundColor: isSelected ? "#f5f5f5" : colors.surface,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "700",
                    }}
                  >
                    {tier.min_qty > 1
                      ? `${product?.product_type === "box" ? "Pack de cajas" : "Pack"} · ${tier.min_qty} unidades`
                      : tier.label || "Unidad"}
                  </Text>

                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "800",
                    }}
                  >
                    ${tier.price}
                  </Text>
                </View>

                {tier.min_qty > 1 ? (
                  <>
                    <Text style={{ color: colors.success, fontSize: 12 }}>
                      Mejor precio por volumen
                    </Text>

                    {savingsAtMinimum > 0 ? (
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Ahorras ${savingsAtMinimum}
                      </Text>
                    ) : null}
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <AppButton
        title={adding ? "Agregando..." : "Agregar al carrito"}
        onPress={handleAddToCart}
        disabled={adding}
      />

      <AppButton
        title={
          addingToPantry ? "Agregando a despensa..." : "Agregar a despensa"
        }
        onPress={handleAddToPantry}
        disabled={addingToPantry}
        variant="secondary"
        style={{ marginTop: 12 }}
      />

      <AppButton
        title={
          favoriteLoading
            ? "Cargando..."
            : isFavorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"
        }
        onPress={handleToggleFavorite}
        disabled={favoriteLoading}
        variant="secondary"
        style={{ marginTop: 12 }}
      />
    </View>
  );

  if (!isWeb) {
    return (
      <ScreenContainer maxWidth={720}>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <View style={cardStyle}>
            {Array.isArray(product?.images) && product.images.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {product.images.map((url, index) => (
                  <View
                    key={`${url}-${index}`}
                    style={{
                      width: 260,
                      height: 260,
                      marginRight: 10,
                      borderRadius: radius.md,
                      backgroundColor: "#fff",
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{ uri: url }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            ) : product?.thumbnail ? (
              <View
                style={{
                  width: "100%",
                  height: 260,
                  marginBottom: 16,
                  borderRadius: radius.md,
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: product.thumbnail }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {renderPurchaseCard()}

            <Text
              style={{
                fontWeight: "700",
                color: colors.text,
                marginTop: 18,
                marginBottom: 8,
                fontSize: 16,
              }}
            >
              Descripción
            </Text>

            <Text
              style={{
                color: colors.muted,
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              {product.description || "Sin descripción"}
            </Text>

            {renderBoxContents()}
          </View>

          <View style={{ height: spacing.md }} />

          <View style={cardStyle}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 14,
              }}
            >
              Tu reseña
            </Text>

            {!token ? (
              <Text style={{ color: colors.muted }}>
                Inicia sesión para crear tu reseña.
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    marginBottom: 6,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Puntuación (1 a 5)
                </Text>

                <TextInput
                  value={reviewRating}
                  onChangeText={setReviewRating}
                  keyboardType="numeric"
                  placeholder="5"
                  style={{
                    ...inputStyle,
                    marginBottom: 14,
                  }}
                />

                <Text
                  style={{
                    marginBottom: 6,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Comentario
                </Text>

                <TextInput
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="Escribe tu reseña"
                  multiline
                  style={{
                    ...inputStyle,
                    minHeight: 110,
                    textAlignVertical: "top",
                    marginBottom: 14,
                  }}
                />

                <AppButton
                  title={
                    reviewSubmitting
                      ? "Guardando..."
                      : myReview?._id
                        ? "Actualizar reseña"
                        : "Crear reseña"
                  }
                  onPress={handleSubmitReview}
                  disabled={reviewSubmitting}
                />

                {myReview?._id ? (
                  <AppButton
                    title="Eliminar reseña"
                    onPress={handleDeleteReview}
                    disabled={reviewSubmitting}
                    variant="secondary"
                    style={{ marginTop: 10 }}
                  />
                ) : null}
              </>
            )}
          </View>

          <View style={{ height: spacing.md }} />

          <View style={cardStyle}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 14,
              }}
            >
              Reseñas del producto
            </Text>

            {reviewsLoading ? (
              <Text style={{ color: colors.muted }}>Cargando reseñas...</Text>
            ) : !reviews.length ? (
              <Text style={{ color: colors.muted }}>
                Este producto aún no tiene reseñas.
              </Text>
            ) : (
              reviews.map((item) => (
                <View
                  key={item._id}
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 12,
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      marginBottom: 4,
                      color: colors.text,
                    }}
                  >
                    Rating: {item.rating}/5
                  </Text>

                  <Text style={{ color: colors.muted, marginBottom: 4 }}>
                    {item.comment || "Sin comentario"}
                  </Text>

                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {item.user_id?.name ||
                      item.user?.name ||
                      item.user?.email ||
                      "Cliente"}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={{ height: spacing.md }} />

          <View style={{ marginTop: spacing.md }}>
            {relatedLoading ? (
              <Text style={{ color: colors.muted }}>
                Cargando productos relacionados...
              </Text>
            ) : (
              <ProductRowSection
                title="Productos relacionados"
                products={relatedProducts}
                onPressProduct={(item) =>
                  navigation.push("ProductDetail", { productId: item._id })
                }
              />
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={1280}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.lg,
            marginBottom: spacing.lg,
          }}
        >
          <View style={{ flex: 1.15 }}>
            <View style={{ ...cardStyle, padding: spacing.lg }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: spacing.md,
                }}
              >
                <View style={{ width: 88 }}>
                  {imageList.map((url, index) => {
                    const isActive = selectedImage === url;

                    return (
                      <Pressable
                        key={`${url}-${index}`}
                        onPress={() => setSelectedImage(url)}
                        style={{
                          width: 88,
                          height: 88,
                          marginBottom: 10,
                          borderRadius: radius.md,
                          borderWidth: 1,
                          borderColor: isActive ? colors.primary : colors.border,
                          backgroundColor: "#fff",
                          overflow: "hidden",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={{ uri: url }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <View
                  style={{
                    flex: 1,
                    minHeight: 520,
                    borderRadius: radius.lg,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: spacing.lg,
                  }}
                >
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      style={{ width: "100%", height: 480 }}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
              </View>
            </View>

            <View style={{ height: spacing.md }} />

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Descripción
              </Text>

              <Text
                style={{
                  color: colors.muted,
                  lineHeight: 24,
                }}
              >
                {product.description || "Sin descripción"}
              </Text>
            </View>

            {product?.product_type === "box" && boxItems.length ? (
              <>
                <View style={{ height: spacing.md }} />
                {renderBoxContents()}
              </>
            ) : null}

            <View style={{ height: spacing.md }} />

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 14,
                }}
              >
                Tu reseña
              </Text>

              {!token ? (
                <Text style={{ color: colors.muted }}>
                  Inicia sesión para crear tu reseña.
                </Text>
              ) : (
                <>
                  <Text
                    style={{
                      marginBottom: 6,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Puntuación (1 a 5)
                  </Text>

                  <TextInput
                    value={reviewRating}
                    onChangeText={setReviewRating}
                    keyboardType="numeric"
                    placeholder="5"
                    style={{
                      ...inputStyle,
                      marginBottom: 14,
                    }}
                  />

                  <Text
                    style={{
                      marginBottom: 6,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Comentario
                  </Text>

                  <TextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Escribe tu reseña"
                    multiline
                    style={{
                      ...inputStyle,
                      minHeight: 110,
                      textAlignVertical: "top",
                      marginBottom: 14,
                    }}
                  />

                  <AppButton
                    title={
                      reviewSubmitting
                        ? "Guardando..."
                        : myReview?._id
                          ? "Actualizar reseña"
                          : "Crear reseña"
                    }
                    onPress={handleSubmitReview}
                    disabled={reviewSubmitting}
                  />

                  {myReview?._id ? (
                    <AppButton
                      title="Eliminar reseña"
                      onPress={handleDeleteReview}
                      disabled={reviewSubmitting}
                      variant="secondary"
                      style={{ marginTop: 10 }}
                    />
                  ) : null}
                </>
              )}
            </View>

            <View style={{ height: spacing.md }} />

            <View style={cardStyle}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 14,
                }}
              >
                Reseñas del producto
              </Text>

              {reviewsLoading ? (
                <Text style={{ color: colors.muted }}>Cargando reseñas...</Text>
              ) : !reviews.length ? (
                <Text style={{ color: colors.muted }}>
                  Este producto aún no tiene reseñas.
                </Text>
              ) : (
                reviews.map((item) => (
                  <View
                    key={item._id}
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: 14,
                      marginTop: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        marginBottom: 4,
                        color: colors.text,
                      }}
                    >
                      Rating: {item.rating}/5
                    </Text>

                    <Text style={{ color: colors.muted, marginBottom: 4 }}>
                      {item.comment || "Sin comentario"}
                    </Text>

                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {item.user_id?.name ||
                        item.user?.name ||
                        item.user?.email ||
                        "Cliente"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={{ width: 390 }}>
            {renderPurchaseCard()}
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          {relatedLoading ? (
            <Text style={{ color: colors.muted }}>
              Cargando productos relacionados...
            </Text>
          ) : (
            <ProductRowSection
              title="Productos relacionados"
              products={relatedProducts}
              onPressProduct={(item) =>
                navigation.push("ProductDetail", { productId: item._id })
              }
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}