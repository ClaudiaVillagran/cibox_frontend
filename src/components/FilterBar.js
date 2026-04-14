import { Text, TextInput, Pressable, ScrollView, View } from "react-native";
import { colors, spacing, radius } from "../constants/theme";

export default function FilterBar({
  categories = [],
  selectedCategory = "",
  onSelectCategory,
  sort = "",
  onChangeSort,
  minPrice = "",
  maxPrice = "",
  onChangeMinPrice,
  onChangeMaxPrice,
  onClear,
}) {
  const sortOptions = [
    { label: "Más recientes", value: "newest" },
    { label: "Más antiguos", value: "oldest" },
    { label: "Precio ↑", value: "price_asc" },
    { label: "Precio ↓", value: "price_desc" },
  ];

  const chipStyle = (active = false) => ({
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primary : colors.surface,
    marginRight: 10,
  });

  const chipTextStyle = (active = false) => ({
    fontSize: 14,
    fontWeight: "700",
    color: active ? "#fff" : colors.text,
  });

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: spacing.md }}
        style={{ marginBottom: spacing.md }}
      >
        <Pressable
          onPress={() => onSelectCategory("")}
          style={chipStyle(selectedCategory === "")}
        >
          <Text style={chipTextStyle(selectedCategory === "")}>Todas</Text>
        </Pressable>

        {categories.map((category) => {
          const categoryId = category?._id || "";
          const isActive = selectedCategory === categoryId;

          return (
            <Pressable
              key={categoryId || category?.name}
              onPress={() => onSelectCategory(categoryId)}
              style={chipStyle(isActive)}
            >
              <Text style={chipTextStyle(isActive)}>{category?.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: spacing.md,
        }}
      >
        <TextInput
          value={minPrice}
          onChangeText={onChangeMinPrice}
          placeholder="Min"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={{
            flex: 1,
            height: 46,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: 14,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />

        <TextInput
          value={maxPrice}
          onChangeText={onChangeMaxPrice}
          placeholder="Max"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={{
            flex: 1,
            height: 46,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: 14,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: spacing.md }}
      >
        {sortOptions.map((option) => {
          const isActive = sort === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChangeSort(option.value)}
              style={chipStyle(isActive)}
            >
              <Text style={chipTextStyle(isActive)}>{option.label}</Text>
            </Pressable>
          );
        })}

        <Pressable onPress={onClear} style={chipStyle(false)}>
          <Text style={chipTextStyle(false)}>Limpiar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}