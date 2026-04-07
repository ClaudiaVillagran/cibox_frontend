import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export default function FilterBar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  sort,
  onChangeSort,
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  onClear,
}) {
  const chipStyle = (active) => ({
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primary : colors.surface,
    marginRight: 10,
  });

  const chipTextStyle = (active) => ({
    color: active ? colors.primaryText : colors.text,
    fontWeight: '700',
    fontSize: 13,
  });

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.sm }}
      >
        <Pressable
          onPress={() => onSelectCategory('')}
          style={chipStyle(!selectedCategory)}
        >
          <Text style={chipTextStyle(!selectedCategory)}>Todas</Text>
        </Pressable>

        {categories.map((category) => {
          const categoryId = category._id || category.id;
          const active = selectedCategory === categoryId;

          return (
            <Pressable
              key={categoryId}
              onPress={() => onSelectCategory(categoryId)}
              style={chipStyle(active)}
            >
              <Text style={chipTextStyle(active)}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        <TextInput
          value={minPrice}
          onChangeText={onChangeMinPrice}
          placeholder="Min"
          keyboardType="numeric"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            height: 44,
            marginRight: 8,
          }}
        />

        <TextInput
          value={maxPrice}
          onChangeText={onChangeMaxPrice}
          placeholder="Max"
          keyboardType="numeric"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            height: 44,
          }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.sm }}
      >
        {[
          { label: 'Más recientes', value: '' },
          { label: 'Precio ↑', value: 'price_asc' },
          { label: 'Precio ↓', value: 'price_desc' },
          { label: 'Rating', value: 'rating_desc' },
        ].map((item) => {
          const active = sort === item.value;

          return (
            <Pressable
              key={item.label}
              onPress={() => onChangeSort(item.value)}
              style={chipStyle(active)}
            >
              <Text style={chipTextStyle(active)}>{item.label}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={onClear}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            Limpiar
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}