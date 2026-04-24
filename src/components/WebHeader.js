import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../constants/theme";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import AppText from "./AppText";

export default function WebHeader() {
  const navigation = useNavigation();
  const { cartCount, loadCartSummary } = useCartStore();
  const { token } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    categories: [],
    products: [],
  });

  const closeCategoriesTimeoutRef = useRef(null);
  const closeSearchTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCategories();
        const items =
          data?.categories || data?.data?.categories || data?.data || data || [];
        setCategories(Array.isArray(items) ? items : []);
      } catch (error) {
        console.log(
          "WEB HEADER CATEGORIES ERROR:",
          error?.response?.data || error.message
        );
      }
    };

    loadData();
    loadCartSummary();
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const value = search.trim();

    if (!value) {
      setSearchResults({ categories: [], products: [] });
      setSearchLoading(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const [productsData, categoriesData] = await Promise.all([
          getProducts({
            search: value,
            page: 1,
            limit: 6,
          }),
          getCategories(),
        ]);

        const productItems = Array.isArray(productsData?.data)
          ? productsData.data
          : [];

        const rawCategories =
          categoriesData?.categories ||
          categoriesData?.data?.categories ||
          categoriesData?.data ||
          categoriesData ||
          [];

        const filteredCategories = (Array.isArray(rawCategories) ? rawCategories : [])
          .filter((category) =>
            String(category?.name || "")
              .toLowerCase()
              .includes(value.toLowerCase())
          )
          .slice(0, 4);

        setSearchResults({
          categories: filteredCategories,
          products: productItems,
        });

        setSearchOpen(true);
      } catch (error) {
        console.log(
          "WEB HEADER SEARCH ERROR:",
          error?.response?.data || error.message
        );
        setSearchResults({ categories: [], products: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search]);

  const visibleCategories = useMemo(() => categories.slice(0, 10), [categories]);

  const handleSubmitSearch = () => {
    const value = search.trim();
    setSearchOpen(false);

    navigation.navigate("Products", {
      search: value,
      category: "",
    });
  };

  const handleSelectCategory = (category) => {
    setCategoriesOpen(false);
    setSearchOpen(false);

    navigation.navigate("Products", {
      search: "",
      category: category?._id || "",
    });
  };

  const handleSelectProduct = (product) => {
    setSearchOpen(false);

    navigation.navigate("ProductDetail", {
      productId: product?._id,
    });
  };

  const handleViewAllProducts = () => {
    setSearchOpen(false);

    navigation.navigate("Products", {
      search: search.trim(),
      category: "",
    });
  };

  const handleOpenCategories = () => {
    if (closeCategoriesTimeoutRef.current) {
      clearTimeout(closeCategoriesTimeoutRef.current);
    }
    setCategoriesOpen(true);
  };

  const handleCloseCategories = () => {
    closeCategoriesTimeoutRef.current = setTimeout(() => {
      setCategoriesOpen(false);
    }, 120);
  };

  const handleOpenSearch = () => {
    if (closeSearchTimeoutRef.current) {
      clearTimeout(closeSearchTimeoutRef.current);
    }

    if (search.trim()) {
      setSearchOpen(true);
    }
  };

  const handleCloseSearch = () => {
    closeSearchTimeoutRef.current = setTimeout(() => {
      setSearchOpen(false);
    }, 160);
  };

  const hasCategoryResults = (searchResults?.categories || []).length > 0;
  const hasProductResults = (searchResults?.products || []).length > 0;
  const hasAnyResults = hasCategoryResults || hasProductResults;

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 28,
        paddingVertical: 12,
        zIndex: 200,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 1280,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <Pressable onPress={() => navigation.navigate("Inicio")}>
          <Image
            source={require("../../assets/logo-cibox.png")}
            style={{ width: 92, height: 72, resizeMode: "contain" }}
          />
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
          <View
            onMouseEnter={handleOpenCategories}
            onMouseLeave={handleCloseCategories}
            style={{ position: "relative" }}
          >
            <Pressable
              onPress={() => setCategoriesOpen((prev) => !prev)}
              style={{
                height: 42,
                borderRadius: 999,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={colors.text}
                style={{ marginRight: 8 }}
              />
              <AppText
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: colors.text,
                  marginRight: 6,
                }}
              >
                Categorías
              </AppText>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </Pressable>

            {categoriesOpen ? (
              <View
                style={{
                  position: "absolute",
                  top: 50,
                  left: 0,
                  width: 260,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 8,
                  zIndex: 220,
                }}
              >
                {visibleCategories.map((category) => (
                  <Pressable
                    key={category?._id || category?.name}
                    onPress={() => handleSelectCategory(category)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        fontWeight: "600",
                      }}
                    >
                      {category?.name}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View
          style={{ flex: 1, maxWidth: 520, position: "relative" }}
          onMouseEnter={handleOpenSearch}
          onMouseLeave={handleCloseSearch}
        >
          <View
            style={{
              height: 42,
              borderRadius: 999,
              backgroundColor: "#f1f1f1",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.muted}
              style={{ marginRight: 8 }}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={handleOpenSearch}
              placeholder="Buscar productos ..."
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              onSubmitEditing={handleSubmitSearch}
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.text,
                outlineStyle: "none",
              }}
            />

            {search?.length > 0 ? (
              <Pressable
                onPress={() => {
                  setSearch("");
                  setSearchResults({ categories: [], products: [] });
                  setSearchOpen(false);
                }}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            ) : null}
          </View>

          {searchOpen && search.trim() ? (
            <View
              style={{
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
                backgroundColor: "#fff",
                borderRadius: 22,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 10,
                zIndex: 230,
                maxHeight: 520,
                overflow: "hidden",
              }}
            >
              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{
                  paddingHorizontal: 18,
                  paddingTop: 16,
                  paddingBottom: 12,
                }}
              >
                {searchLoading ? (
                  <View style={{ paddingVertical: 14 }}>
                    <AppText style={{ color: colors.muted }}>Buscando...</AppText>
                  </View>
                ) : (
                  <>
                    {hasCategoryResults ? (
                      <View style={{ marginBottom: 14 }}>
                        <AppText
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: colors.muted,
                            marginBottom: 10,
                            textTransform: "uppercase",
                          }}
                        >
                          Categorías
                        </AppText>

                        {searchResults.categories.map((category) => (
                          <Pressable
                            key={category?._id || category?.name}
                            onPress={() => handleSelectCategory(category)}
                            style={{
                              paddingVertical: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: "#f1f1f1",
                            }}
                          >
                            <AppText
                              style={{
                                color: colors.text,
                                fontSize: 14,
                                textDecorationLine: "underline",
                              }}
                            >
                              {category?.name}
                            </AppText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}

                    {hasProductResults ? (
                      <View>
                        <AppText
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: colors.muted,
                            marginBottom: 10,
                            textTransform: "uppercase",
                          }}
                        >
                          Productos
                        </AppText>

                        {searchResults.products.map((product) => (
                          <Pressable
                            key={product?._id}
                            onPress={() => handleSelectProduct(product)}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: "#f1f1f1",
                            }}
                          >
                            <View
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 8,
                                backgroundColor: "#f7f7f7",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                marginRight: 12,
                                borderWidth: 1,
                                borderColor: "#efefef",
                              }}
                            >
                              {product?.thumbnail || product?.images?.[0] ? (
                                <Image
                                  source={{
                                    uri: product?.thumbnail || product?.images?.[0],
                                  }}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    resizeMode: "contain",
                                  }}
                                />
                              ) : (
                                <Ionicons
                                  name="image-outline"
                                  size={18}
                                  color={colors.muted}
                                />
                              )}
                            </View>

                            <AppText
                              numberOfLines={1}
                              style={{
                                flex: 1,
                                color: colors.text,
                                fontSize: 15,
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              {product?.name}
                            </AppText>
                          </Pressable>
                        ))}

                        <Pressable
                          onPress={handleViewAllProducts}
                          style={{
                            paddingTop: 12,
                            paddingBottom: 6,
                          }}
                        >
                          <AppText
                            style={{
                              color: colors.muted,
                              fontSize: 13,
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            Ver todos los productos
                          </AppText>
                        </Pressable>
                      </View>
                    ) : null}

                    {!searchLoading && !hasAnyResults ? (
                      <View style={{ paddingVertical: 8 }}>
                        <AppText style={{ color: colors.muted }}>
                          No encontramos resultados.
                        </AppText>
                      </View>
                    ) : null}
                  </>
                )}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Pressable
            onPress={() => navigation.navigate(token ? "ProfileTab" : "Auth")}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color={colors.text}
              style={{ marginRight: 6 }}
            />
            <AppText
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {token ? "Mi cuenta" : "Acceso/Registro"}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate(token ? "FavoritesTab" : "Auth")}
          >
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Cart")}
            style={{ position: "relative" }}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />

            <View
              style={{
                position: "absolute",
                top: -8,
                right: -10,
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
                {cartCount || 0}
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}