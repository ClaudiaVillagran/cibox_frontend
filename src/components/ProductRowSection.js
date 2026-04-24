import { FlatList, Platform, ScrollView, View } from "react-native";
import ProductCard from "./ProductCard";
import { colors, spacing } from "../constants/theme";
import AppText from "./AppText";

export default function ProductRowSection({
  title,
  products = [],
  onPressProduct,
  onAddToCart,
  addingProductId,
}) {
  if (!products.length) return null;

  const renderCard = (item, index) => (
    <View
      key={item._id}
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
  );

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {!!title && (
        <AppText
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 12,
          }}
        >
          {title}
        </AppText>
      )}

      {Platform.OS === "web" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={{
            paddingHorizontal: 2,
            paddingRight: spacing.md,
          }}
          style={{ overflow: "auto" }}
        >
          {products.map((item, index) => renderCard(item, index))}
        </ScrollView>
      ) : (
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
          renderItem={({ item, index }) => renderCard(item, index)}
        />
      )}
    </View>
  );
}