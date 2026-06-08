import { Image, Platform, Pressable, View } from "react-native";
import { colors, radius, shadows, spacing } from "../constants/theme";
import AppText from "./AppText";

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  compact = false,
  mini = false,
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

  // Precio comparativo con supermercado
  const comparePrice = Number(product?.compare_price || 0);
  const hasComparison = comparePrice > 0 && basePrice !== null && comparePrice > basePrice;
  const savings = hasComparison ? comparePrice - basePrice : 0;
  const savingsPct = hasComparison ? Math.round((savings / comparePrice) * 100) : 0;

  const formatPrice = (value) => {
    if (value === null || value === undefined) return "—";
    return `$${Number(value).toLocaleString("es-CL")}`;
  };

  // Tamaños según modo
  const imageHeight = mini ? 120 : compact ? 180 : 220;
  const titleSize = mini ? 13 : compact ? 16 : 17;
  const priceSize = mini ? 15 : compact ? 18 : 20;
  const cardPadding = mini ? spacing.sm : spacing.md;

  const chipStyle = (backgroundColor) => ({
    backgroundColor,
    paddingHorizontal: mini ? 6 : 10,
    paddingVertical: mini ? 3 : 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "#ececec",
        borderRadius: radius.xl,
        padding: cardPadding,
        ...shadows.card,
      }}
    >
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        {/* Imagen */}
        <View
          style={{
            width: "100%",
            height: imageHeight,
            borderRadius: radius.lg,
            backgroundColor: "#f7f7f7",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: mini ? 8 : spacing.md,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "82%", height: "82%" }}
              resizeMode="contain"
            />
          ) : (
            <AppText style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
              Sin imagen
            </AppText>
          )}
        </View>

        {/* Chips — ocultos en mini para ahorrar espacio */}
        {!mini && (
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
                <AppText style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                  Pack disponible
                </AppText>
              </View>
            ) : null}
            {ciboxPlusEnabled ? (
              <View style={chipStyle("#6d28d9")}>
                <AppText style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                  Cibox+
                </AppText>
              </View>
            ) : null}
          </View>
        )}

        {/* Chips mini — solo íconos */}
        {mini && (hasPackTier || ciboxPlusEnabled) && (
          <View style={{ flexDirection: "row", marginBottom: 6, gap: 4 }}>
            {hasPackTier && (
              <View style={chipStyle(colors.primary)}>
                <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                  Pack
                </AppText>
              </View>
            )}
            {ciboxPlusEnabled && (
              <View style={chipStyle("#6d28d9")}>
                <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                  Cibox+
                </AppText>
              </View>
            )}
          </View>
        )}

        {/* Nombre */}
        <View style={{ marginBottom: 6 }}>
          <AppText
            numberOfLines={2}
            style={{
              fontSize: titleSize,
              fontWeight: "800",
              color: colors.text,
              lineHeight: mini ? 18 : 22,
            }}
          >
            {product?.name || "Producto"}
          </AppText>
        </View>

        {/* Precio */}
        <View style={{ marginBottom: 4 }}>
          {/* Precio supermercado tachado */}
          {hasComparison && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <AppText style={{
                fontSize: mini ? 11 : 13,
                color: colors.muted,
                textDecorationLine: "line-through",
              }}>
                {formatPrice(comparePrice)}
              </AppText>
              <View style={{
                backgroundColor: "#dcfce7",
                borderRadius: 999,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}>
                <AppText style={{ fontSize: 10, fontWeight: "800", color: "#16a34a" }}>
                  -{savingsPct}%
                </AppText>
              </View>
            </View>
          )}

          {/* Precio CIBOX */}
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <AppText style={{ fontSize: priceSize, fontWeight: "900", color: colors.text }}>
              {formatPrice(basePrice)}
            </AppText>
            {hasComparison && !mini && (
              <AppText style={{ fontSize: 11, color: "#16a34a", fontWeight: "700" }}>
                CIBOX
              </AppText>
            )}
          </View>

          {/* Ahorro en monto */}
          {hasComparison && !mini && (
            <AppText style={{ fontSize: 11, color: "#16a34a", fontWeight: "700", marginTop: 2 }}>
              Ahorras {formatPrice(savings)} vs supermercado
            </AppText>
          )}
        </View>

        {/* Categoría */}
        <View style={{ marginBottom: mini ? 6 : 6 }}>
          <AppText
            numberOfLines={1}
            style={{ color: colors.muted, fontSize: mini ? 12 : 14 }}
          >
            {product?.category?.name || "Sin categoría"}
          </AppText>
        </View>

        {/* Reseñas — ocultas en mini */}
        {!mini && (
          <View style={{ marginBottom: 14 }}>
            {hasReviews ? (
              <AppText style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
                {averageRating.toFixed(1)} · {reviewsCount} reseñas
              </AppText>
            ) : (
              <AppText style={{ color: colors.muted, fontSize: 12 }}>
                Aún sin reseñas
              </AppText>
            )}
          </View>
        )}
      </Pressable>

      {/* Botones */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#eeeeee",
          paddingTop: mini ? 8 : 12,
          gap: mini ? 6 : 10,
        }}
      >
        <Pressable
          onPress={() => onAddToCart?.(product)}
          disabled={adding}
          style={{
            backgroundColor: colors.primary,
            height: mini ? 34 : 42,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            opacity: adding ? 0.7 : 1,
          }}
        >
          <AppText style={{ color: "#fff", fontSize: mini ? 12 : 14, fontWeight: "700" }}>
            {adding ? "Agregando..." : "Añadir"}
          </AppText>
        </Pressable>

        {!mini && (
          <Pressable
            onPress={onPress}
            style={{ alignItems: "center", justifyContent: "center", minHeight: 20 }}
          >
            <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: "800" }}>
              Ver detalle
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}