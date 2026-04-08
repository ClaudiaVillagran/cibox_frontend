import { FlatList, Text, View } from "react-native";
import ProductCard from "./ProductCard";
import { colors, spacing } from "../constants/theme";

export default function ProductRowSection({
  title,
  products = [],
  onPressProduct,
  onAddToCart,
  addingProductId,
}) {
  if (!products.length) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {!!title && (
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>
      )}

      <FlatList
        data={products}
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 2,
          paddingRight: spacing.md,
        }}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: 260,
              marginRight: index === products.length - 1 ? 0 : spacing.md,
            }}
          >
            <ProductCard
              product={item}
              compact
              onPress={() => onPressProduct(item)}
              onAddToCart={onAddToCart}
              adding={addingProductId === item._id}
            />
          </View>
        )}
      />
    </View>
  );
}