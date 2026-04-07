import { Image, Pressable, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../constants/theme';

export default function ProductCard({ product, onPress, compact = false }) {
  const tiers = product?.pricing?.tiers || [];
  const basePrice = tiers?.[0]?.price ?? null;
  const hasPackTier = tiers.length > 1;

  const averageRating = product?.average_rating ?? 0;
  const reviewsCount = product?.reviews_count ?? 0;
  const hasReviews = reviewsCount > 0;

  const ciboxPlusEnabled = !!product?.cibox_plus?.enabled;
  const imageUrl = product?.thumbnail || product?.images?.[0] || null;

  const badgeStyle = (backgroundColor, textColor = '#fff') => ({
    backgroundColor,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        ...shadows.card,
      }}
    >
      {imageUrl ? (
        <View
          style={{
            width: '100%',
            height: compact ? 180 : 220,
            borderRadius: radius.md,
            backgroundColor: '#fff',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="contain"
          />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 6,
        }}
      >
        {hasReviews ? (
          <View style={badgeStyle('#111')}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              ⭐ {averageRating.toFixed(1)} · {reviewsCount}
            </Text>
          </View>
        ) : null}

        {hasPackTier ? (
          <View style={badgeStyle('#0f766e')}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              Pack disponible
            </Text>
          </View>
        ) : null}

        {ciboxPlusEnabled ? (
          <View style={badgeStyle('#7c3aed')}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              Cibox+
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={{
          fontSize: compact ? 16 : 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {product?.name}
      </Text>

      <Text
        style={{
          fontSize: compact ? 15 : 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {basePrice ? `$${basePrice}` : '—'}
      </Text>

      <Text style={{ color: colors.muted }}>
        {product?.category?.name || 'Sin categoría'}
      </Text>
    </Pressable>
  );
}