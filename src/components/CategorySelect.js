import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { getCategories } from "../services/categoryService";
import AppText from "./AppText";

export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }

      setCategories(list);
    } catch (error) {
      console.log(
        "GET CATEGORIES ERROR:",
        error?.response?.data || error.message
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          padding: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <AppText style={{ color: colors.muted }}>
          No se pudieron cargar las categorías.
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 4, marginBottom: spacing.md }}
    >
      {categories.map((category) => {
        const isSelected = value?._id === category._id;

        return (
          <TouchableOpacity
            key={category._id}
            onPress={() => onChange(category)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: isSelected ? colors.text : colors.border,
              backgroundColor: isSelected ? colors.text : colors.surface,
              marginRight: 10,
            }}
          >
            <AppText
              style={{
                color: isSelected ? colors.background : colors.text,
                fontWeight: "700",
              }}
            >
              {category.name}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}