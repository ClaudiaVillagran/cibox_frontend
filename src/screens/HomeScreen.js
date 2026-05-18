import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing } from "../constants/theme";
import MobileSearchBar from "../components/MobileSearchBar";
import { getFeaturedCategories } from "../services/categoryService";
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
import MobileCategoryMenu from "../components/MobileCategoryMenu";

// ─── Carousel principal (3 banners) ───────────────────────────────────────────
const BANNERS = [
  {
    id: "1",
    imageDesktop: require("../../assets/ahorra_despensa_banner_web.png"),
    imageMobile: require("../../assets/ahorra_despensa_banner_mobile.png"),
  },
  {
    id: "2",
    imageDesktop: require("../../assets/caja_personalizada_banner_web.png"),
    imageMobile: require("../../assets/caja_personalizada_banner_mobile.png"),
  },
  {
    id: "3",
    imageDesktop: require("../../assets/cibox_membresia_banner_web.png"),
    imageMobile: require("../../assets/cibox_membresia_banner_mobile.png"),
  },
];

// ─── Acceso rápido ─────────────────────────────────────────────────────────────
const QUICK_ACCESS = [
  { id: "recetas",    label: "Recetas",    emoji: "🍳", bg: "#fef3c7", border: "#f59e0b", screen: "Recipes"    },
  { id: "caja",       label: "Mi caja",    emoji: "📦", bg: "#dcfce7", border: "#16a34a", screen: "CustomBox"  },
  { id: "destacados", label: "Destacados", emoji: "⭐", bg: "#fce7f3", border: "#db2777", screen: "Products"   },
  { id: "ciboxplus",  label: "Cibox+",     emoji: "💎", bg: "#ede9fe", border: "#7c3aed", screen: "HowItWorks" },
  { id: "novedades",  label: "Novedades",  emoji: "✨", bg: "#e0f2fe", border: "#0284c7", screen: "Products"   },
];

// ─── Banner inline presionable ─────────────────────────────────────────────────
function PromoBanner({ imageDesktop, imageMobile, onPress, isWebDesktop }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: spacing.lg,
        height: isWebDesktop ? 180 : 120,
      }}
    >
      <Image
        source={isWebDesktop ? imageDesktop : imageMobile}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </Pressable>
  );
}

