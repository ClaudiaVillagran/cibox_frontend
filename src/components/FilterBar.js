import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import AppText from "./AppText";

const SORT_OPTIONS = [
  { label: "Más recientes",   value: "newest",     icon: "time-outline" },
  { label: "Precio menor",    value: "price_asc",  icon: "arrow-up-outline" },
  { label: "Precio mayor",    value: "price_desc", icon: "arrow-down-outline" },
  { label: "Mejor valorados", value: "rating",     icon: "star-outline" },
  { label: "Más populares",   value: "popular",    icon: "flame-outline" },
];

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
  const [panelOpen, setPanelOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Filtros activos: precio + orden (categoría se muestra en su propio botón)
  const activeCount =
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (sort ? 1 : 0);

  // Total para "Limpiar todos" incluye categoría
  const totalActive = activeCount + (selectedCategory ? 1 : 0);

  const selectedCategoryName = categories.find(
    (c) => (c._id || c.id) === selectedCategory,
  )?.name;

  const selectedSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

  const filteredCategories =
    categorySearch.trim()
      ? categories.filter((c) =>
          c.name.toLowerCase().includes(categorySearch.toLowerCase()),
        )
      : categories;

  const closeModal = () => {
    setCategoryModalOpen(false);
    setCategorySearch("");
  };

  // ── Helpers de estilo ───────────────────────────────────────────────────────
  const sortChip = (active) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? `${colors.primary}15` : colors.background,
    marginRight: 8,
  });

  return (
    <View>
      {/* ── Fila principal: Categoría + Filtros ─────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {/* Botón Categoría → abre modal */}
        <Pressable
          onPress={() => setCategoryModalOpen(true)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: selectedCategory ? colors.primary : colors.border,
            backgroundColor: selectedCategory
              ? `${colors.primary}12`
              : colors.surface,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              flex: 1,
            }}
          >
            <Ionicons
              name="grid-outline"
              size={15}
              color={selectedCategory ? colors.primary : colors.muted}
            />
            <AppText
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: selectedCategory ? colors.primary : colors.text,
                flex: 1,
              }}
            >
              {selectedCategoryName || "Categoría"}
            </AppText>
          </View>
          <Ionicons
            name="chevron-down"
            size={14}
            color={selectedCategory ? colors.primary : colors.muted}
          />
        </Pressable>

        {/* Botón Filtros con badge */}
        <Pressable
          onPress={() => setPanelOpen((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: activeCount > 0 ? colors.primary : colors.border,
            backgroundColor:
              activeCount > 0 ? `${colors.primary}12` : colors.surface,
            flexShrink: 0,
          }}
        >
          <Ionicons
            name={panelOpen ? "options" : "options-outline"}
            size={16}
            color={activeCount > 0 ? colors.primary : colors.text}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: activeCount > 0 ? colors.primary : colors.text,
            }}
          >
            Filtros
          </AppText>
          {activeCount > 0 && (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                {activeCount}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Panel expandible: Precio + Orden ────────────────────────────────── */}
      {panelOpen && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: 10,
            gap: 14,
          }}
        >
          {/* Rango de precio */}
          <View>
            <AppText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Rango de precio
            </AppText>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AppText
                  style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}
                >
                  Mínimo
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: minPrice ? colors.primary : colors.border,
                    borderRadius: radius.md,
                    backgroundColor: colors.background,
                    paddingHorizontal: 10,
                    height: 44,
                  }}
                >
                  <AppText style={{ color: colors.muted, marginRight: 4 }}>
                    $
                  </AppText>
                  <TextInput
                    value={minPrice}
                    onChangeText={onChangeMinPrice}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    style={{ flex: 1, color: colors.text, fontSize: 14 }}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <AppText
                  style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}
                >
                  Máximo
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: maxPrice ? colors.primary : colors.border,
                    borderRadius: radius.md,
                    backgroundColor: colors.background,
                    paddingHorizontal: 10,
                    height: 44,
                  }}
                >
                  <AppText style={{ color: colors.muted, marginRight: 4 }}>
                    $
                  </AppText>
                  <TextInput
                    value={maxPrice}
                    onChangeText={onChangeMaxPrice}
                    placeholder="Sin límite"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    style={{ flex: 1, color: colors.text, fontSize: 14 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Ordenar por */}
          <View>
            <AppText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Ordenar por
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORT_OPTIONS.map((opt) => {
                const active = sort === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => onChangeSort(active ? "" : opt.value)}
                    style={sortChip(active)}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={14}
                      color={active ? colors.primary : colors.muted}
                    />
                    <AppText
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: active ? colors.primary : colors.text,
                      }}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Limpiar filtros */}
          {totalActive > 0 && (
            <Pressable
              onPress={() => {
                onClear();
                setPanelOpen(false);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: "#ef4444",
                backgroundColor: "#fef2f2",
              }}
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
              <AppText
                style={{ fontSize: 13, fontWeight: "700", color: "#ef4444" }}
              >
                Limpiar todos los filtros
              </AppText>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Chips de filtros activos ─────────────────────────────────────────── */}
      {!!(selectedCategoryName || selectedSortLabel || minPrice || maxPrice) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
          contentContainerStyle={{ gap: 6 }}
        >
          {selectedCategoryName && (
            <ActiveChip
              label={selectedCategoryName}
              icon="grid-outline"
              onRemove={() => onSelectCategory("")}
            />
          )}
          {selectedSortLabel && (
            <ActiveChip
              label={selectedSortLabel}
              icon="swap-vertical-outline"
              onRemove={() => onChangeSort("")}
            />
          )}
          {minPrice ? (
            <ActiveChip
              label={`Desde $${Number(minPrice).toLocaleString("es-CL")}`}
              icon="arrow-up-circle-outline"
              onRemove={() => onChangeMinPrice("")}
            />
          ) : null}
          {maxPrice ? (
            <ActiveChip
              label={`Hasta $${Number(maxPrice).toLocaleString("es-CL")}`}
              icon="arrow-down-circle-outline"
              onRemove={() => onChangeMaxPrice("")}
            />
          ) : null}
        </ScrollView>
      )}

      {/* ── Modal de categorías ──────────────────────────────────────────────── */}
      <Modal
        visible={categoryModalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        {/* Overlay — toca fuera para cerrar */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
          onPress={closeModal}
        >
          {/* Sheet — evita que el tap se propague al overlay */}
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: spacing.md,
              paddingHorizontal: spacing.md,
              paddingBottom: spacing.lg,
              maxHeight: "80%",
            }}
            onPress={() => {}}
          >
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: "center",
                marginBottom: 14,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <AppText
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Categorías
              </AppText>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            {/* Buscador (solo si hay más de 8 categorías) */}
            {categories.length > 8 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  paddingHorizontal: 12,
                  height: 42,
                  marginBottom: 12,
                }}
              >
                <Ionicons name="search-outline" size={16} color={colors.muted} />
                <TextInput
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  placeholder="Buscar categoría..."
                  placeholderTextColor={colors.muted}
                  style={{ flex: 1, color: colors.text, fontSize: 14 }}
                  autoCorrect={false}
                />
                {categorySearch.length > 0 && (
                  <Pressable onPress={() => setCategorySearch("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={17} color={colors.muted} />
                  </Pressable>
                )}
              </View>
            )}

            {/* Opción "Todas" */}
            {!categorySearch && (
              <Pressable
                onPress={() => {
                  onSelectCategory("");
                  closeModal();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor:
                    selectedCategory === "" ? colors.primary : colors.border,
                  backgroundColor:
                    selectedCategory === ""
                      ? `${colors.primary}12`
                      : colors.background,
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name="apps-outline"
                  size={18}
                  color={
                    selectedCategory === "" ? colors.primary : colors.muted
                  }
                />
                <AppText
                  style={{
                    flex: 1,
                    fontWeight: "700",
                    fontSize: 14,
                    color:
                      selectedCategory === "" ? colors.primary : colors.text,
                  }}
                >
                  Todas las categorías
                </AppText>
                {selectedCategory === "" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            )}

            {/* Grid de categorías */}
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item._id || item.id || item.name}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ gap: 8 }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={
                <AppText
                  style={{
                    color: colors.muted,
                    textAlign: "center",
                    paddingVertical: spacing.md,
                  }}
                >
                  Sin resultados
                </AppText>
              }
              renderItem={({ item }) => {
                const id = item._id || item.id || "";
                const active = selectedCategory === id;
                return (
                  <Pressable
                    onPress={() => {
                      onSelectCategory(id);
                      closeModal();
                    }}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      padding: 12,
                      borderRadius: radius.md,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? `${colors.primary}12`
                        : colors.background,
                    }}
                  >
                    <AppText
                      numberOfLines={2}
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "600",
                        color: active ? colors.primary : colors.text,
                        lineHeight: 18,
                      }}
                    >
                      {item.name}
                    </AppText>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Chip de filtro activo con X ──────────────────────────────────────────────
function ActiveChip({ label, icon, onRemove }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: `${colors.primary}15`,
        borderWidth: 1,
        borderColor: `${colors.primary}40`,
      }}
    >
      <Ionicons name={icon} size={12} color={colors.primary} />
      <AppText
        style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}
      >
        {label}
      </AppText>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Ionicons name="close-circle" size={15} color={colors.primary} />
      </Pressable>
    </View>
  );
}
