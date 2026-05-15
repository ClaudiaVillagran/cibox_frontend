import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing } from "../constants/theme";
import { getCategoriesTree } from "../services/categoryService";
import AppText from "./AppText";

export default function MobileCategoryMenu({ visible, onClose }) {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (visible) loadCategories();
  }, [visible]);

  const loadCategories = async () => {
    try {
      const items = await getCategoriesTree();
      const cats = Array.isArray(items) ? items : [];
      setCategories(cats);
      // Selecciona la primera categoría con hijos por defecto
      const firstWithChildren = cats.find((c) => c.children?.length > 0);
      setSelectedCategory(firstWithChildren || cats[0] || null);
    } catch (error) {
      console.log("ERROR CATEGORIES MENU:", error?.response?.data || error.message);
    }
  };

  const handleSelectCategory = (category) => {
    onClose();
    navigation.navigate("Products", {
      search: "",
      category: category._id || "",
    });
  };

  const subcategories = selectedCategory?.children || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro — toca afuera para cerrar */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        onPress={onClose}
      >
        {/* Contenedor del menú */}
        <Pressable
          onPress={() => {}}
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            overflow: "hidden",
          }}
        >
          {/* Header del modal */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.md,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="grid-outline" size={20} color={colors.primary} />
              <AppText style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                Categorías
              </AppText>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#f1f1f1",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Dos columnas */}
          <View style={{ flex: 1, flexDirection: "row" }}>

            {/* Columna izquierda — categorías padre */}
            <ScrollView
              style={{
                width: 170,
                borderRightWidth: 1,
                borderRightColor: colors.border,
                backgroundColor: "#f9f9f9",
              }}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category) => {
                const isSelected = selectedCategory?._id === category._id;
                return (
                  <Pressable
                    key={category._id || category.name}
                    onPress={() => {
                      if (category.children?.length > 0) {
                        setSelectedCategory(category);
                      } else {
                        handleSelectCategory(category);
                      }
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 14,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: isSelected ? "#fff" : "transparent",
                      borderLeftWidth: isSelected ? 3 : 3,
                      borderLeftColor: isSelected ? colors.primary : "transparent",
                    }}
                  >
                    <AppText
                      numberOfLines={2}
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? "800" : "600",
                        color: isSelected ? colors.primary : colors.text,
                        flex: 1,
                      }}
                    >
                      {category.name}
                    </AppText>
                    {category.children?.length > 0 && (
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={isSelected ? colors.primary : colors.muted}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Columna derecha — subcategorías */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

              {/* "Ver todo en X" arriba */}
              {selectedCategory && (
                <Pressable
                  onPress={() => handleSelectCategory(selectedCategory)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: `${colors.primary}08`,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: colors.primary,
                    }}
                  >
                    Ver todo en {selectedCategory.name}
                  </AppText>
                </Pressable>
              )}

              {/* Subcategorías */}
              {subcategories.map((sub) => (
                <Pressable
                  key={sub._id || sub.name}
                  onPress={() => handleSelectCategory(sub)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f1f1",
                  }}
                >
                  <AppText
                    style={{ fontSize: 14, color: colors.text, fontWeight: "600" }}
                  >
                    {sub.name}
                  </AppText>
                </Pressable>
              ))}

              {subcategories.length === 0 && selectedCategory && (
                <View style={{ padding: 16 }}>
                  <AppText style={{ color: colors.muted, fontSize: 13 }}>
                    No hay subcategorías.
                  </AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}