// ─── Círculo animado ───────────────────────────────────────────────────────────
function QuickCircle({ item, index, onPress }) {
  const size = 68;
  const borderWidth = useSharedValue(2.5);

  useEffect(() => {
    borderWidth.value = withDelay(
      index * 300,
      withRepeat(
        withSequence(
          withTiming(5.5, { duration: 700 }),
          withTiming(2,   { duration: 700 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={{ alignItems: "center", marginRight: 14, width: size + 14 }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: item.border,
            backgroundColor: item.bg,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 7,
          },
          animStyle,
        ]}
      >
        <AppText style={{ fontSize: 28 }}>{item.emoji}</AppText>
      </Animated.View>
      <AppText
        numberOfLines={2}
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: colors.text,
          textAlign: "center",
          lineHeight: 15,
        }}
      >
        {item.label}
      </AppText>
    </Pressable>
  );
}

// ─── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { token } = useAuthStore();
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= 800;

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [bannerWidth, setBannerWidth] = useState(0);

  const progressValue = useSharedValue(0);
  const { cartCount, loadCartSummary } = useCartStore();

  const fetchHomeSections = async () => {
    try {
      setSectionsLoading(true);
      const [featuredData, recommendedData] = await Promise.all([
        getFeaturedProducts({ limit: 8 }),
        token ? getRecommendedProducts({ limit: 8 }) : Promise.resolve({ items: [] }),
      ]);
      setFeaturedProducts(Array.isArray(featuredData?.items) ? featuredData.items : []);
      setRecommendedProducts(Array.isArray(recommendedData?.items) ? recommendedData.items : []);
    } catch (e) {
      setFeaturedProducts([]);
      setRecommendedProducts([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchFeaturedCategories = async () => {
    try {
      const data = await getFeaturedCategories();
      const items = data?.items || data?.categories || data || [];
      setFeaturedCategories(Array.isArray(items) ? items : []);
    } catch (e) {}
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ page: 1, limit: 10 });
      setProducts(Array.isArray(response?.items) ? response.items : []);
    } catch (e) {
      setProducts([]);
    }
  };

  const handleAddFromCard = async (product) => {
    if (!product?._id) return;
    try {
      setAddingProductId(product._id);
      await addItemToCart({ productId: product._id, quantity: 1 });
      await loadCartSummary();
      showAppAlert("Éxito", "Producto agregado al carrito");
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "No se pudo agregar al carrito");
    } finally {
      setAddingProductId(null);
    }
  };

  useLayoutEffect(() => {
    if (isWebDesktop) return;
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => setCategoryMenuOpen(true)}
          style={{
            width: 38, height: 38, borderRadius: 19,
            justifyContent: "center", alignItems: "center", marginLeft: 10,
          }}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </Pressable>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 4 }}>
          <Pressable
            onPress={() => navigation.navigate("Notifications")}
            style={{
              width: 38, height: 38, borderRadius: 19,
              justifyContent: "center", alignItems: "center",
              marginRight: 8, backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Cart")}
            style={{
              width: 38, height: 38, borderRadius: 19,
              justifyContent: "center", alignItems: "center",
              backgroundColor: colors.primary, position: "relative",
            }}
          >
            <Ionicons name="bag-outline" size={20} color="#fff" />
            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute", top: -2, right: -2,
                  minWidth: 18, height: 18, borderRadius: 9,
                  backgroundColor: colors.accent,
                  justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
                }}
              >
                <AppText style={{ color: "#333", fontSize: 10, fontWeight: "800" }}>
                  {cartCount}
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      ),
    });
  }, [navigation, cartCount, isWebDesktop]);

  useEffect(() => {
    loadCartSummary();
    fetchFeaturedCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchHomeSections();
  }, [token]);

  return (
    <ScreenContainer maxWidth={1100} padded>
      <FlatList
        data={[]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item._id}
        renderItem={null}
        contentContainerStyle={{ paddingBottom: spacing.xl, backgroundColor: colors.background }}
        ListFooterComponent={<View style={{ height: spacing.lg }} />}
        ListHeaderComponent={
          <View>

            {/* ── Card superior ──────────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: spacing.md,
                marginBottom: spacing.lg,
                zIndex: 10,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              {/* Mensaje */}
              <View
                style={{
                  backgroundColor: `${colors.primaryLight}30`,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  marginBottom: spacing.md,
                }}
              >
                <AppText style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
                  Ahorra más en tu despensa con CIBOX
                </AppText>
                <AppText style={{ marginTop: 4, fontSize: 13, color: colors.muted }}>
                  Compras inteligentes para tu hogar.
                </AppText>
              </View>

              {/* Buscador — solo móvil */}
              {!isWebDesktop && (
                <View style={{ marginBottom: spacing.md }}>
                  <MobileSearchBar />
                </View>
              )}

              {/* Strip cómo funciona */}
              <Pressable
                onPress={() => navigation.navigate("HowItWorks")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: `${colors.primary}12`,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                  borderColor: `${colors.primary}25`,
                }}
              >
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <AppText style={{ flex: 1, fontSize: 13, fontWeight: "700", color: colors.primary }}>
                  Descubre cómo funciona CIBOX
                </AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>

              {/* Carousel */}
              <View
                onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
                style={{ borderRadius: 14, overflow: "hidden", minHeight: isWebDesktop ? 180 : 150 }}
              >
                {bannerWidth > 0 && (
                  <Carousel
                    width={bannerWidth}
                    height={isWebDesktop ? 180 : 150}
                    data={BANNERS}
                    autoPlay
                    autoPlayInterval={4000}
                    loop
                    pagingEnabled
                    snapEnabled
                    scrollAnimationDuration={900}
                    onProgressChange={(_, abs) => { progressValue.value = abs; }}
                    renderItem={({ item }) => (
                      <Image
                        source={isWebDesktop ? item.imageDesktop : item.imageMobile}
                        style={{ width: bannerWidth, height: isWebDesktop ? 180 : 150, resizeMode: "cover" }}
                      />
                    )}
                  />
                )}
              </View>

              {/* Acceso rápido */}
              <View style={{ marginTop: spacing.md }}>
                <AppText
                  style={{
                    fontSize: 13, fontWeight: "800", color: colors.muted,
                    marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5,
                  }}
                >
                  Acceso rápido
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 4, paddingBottom: 4 }}
                >
                  {QUICK_ACCESS.map((item, index) => (
                    <QuickCircle
                      key={item.id}
                      item={item}
                      index={index}
                      onPress={() => navigation.navigate(item.screen)}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* ── Secciones ──────────────────────────────────────────────── */}
            <View style={{ paddingHorizontal: spacing.md, zIndex: 1 }}>
              {sectionsLoading ? (
                <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: spacing.md }}>
                  <AppText style={{ color: colors.muted }}>Cargando destacados...</AppText>
                </View>
              ) : (
                <>
                  {/* Destacados */}
                  <View style={{ marginBottom: spacing.lg }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 4, height: 22, borderRadius: 999, backgroundColor: colors.primary, marginRight: 10 }} />
                        <AppText style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Destacados</AppText>
                      </View>
                      <View style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <AppText style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>TOP CIBOX</AppText>
                      </View>
                    </View>
                    <ProductRowSection
                      title=""
                      products={featuredProducts}
                      onPressProduct={(item) => navigation.navigate("ProductDetail", { productId: item._id })}
                      onAddToCart={handleAddFromCard}
                      addingProductId={addingProductId}
                    />
                  </View>

                  {/* ── Banner inline 1: Envío a domicilio ── */}
                  <PromoBanner
                    imageDesktop={require("../../assets/envio_domicilio_banner_web.png")}
                    imageMobile={require("../../assets/envio_domicilio_banner_mobile.png")}
                    isWebDesktop={isWebDesktop}
                    onPress={() => navigation.navigate("Products")}
                  />

                  {/* Recomendados */}
                  {recommendedProducts.length > 0 && (
                    <View style={{ marginBottom: spacing.lg }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <View style={{ width: 4, height: 22, borderRadius: 999, backgroundColor: colors.accent, marginRight: 10 }} />
                        <AppText style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Recomendados para ti</AppText>
                      </View>
                      <ProductRowSection
                        title=""
                        products={recommendedProducts}
                        onPressProduct={(item) => navigation.navigate("ProductDetail", { productId: item._id })}
                        onAddToCart={handleAddFromCard}
                        addingProductId={addingProductId}
                      />
                    </View>
                  )}

                  {/* Categorías */}
                  {featuredCategories.length > 0 && (
                    <View style={{ marginBottom: spacing.lg }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                        <View style={{ width: 4, height: 22, borderRadius: 999, backgroundColor: colors.primary, marginRight: 10 }} />
                        <AppText style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Categorías</AppText>
                      </View>
                      <FlatList
                        data={featuredCategories}
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingRight: spacing.md }}
                        renderItem={({ item }) => {
                          const circleSize = isWebDesktop ? 100 : 64;
                          const fontSize   = isWebDesktop ? 13 : 11;
                          const itemWidth  = isWebDesktop ? 110 : 72;
                          return (
                            <Pressable
                              onPress={() => navigation.navigate("Products", { search: "", category: item._id })}
                              style={{ alignItems: "center", marginRight: isWebDesktop ? 20 : 16, width: itemWidth }}
                            >
                              <View
                                style={{
                                  width: circleSize, height: circleSize,
                                  borderRadius: circleSize / 2,
                                  borderWidth: 2.5, borderColor: colors.primary,
                                  overflow: "hidden", marginBottom: 8,
                                  backgroundColor: `${colors.primary}10`,
                                }}
                              >
                                <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                              </View>
                              <AppText numberOfLines={2} style={{ fontSize, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                                {item.name}
                              </AppText>
                            </Pressable>
                          );
                        }}
                      />
                    </View>
                  )}

                  {/* ── Banner inline 2: Productos frescos ── */}
                  <PromoBanner
                    imageDesktop={require("../../assets/productos_frescos_banner_web.png")}
                    imageMobile={require("../../assets/productos_frescos_banner_mobile.png")}
                    isWebDesktop={isWebDesktop}
                    onPress={() => navigation.navigate("Products")}
                  />

                  {/* Caja personalizada */}
                  <Pressable
                    onPress={() => navigation.navigate("CustomBox")}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: colors.primary,
                      padding: spacing.md,
                      marginBottom: spacing.lg,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${colors.primary}15`, justifyContent: "center", alignItems: "center" }}>
                      <AppText style={{ fontSize: 28 }}>📦</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={{ fontSize: 17, fontWeight: "900", color: colors.text, marginBottom: 4 }}>Caja personalizada</AppText>
                      <AppText style={{ color: colors.muted, fontSize: 13 }}>Elige exactamente lo que quieres en tu caja.</AppText>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                  </Pressable>

                  {/* ── Banner inline 3: Ahorro inteligente ── */}
                  <PromoBanner
                    imageDesktop={require("../../assets/ahorro_inteligente_banner_web.png")}
                    imageMobile={require("../../assets/ahorro_inteligente_banner_mobile.png")}
                    isWebDesktop={isWebDesktop}
                    onPress={() => navigation.navigate("Products")}
                  />

                  {/* Productos individuales */}
                  <View
                    style={{
                      marginBottom: spacing.lg,
                      backgroundColor: colors.surface,
                      borderRadius: 24,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                          <View style={{ width: 4, height: 22, borderRadius: 999, backgroundColor: colors.primary, marginRight: 10 }} />
                          <AppText style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Productos individuales</AppText>
                        </View>
                        <AppText style={{ color: colors.muted, fontSize: 13, marginLeft: 14 }}>
                          Compra al detalle y agrega directo al carrito.
                        </AppText>
                      </View>
                      <Pressable
                        onPress={() => navigation.navigate("Products")}
                        style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 }}
                      >
                        <AppText style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>Ver todos</AppText>
                      </Pressable>
                    </View>
                    <ProductRowSection
                      title=""
                      products={products.slice(0, 10)}
                      onPressProduct={(item) => navigation.navigate("ProductDetail", { productId: item._id })}
                      onAddToCart={handleAddFromCard}
                      addingProductId={addingProductId}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        }
      />
      <MobileCategoryMenu visible={categoryMenuOpen} onClose={() => setCategoryMenuOpen(false)} />
    </ScreenContainer>
  );
}