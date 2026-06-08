import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProductsGridSkeleton } from "../components/SkeletonLoader";
import ScreenContainer from "../components/ScreenContainer";
import ProductCard from "../components/ProductCard";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import { colors, spacing, radius, shadows } from "../constants/theme";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { addItemToCart } from "../services/cartService";
import useCartStore from "../store/cartStore";
import { showAppAlert } from "../utils/appAlerts";
import AppText from "../components/AppText";

const cleanValue = (value) => {
  const v = String(value ?? "").trim();
  return v ? v : undefined;
};

export default function ProductsScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const numColumns = isWide ? 2 : 1;
  // const isWeb = Platform.OS === "web";
  const isWebDesktop = Platform.OS === "web" && width >= 800;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(route?.params?.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    route?.params?.search || "",
  );

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    route?.params?.category || "",
  );
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);

  const { cartCount, loadCartSummary } = useCartStore();

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const items = data?.items || data?.categories || data || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log("ERROR CATEGORIES:", error?.response?.data || error.message);
    }
  };

  const fetchProducts = async ({ nextPage = 1, append = false } = {}) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);

      const params = {
        search: cleanValue(debouncedSearch),
        category: cleanValue(selectedCategory),
        min_price: cleanValue(minPrice),
        max_price: cleanValue(maxPrice),
        sort: cleanValue(sort),
        page: nextPage,
        limit: 12,
      };

      const response = await getProducts(params);
      const items = Array.isArray(response?.items) ? response.items : [];
      const pagination = response?.pagination || {};

      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(Number(pagination.page) || nextPage);
      setHasNextPage(!!pagination.has_next);
    } catch (error) {
      console.log("ERROR PRODUCTS:", error?.response?.data || error.message);
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasNextPage) return;
    fetchProducts({ nextPage: page + 1, append: true });
  };

  const handleAddFromCard = async (product) => {
    if (!product?._id) return;

    try {
      setAddingProductId(product._id);
      await addItemToCart({ productId: product._id, quantity: 1 });
      await loadCartSummary();
      showAppAlert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      console.log(
        "ADD FROM CARD ERROR:",
        error?.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo agregar al carrito",
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: spacing.lg }} />;
    return (
      <View style={{ paddingVertical: spacing.md }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  useLayoutEffect(() => {
    if (isWebDesktop) return;

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Cart")}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: `${colors.primaryLight}33`,
            position: "relative",
          }}
        >
          <Ionicons name="bag-outline" size={21} color={colors.text} />

          {cartCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
              }}
            >
              <AppText
                style={{
                  color: colors.primaryText,
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                {cartCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ),
    });
  }, [navigation, cartCount, isWebDesktop]);

  useEffect(() => {
    loadCartSummary();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (route?.params?.search !== undefined) {
      setSearch(route.params.search || "");
      setDebouncedSearch(route.params.search || "");
    }
  }, [route?.params?.search]);

  useEffect(() => {
    if (route?.params?.category !== undefined) {
      setSelectedCategory(route.params.category || "");
    }
  }, [route?.params?.category]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts({ nextPage: 1, append: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [debouncedSearch, selectedCategory, sort, minPrice, maxPrice]);
  
  if (loading && !products.length) {
    return (
      <ScreenContainer maxWidth={1100} padded={false}>
        <ProductsGridSkeleton columns={numColumns} count={numColumns * 3} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={1100} padded={false}>
      <FlatList
        key={numColumns}
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={
          numColumns > 1
            ? {
                paddingHorizontal: spacing.md,
                gap: spacing.md,
                marginBottom: spacing.md,
              }
            : undefined
        }
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: spacing.xl,
          paddingHorizontal: numColumns === 1 ? spacing.md : 0,
          backgroundColor: colors.background,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <View
            style={{ marginBottom: spacing.md, paddingHorizontal: spacing.md }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                padding: spacing.md,
                marginBottom: spacing.md,
                ...shadows.card,
              }}
            >
              <AppText
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                Todos los productos
              </AppText>

              <AppText
                style={{ color: colors.muted, fontSize: 14, marginBottom: 14 }}
              >
                Explora el catálogo completo de CIBOX y encuentra lo que
                necesitas.
              </AppText>

              {!isWebDesktop ? (
                <>
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar productos..."
                  />
                  <View style={{ height: 12 }} />
                </>
              ) : null}

              <FilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                sort={sort}
                onChangeSort={setSort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChangeMinPrice={setMinPrice}
                onChangeMaxPrice={setMaxPrice}
                onClear={handleClearFilters}
              />
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <AppText
                style={{
                  color: colors.text,
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                Resultados
              </AppText>

              <AppText style={{ color: colors.muted }}>
                {products.length} producto(s) encontrados
              </AppText>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{ flex: 1, marginBottom: numColumns === 1 ? spacing.md : 0 }}
          >
            <ProductCard
              product={item}
              compact={numColumns > 1}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item._id })
              }
              onAddToCart={handleAddFromCard}
              adding={addingProductId === item._id}
            />
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.xl,
              alignItems: "center",
              marginHorizontal: spacing.md,
              gap: 12,
            }}
          >
            <AppText style={{ fontSize: 48 }}>🔍</AppText>

            <AppText
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                textAlign: "center",
              }}
            >
              Sin resultados
            </AppText>

            <AppText style={{ color: colors.muted, textAlign: "center", lineHeight: 22 }}>
              No encontramos productos que coincidan con tu búsqueda o filtros actuales.
            </AppText>

            {/* Sugerencias */}
            <View style={{
              backgroundColor: colors.background,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              width: "100%",
              gap: 6,
            }}>
              <AppText style={{ fontSize: 12, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Sugerencias
              </AppText>
              {[
                "Revisa la ortografía de tu búsqueda",
                "Usa palabras más generales",
                "Limpia los filtros de precio o categoría",
              ].map((tip, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                  <AppText style={{ color: colors.primary, fontSize: 14, lineHeight: 20 }}>•</AppText>
                  <AppText style={{ color: colors.muted, fontSize: 13, flex: 1, lineHeight: 20 }}>{tip}</AppText>
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleClearFilters}
              style={({ pressed }) => ({
                backgroundColor: pressed ? `${colors.primary}CC` : colors.primary,
                borderRadius: 999,
                paddingHorizontal: 24,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              })}
            >
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <AppText style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
                Limpiar filtros
              </AppText>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}
