import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

export default function ProductsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const numColumns = isWide ? 2 : 1;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
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
      const items =
        data?.categories || data?.data?.categories || data?.data || data || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log("ERROR CATEGORIES:", error?.response?.data || error.message);
    }
  };

  const fetchProducts = async ({ nextPage = 1, append = false } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = {
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined,
        page: nextPage,
        limit: 12,
      };

      const response = await getProducts(params);

      const items = Array.isArray(response?.data) ? response.data : [];
      const pagination = response?.pagination || {};

      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(pagination.page || nextPage);
      setHasNextPage(!!pagination.hasNextPage);
    } catch (error) {
      console.log("ERROR PRODUCTS:", error?.response?.data || error.message);
      if (!append) {
        setProducts([]);
      }
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

    fetchProducts({
      nextPage: page + 1,
      append: true,
    });
  };

  const handleAddFromCard = async (product) => {
    if (!product?._id) return;

    try {
      setAddingProductId(product._id);

      await addItemToCart({
        productId: product._id,
        quantity: 1,
      });

      await loadCartSummary();
      showAppAlert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      console.log(
        "ADD FROM CARD ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo agregar al carrito"
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
              <Text
                style={{
                  color: colors.primaryText,
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                {cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ),
    });
  }, [navigation, cartCount]);

  useEffect(() => {
    loadCartSummary();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
    fetchProducts({ nextPage: 1, append: false });
  }, [debouncedSearch, selectedCategory, sort, minPrice, maxPrice]);

  if (loading && !products.length) {
    return (
      <ScreenContainer maxWidth={1100}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.sm, color: colors.muted }}>
            Cargando productos...
          </Text>
        </View>
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
          <View style={{ marginBottom: spacing.md, paddingHorizontal: spacing.md }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                padding: spacing.md,
                marginBottom: spacing.md,
                ...shadows.card,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: colors.text,
                  marginBottom: 4,
                  letterSpacing: -0.5,
                }}
              >
                Todos los productos
              </Text>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 14,
                  marginBottom: 14,
                }}
              >
                Explora el catálogo completo de CIBOX y encuentra lo que necesitas.
              </Text>

              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar productos..."
              />

              <View style={{ height: 12 }} />

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
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                Resultados
              </Text>

              <Text style={{ color: colors.muted }}>
                {products.length} producto(s) encontrados
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              marginBottom: numColumns === 1 ? spacing.md : 0,
            }}
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
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xl,
              alignItems: "center",
              marginHorizontal: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              No encontramos productos
            </Text>

            <Text style={{ color: colors.muted, textAlign: "center" }}>
              Prueba cambiando la búsqueda o limpiando los filtros.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}