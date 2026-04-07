import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import ProductCard from "../components/ProductCard";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing } from "../constants/theme";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import { getCategories } from "../services/categoryService";
import ProductRowSection from "../components/ProductRowSection";
import {
  getFeaturedProducts,
  getProducts,
  getRecommendedProducts,
  getTopRatedProducts,
} from "../services/productService";
import useCartStore from "../store/cartStore";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const numColumns = isWide ? 2 : 1;

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { cartCount, loadCartSummary } = useCartStore();

  const showSections =
    !debouncedSearch && !selectedCategory && !minPrice && !maxPrice && !sort;

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

  const fetchHomeSections = async () => {
    try {
      setSectionsLoading(true);

      const [featuredData, topRatedData, recommendedData] = await Promise.all([
        getFeaturedProducts({ limit: 8 }),
        getTopRatedProducts({ limit: 8, minReviews: 1 }),
        getRecommendedProducts({ limit: 8 }),
      ]);

      setFeaturedProducts(Array.isArray(featuredData) ? featuredData : []);
      setTopRatedProducts(Array.isArray(topRatedData) ? topRatedData : []);

      const recommended = recommendedData?.recommended_products || [];
      setRecommendedProducts(Array.isArray(recommended) ? recommended : []);
    } catch (error) {
      console.log(
        "ERROR HOME SECTIONS:",
        error?.response?.data || error.message,
      );
      setFeaturedProducts([]);
      setTopRatedProducts([]);
      setRecommendedProducts([]);
    } finally {
      setSectionsLoading(false);
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
        limit: 10,
      };

      const response = await getProducts(params);

      const items = Array.isArray(response?.data) ? response.data : [];
      const pagination = response?.pagination || {};

      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(pagination.page || nextPage);
      setHasNextPage(!!pagination.hasNextPage);
    } catch (error) {
      console.log("ERROR PRODUCTS:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleClearFilters = () => {
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

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: spacing.lg }} />;

    return (
      <View style={{ paddingVertical: spacing.md }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>Notif</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Cart")}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>
              Carrito
            </Text>

            {cartCount > 0 ? (
              <View
                style={{
                  marginLeft: 6,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.text,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {cartCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      ),
    });
  }, [navigation, cartCount]);
  useEffect(() => {
    loadCartSummary();
  }, []);
  useEffect(() => {
    fetchHomeSections();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts({ nextPage: 1, append: false });
  }, [debouncedSearch, selectedCategory, sort, minPrice, maxPrice]);

  if (loading) {
    return (
      <ScreenContainer maxWidth={900}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
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
          paddingTop: spacing.md,
          paddingBottom: spacing.xl,
          paddingHorizontal: numColumns === 1 ? spacing.md : 0,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <View
            style={{
              marginBottom: spacing.md,
              paddingHorizontal: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Productos
            </Text>

            <Text
              style={{
                color: colors.muted,
                fontSize: 15,
                marginBottom: 12,
              }}
            >
              Explora suplementos, snacks y productos fitness.
            </Text>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar proteína, creatina, snacks..."
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

            {showSections && (
              <>
                <View style={{ height: 20 }} />

                {sectionsLoading ? (
                  <Text
                    style={{ color: colors.muted, marginBottom: spacing.lg }}
                  >
                    Cargando destacados...
                  </Text>
                ) : (
                  <>
                    <ProductRowSection
                      title="Destacados"
                      products={featuredProducts}
                      onPressProduct={(item) =>
                        navigation.navigate("ProductDetail", {
                          productId: item._id,
                        })
                      }
                    />

                    <ProductRowSection
                      title="Mejor valorados"
                      products={topRatedProducts}
                      onPressProduct={(item) =>
                        navigation.navigate("ProductDetail", {
                          productId: item._id,
                        })
                      }
                    />

                    <ProductRowSection
                      title="Recomendados para ti"
                      products={recommendedProducts}
                      onPressProduct={(item) =>
                        navigation.navigate("ProductDetail", {
                          productId: item._id,
                        })
                      }
                    />
                  </>
                )}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              marginBottom: numColumns === 1 ? spacing.md : 0,
              paddingHorizontal: numColumns === 1 ? 0 : undefined,
            }}
          >
            <ProductCard
              product={item}
              compact={numColumns > 1}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item._id })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xl,
              alignItems: "center",
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
