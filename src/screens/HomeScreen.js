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
} from "../services/productService";
import { addItemToCart } from "../services/cartService";
import useCartStore from "../store/cartStore";
import { showAppAlert } from "../utils/appAlerts";
import useAuthStore from "../store/authStore";
export default function HomeScreen({ navigation }) {
  const { token } = useAuthStore();
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
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [addingProductId, setAddingProductId] = useState(null);

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

      const featuredPromise = getFeaturedProducts({ limit: 8 });

      const recommendedPromise = token
        ? getRecommendedProducts({ limit: 8 })
        : Promise.resolve({ recommended_products: [] });

      const [featuredData, recommendedData] = await Promise.all([
        featuredPromise,
        recommendedPromise,
      ]);

      setFeaturedProducts(Array.isArray(featuredData) ? featuredData : []);

      const recommended = recommendedData?.recommended_products || [];
      setRecommendedProducts(Array.isArray(recommended) ? recommended : []);
    } catch (error) {
      console.log(
        "ERROR HOME SECTIONS:",
        error?.response?.data || error.message,
      );
      setFeaturedProducts([]);
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
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
              backgroundColor: `${colors.primaryLight}33`,
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.text}
            />
          </Pressable>

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
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "800",
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
  }, [token]);

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
          <ActivityIndicator size="large" color={colors.primary} />
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
          <View style={{ marginBottom: spacing.md }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: spacing.md,
                marginBottom: spacing.lg,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: `${colors.primaryLight}30`,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  marginBottom: spacing.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  Ahorra más en tu despensa con CIBOX
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: colors.muted,
                  }}
                >
                  Compras inteligentes para tu hogar.
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: colors.text,
                  marginBottom: 4,
                  letterSpacing: -0.5,
                }}
              >
                Productos
              </Text>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 14,
                  marginBottom: 14,
                }}
              >
                Tu supermercado digital para comprar mejor y ahorrar más.
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

            {showSections && (
              <View style={{ marginBottom: spacing.md }}>
                {sectionsLoading ? (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 18,
                      padding: spacing.md,
                    }}
                  >
                    <Text style={{ color: colors.muted }}>
                      Cargando destacados...
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={{ marginBottom: spacing.lg }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                          paddingHorizontal: 2,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: "800",
                            color: colors.text,
                          }}
                        >
                          Destacados
                        </Text>
                      </View>

                      <ProductRowSection
                        title=""
                        products={featuredProducts}
                        onPressProduct={(item) =>
                          navigation.navigate("ProductDetail", {
                            productId: item._id,
                          })
                        }
                        onAddToCart={handleAddFromCard}
                        addingProductId={addingProductId}
                      />
                    </View>

                    <View
                      style={{
                        marginBottom: spacing.lg,
                        backgroundColor: colors.surface,
                        borderRadius: 24,
                        padding: spacing.md,
                        borderWidth: 1,
                        borderColor: "#ececec",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <View
                              style={{
                                width: 4,
                                height: 22,
                                borderRadius: 999,
                                backgroundColor: colors.primary,
                                marginRight: 10,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "800",
                                color: colors.text,
                              }}
                            >
                              Productos individuales
                            </Text>
                          </View>

                          <Text
                            style={{
                              color: colors.muted,
                              fontSize: 14,
                              marginLeft: 14,
                            }}
                          >
                            Compra al detalle y agrega productos directo al
                            carrito.
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => navigation.navigate("Products")}
                          style={{
                            borderWidth: 1,
                            borderColor: "#cfe3c4",
                            backgroundColor: "#f7fbf4",
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 14,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              fontWeight: "800",
                            }}
                          >
                            Ver todos
                          </Text>
                        </Pressable>
                      </View>

                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: "#cfe3c4",
                          backgroundColor: "#fbfdf9",
                          borderRadius: 18,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          marginBottom: spacing.md,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 15,
                            fontWeight: "800",
                            marginBottom: 4,
                          }}
                        >
                          Compra al detalle
                        </Text>

                        <Text
                          style={{
                            color: colors.muted,
                            fontSize: 14,
                          }}
                        >
                          Agrega productos directos al carrito y revisa el
                          catálogo completo desde esta sección.
                        </Text>
                      </View>

                      <ProductRowSection
                        title=""
                        products={products.slice(0, 10)}
                        onPressProduct={(item) =>
                          navigation.navigate("ProductDetail", {
                            productId: item._id,
                          })
                        }
                        onAddToCart={handleAddFromCard}
                        addingProductId={addingProductId}
                      />
                    </View>

                    {token && recommendedProducts.length > 0 ? (
                      <View style={{ marginBottom: spacing.md }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                            paddingHorizontal: 2,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: colors.primary,
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "800",
                              color: colors.text,
                            }}
                          >
                            Recomendados para ti
                          </Text>
                        </View>

                        <ProductRowSection
                          title=""
                          products={recommendedProducts}
                          onPressProduct={(item) =>
                            navigation.navigate("ProductDetail", {
                              productId: item._id,
                            })
                          }
                          onAddToCart={handleAddFromCard}
                          addingProductId={addingProductId}
                        />
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            )}
          </View>
        }
       
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
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
