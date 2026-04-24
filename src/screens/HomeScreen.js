import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
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
import {
  getCategories,
  getFeaturedCategories,
} from "../services/categoryService";
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
import AppText from "../components/AppText";

export default function HomeScreen({ navigation }) {
  const { token } = useAuthStore();
  const isWeb = Platform.OS === "web";
  const [featuredCategories, setFeaturedCategories] = useState([]);
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
  const fetchFeaturedCategories = async () => {
    try {
      const data = await getFeaturedCategories();
      console.log(data);
      setFeaturedCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("ERROR FEATURED CATEGORIES:", error);
    }
  };
  useEffect(() => {
    fetchFeaturedCategories();
  }, []);
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
    if (isWeb) return;

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
                <AppText
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  {cartCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      ),
    });
  }, [navigation, cartCount, isWeb]);

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
    <ScreenContainer maxWidth={1100} padded>
      <FlatList
        key={numColumns}
        data={showSections ? [] : products}
        numColumns={numColumns}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              flex: numColumns > 1 ? 1 : undefined,
              marginBottom: spacing.md,
            }}
          >
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: item._id,
                })
              }
              onAddToCart={() => handleAddFromCard(item)}
              addingToCart={addingProductId === item._id}
            />
          </View>
        )}
        columnWrapperStyle={
          !showSections && numColumns > 1
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
          paddingHorizontal: !showSections && numColumns === 1 ? spacing.md : 0,
          backgroundColor: colors.background,
        }}
        onEndReached={!showSections ? handleLoadMore : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          !showSections ? renderFooter : <View style={{ height: spacing.lg }} />
        }
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
                <AppText
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  Ahorra más en tu despensa con CIBOX
                </AppText>
                <AppText
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: colors.muted,
                  }}
                >
                  Compras inteligentes para tu hogar.
                </AppText>
              </View>

              {!isWeb ? (
                <>
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
                </>
              ) : null}
            </View>

            {!!selectedCategory && (
              <View
                style={{
                  marginBottom: spacing.lg,
                  backgroundColor: colors.surface,
                  borderRadius: 22,
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
                    marginBottom: 14,
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <AppText
                      style={{
                        fontSize: 24,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      Productos de la categoría
                    </AppText>

                    <AppText
                      style={{
                        marginTop: 4,
                        color: colors.muted,
                        fontSize: 14,
                      }}
                    >
                      Explora los productos disponibles en esta categoría.
                    </AppText>
                  </View>

                  <Pressable
                    onPress={handleClearFilters}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: "#f3f6ee",
                      borderWidth: 1,
                      borderColor: "#dbe7cf",
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      Limpiar filtro
                    </AppText>
                  </Pressable>
                </View>
              </View>
            )}

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
                    <AppText style={{ color: colors.muted }}>
                      Cargando destacados...
                    </AppText>
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
                        <AppText
                          style={{
                            fontSize: 24,
                            fontWeight: "800",
                            color: colors.text,
                          }}
                        >
                          Destacados
                        </AppText>
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

                    {featuredCategories.length > 0 && (
                      <View style={{ marginBottom: spacing.lg }}>
                        <AppText
                          style={{
                            fontSize: 24,
                            fontWeight: "800",
                            color: colors.text,
                            marginBottom: 12,
                            paddingHorizontal: 2,
                          }}
                        >
                          Categorías destacadas
                        </AppText>

                        <FlatList
                          data={featuredCategories}
                          horizontal
                          nestedScrollEnabled
                          keyboardShouldPersistTaps="handled"
                          keyExtractor={(item) => item._id}
                          contentContainerStyle={{ paddingRight: spacing.md }}
                          renderItem={({ item }) => (
                            <Pressable
                              onPress={() =>
                                navigation.navigate("Products", {
                                  search: "",
                                  category: item._id,
                                })
                              }
                              style={{
                                width: 220,
                                marginRight: spacing.md,
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: colors.surface,
                                  borderRadius: 20,
                                  overflow: "hidden",
                                  borderWidth: 1,
                                  borderColor: "#eee",
                                }}
                              >
                                <Image
                                  source={{ uri: item.image }}
                                  style={{
                                    width: "100%",
                                    height: 120,
                                  }}
                                  resizeMode="cover"
                                />

                                <View style={{ padding: 12 }}>
                                  <AppText
                                    style={{
                                      fontWeight: "800",
                                      fontSize: 15,
                                      color: colors.text,
                                    }}
                                  >
                                    {item.name}
                                  </AppText>
                                </View>
                              </View>
                            </Pressable>
                          )}
                        />
                      </View>
                    )}

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
                            <AppText
                              style={{
                                fontSize: 24,
                                fontWeight: "800",
                                color: colors.text,
                              }}
                            >
                              Productos individuales
                            </AppText>
                          </View>

                          <AppText
                            style={{
                              color: colors.muted,
                              fontSize: 14,
                              marginLeft: 14,
                            }}
                          >
                            Compra al detalle y agrega productos directo al
                            carrito.
                          </AppText>
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
                          <AppText
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              fontWeight: "800",
                            }}
                          >
                            Ver todos
                          </AppText>
                        </Pressable>
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
                  </>
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !showSections ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 18,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xl,
                alignItems: "center",
                marginHorizontal: spacing.md,
              }}
            >
              <AppText
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                No encontramos productos
              </AppText>

              <AppText style={{ color: colors.muted, textAlign: "center" }}>
                Prueba cambiando la búsqueda o limpiando los filtros.
              </AppText>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}
