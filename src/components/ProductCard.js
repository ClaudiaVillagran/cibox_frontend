import { Image, Pressable, Text, View } from "react-native";
import { colors, radius, shadows, spacing } from "../constants/theme";

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  compact = false,
  adding = false,
}) {
  const tiers = product?.pricing?.tiers || [];
  const basePrice = tiers?.[0]?.price ?? null;
  const hasPackTier = tiers.length > 1;

  const averageRating = Number(product?.average_rating ?? 0);
  const reviewsCount = Number(product?.reviews_count ?? 0);
  const hasReviews = reviewsCount > 0;

  const ciboxPlusEnabled = !!product?.cibox_plus?.enabled;
  const imageUrl = product?.thumbnail || product?.images?.[0] || null;

  const formatPrice = (value) => {
    if (value === null || value === undefined) return "—";
    return `$${Number(value).toLocaleString("es-CL")}`;
  };

  const chipStyle = (backgroundColor, textColor = "#fff") => ({
    backgroundColor,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "#ececec",
        borderRadius: radius.xl,
        padding: spacing.md,
        ...shadows.card,
      }}
    >
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            height: compact ? 180 : 220,
            borderRadius: radius.lg,
            backgroundColor: "#f7f7f7",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "82%",
                height: "82%",
              }}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={{
                color: colors.muted,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Sin imagen
            </Text>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            minHeight: 34,
            marginBottom: 8,
          }}
        >
          {hasPackTier ? (
            <View style={chipStyle(colors.primary)}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                Pack disponible
              </Text>
            </View>
          ) : null}

          {ciboxPlusEnabled ? (
            <View style={chipStyle("#6d28d9")}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                Cibox+
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={{
            minHeight: 52,
            maxHeight: 52,
            marginBottom: 8,
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              fontSize: compact ? 16 : 17,
              fontWeight: "800",
              color: colors.text,
              lineHeight: 22,
            }}
          >
            {product?.name || "Producto"}
          </Text>
        </View>

        <View
          style={{
            minHeight: 32,
            justifyContent: "flex-end",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: compact ? 18 : 20,
              fontWeight: "900",
              color: colors.text,
            }}
          >
            {formatPrice(basePrice)}
          </Text>
        </View>

        <View
          style={{
            minHeight: 22,
            justifyContent: "center",
            marginBottom: 6,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: colors.muted,
              fontSize: 14,
            }}
          >
            {product?.category?.name || "Sin categoría"}
          </Text>
        </View>

        <View
          style={{
            minHeight: 20,
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          {hasReviews ? (
            <Text
              numberOfLines={1}
              style={{
                color: colors.muted,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {averageRating.toFixed(1)} de valoración · {reviewsCount} reseñas
            </Text>
          ) : (
            <Text
              style={{
                color: colors.muted,
                fontSize: 12,
              }}
            >
              Aún sin reseñas
            </Text>
          )}
        </View>
      </Pressable>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#eeeeee",
          paddingTop: 12,
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => onAddToCart?.(product)}
          disabled={adding}
          style={{
            backgroundColor: colors.primary,
            minHeight: 42,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            opacity: adding ? 0.7 : 1,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            {adding ? "Agregando..." : "Añadir"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          style={{
            minHeight: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontWeight: "800",
            }}
          >
            Ver detalle
          </Text>
        </Pressable>
      </View>
    </View>
  );
}