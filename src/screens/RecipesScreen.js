import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";
import { getProducts } from "../services/productService";
import { addItemToCart } from "../services/cartService";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";

// ─── Recetas ─────────────────────────────────────────────────────────────────
// "key" debe coincidir con alguna palabra del nombre del producto en CIBOX
// Ejemplo: key "aceite" matchea "ACEITE OLIVA TERRA VIRGEN 5L"
const RECIPES = [
  {
    id: "1",
    emoji: "🍲",
    title: "Cazuela de vacuno",
    time: "60 min",
    servings: 4,
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "El clásico chileno. Caldo reconfortante con papas, choclo, zapallo y carne a fuego lento.",
    ingredients: [
      { name: "Carne de vacuno",  qty: "500 g",     key: "vacuno" },
      { name: "Papas",            qty: "3 unid.",   key: "papa" },
      { name: "Choclo",           qty: "2 unid.",   key: "choclo" },
      { name: "Zapallo camote",   qty: "200 g",     key: "zapallo" },
      { name: "Porotos verdes",   qty: "1 taza",    key: "poroto" },
      { name: "Arroz",            qty: "½ taza",    key: "arroz" },
      { name: "Ajo",              qty: "3 dientes", key: "ajo" },
      { name: "Caldo de vacuno",  qty: "1 L",       key: "caldo" },
      { name: "Aceite",           qty: "2 cdas.",   key: "aceite" },
    ],
    steps: [
      "Sellar la carne en trozos en aceite caliente. Reservar.",
      "En la misma olla dorar la cebolla y el ajo picados.",
      "Agregar el caldo y la carne. Cocinar 20 min a fuego medio.",
      "Incorporar papas, choclo y zapallo. Cocinar 25 min más.",
      "Añadir porotos verdes y arroz. Cocinar 15 min tapado. Servir caliente.",
    ],
  },
  {
    id: "2",
    emoji: "🥗",
    title: "Ensalada chilena",
    time: "10 min",
    servings: 4,
    difficulty: "Muy fácil",
    diffColor: "#16a34a",
    description:
      "Tomate, cebolla y cilantro. El acompañamiento infaltable en la mesa chilena.",
    ingredients: [
      { name: "Tomates",         qty: "4 unid.",  key: "tomate" },
      { name: "Cebolla",         qty: "1 unid.",  key: "cebolla" },
      { name: "Cilantro",        qty: "1 atado",  key: "cilantro" },
      { name: "Aceite de oliva", qty: "3 cdas.",  key: "aceite oliva" },
      { name: "Limón",           qty: "1 unid.",  key: "limon" },
      { name: "Sal",             qty: "al gusto", key: "sal " },
    ],
    steps: [
      "Cortar los tomates en medias lunas y la cebolla en pluma.",
      "Colocar en un bol con sal y dejar reposar 5 min.",
      "Agregar cilantro picado, aceite y jugo de limón.",
      "Mezclar bien y servir de inmediato.",
    ],
  },
  {
    id: "3",
    emoji: "🌽",
    title: "Pastel de choclo",
    time: "75 min",
    servings: 6,
    difficulty: "Media",
    diffColor: "#f59e0b",
    description:
      "Cubierta de choclo molido sobre pino de carne, huevo duro y aceitunas. Sabor único.",
    ingredients: [
      { name: "Choclo",        qty: "6 unid.",  key: "choclo" },
      { name: "Carne molida",  qty: "400 g",    key: "molida" },
      { name: "Cebolla",       qty: "2 unid.",  key: "cebolla" },
      { name: "Huevos",        qty: "3 unid.",  key: "huevo" },
      { name: "Aceitunas",     qty: "½ taza",   key: "aceituna" },
      { name: "Albahaca",      qty: "8 hojas",  key: "albahaca" },
      { name: "Leche",         qty: "½ taza",   key: "leche" },
      { name: "Mantequilla",   qty: "1 cda.",   key: "mantequilla" },
      { name: "Azúcar",        qty: "al gusto", key: "azucar" },
    ],
    steps: [
      "Sofreír la cebolla, agregar la carne molida con sal y comino. Cocinar 15 min.",
      "Licuar los granos de choclo con leche, mantequilla y albahaca.",
      "En una fuente, colocar el pino, huevo duro en rodajas y aceitunas.",
      "Cubrir con la mezcla de choclo y espolvorear azúcar.",
      "Hornear a 180 °C por 30 min hasta que la superficie dore.",
    ],
  },
  {
    id: "4",
    emoji: "🍝",
    title: "Tallarines con salsa casera",
    time: "25 min",
    servings: 4,
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Pasta al dente con salsa de tomate natural, ajo y orégano. Rápido y delicioso.",
    ingredients: [
      { name: "Tallarines",      qty: "400 g",    key: "tallarin" },
      { name: "Tomates",         qty: "5 unid.",  key: "tomate" },
      { name: "Ajo",             qty: "3 dientes",key: "ajo" },
      { name: "Cebolla",         qty: "1 unid.",  key: "cebolla" },
      { name: "Aceite de oliva", qty: "3 cdas.",  key: "aceite oliva" },
      { name: "Orégano",         qty: "1 cdita.", key: "oregano" },
      { name: "Queso rallado",   qty: "al gusto", key: "queso" },
    ],
    steps: [
      "Cocer la pasta en agua con sal según el paquete.",
      "Sofreír ajo y cebolla en aceite de oliva por 3 min.",
      "Agregar tomates picados sin piel. Cocinar 15 min a fuego medio.",
      "Condimentar con orégano, sal y pimienta.",
      "Servir la pasta con la salsa y queso rallado encima.",
    ],
  },
  {
    id: "5",
    emoji: "🍳",
    title: "Revuelto de huevos y verduras",
    time: "15 min",
    servings: 2,
    difficulty: "Muy fácil",
    diffColor: "#16a34a",
    description:
      "Desayuno nutritivo con huevos, pimentón, espinaca y queso derretido. Listo en minutos.",
    ingredients: [
      { name: "Huevos",    qty: "4 unid.", key: "huevo" },
      { name: "Pimentón",  qty: "½ unid.", key: "pimenton" },
      { name: "Espinaca",  qty: "1 taza",  key: "espinaca" },
      { name: "Queso",     qty: "50 g",    key: "queso" },
      { name: "Leche",     qty: "2 cdas.", key: "leche" },
      { name: "Aceite",    qty: "1 cda.",  key: "aceite" },
    ],
    steps: [
      "Batir los huevos con leche, sal y pimienta.",
      "Calentar aceite y sofreír el pimentón en cubos por 2 min.",
      "Agregar la espinaca y saltear 1 min más.",
      "Verter los huevos y revolver suavemente hasta cuajar.",
      "Añadir queso rallado, apagar el fuego y servir.",
    ],
  },
  {
    id: "6",
    emoji: "🍚",
    title: "Arroz a la jardinera",
    time: "30 min",
    servings: 4,
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Arroz esponjoso con arvejas, zanahoria y choclo. Nutritivo, colorido y versátil.",
    ingredients: [
      { name: "Arroz",             qty: "2 tazas", key: "arroz" },
      { name: "Arvejas",           qty: "1 taza",  key: "arveja" },
      { name: "Zanahoria",         qty: "2 unid.", key: "zanahoria" },
      { name: "Choclo",            qty: "1 taza",  key: "choclo" },
      { name: "Caldo de verduras", qty: "4 tazas", key: "caldo" },
      { name: "Ajo",               qty: "1 diente",key: "ajo" },
      { name: "Aceite",            qty: "2 cdas.", key: "aceite" },
    ],
    steps: [
      "Sofreír el ajo y la zanahoria en cubos por 3 min.",
      "Agregar el arroz y tostar revolviendo 1 min.",
      "Incorporar el caldo caliente. Llevar a hervor.",
      "A los 10 min añadir arvejas y choclo.",
      "Tapar y cocinar 8 min a fuego bajo. Reposar 5 min antes de servir.",
    ],
  },
  {
    id: "7",
    emoji: "🫕",
    title: "Porotos granados",
    time: "90 min",
    servings: 5,
    difficulty: "Media",
    diffColor: "#f59e0b",
    description:
      "Guiso de verano con porotos frescos, choclo y zapallo. Típico chileno de temporada.",
    ingredients: [
      { name: "Porotos granados", qty: "500 g",    key: "poroto" },
      { name: "Choclo",           qty: "2 unid.",  key: "choclo" },
      { name: "Zapallo",          qty: "300 g",    key: "zapallo" },
      { name: "Albahaca",         qty: "1 rama",   key: "albahaca" },
      { name: "Ajo",              qty: "2 dientes",key: "ajo" },
      { name: "Cebolla",          qty: "1 unid.",  key: "cebolla" },
      { name: "Tomates",          qty: "2 unid.",  key: "tomate" },
      { name: "Aceite de oliva",  qty: "3 cdas.",  key: "aceite oliva" },
    ],
    steps: [
      "Sofreír cebolla, ajo y tomate en aceite. Cocinar 5 min.",
      "Agregar los porotos con agua suficiente para cubrirlos.",
      "Cocinar 40 min a fuego medio.",
      "Incorporar choclo en rodajas y zapallo en cubos. Cocinar 30 min más.",
      "Servir caliente con albahaca fresca encima.",
    ],
  },
  {
    id: "8",
    emoji: "🥘",
    title: "Estofado de vacuno",
    time: "50 min",
    servings: 4,
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Carne tierna en salsa de tomate con papas y zanahorias. Un plato que reconforta.",
    ingredients: [
      { name: "Carne de vacuno", qty: "600 g",    key: "vacuno" },
      { name: "Papas",           qty: "4 unid.",  key: "papa" },
      { name: "Zanahoria",       qty: "3 unid.",  key: "zanahoria" },
      { name: "Tomates",         qty: "3 unid.",  key: "tomate" },
      { name: "Cebolla",         qty: "1 unid.",  key: "cebolla" },
      { name: "Ajo",             qty: "3 dientes",key: "ajo" },
      { name: "Vino tinto",      qty: "½ taza",   key: "vino tinto" },
      { name: "Caldo de vacuno", qty: "500 ml",   key: "caldo" },
    ],
    steps: [
      "Sellar la carne en trozos grandes con aceite caliente. Reservar.",
      "Sofreír cebolla y ajo. Agregar tomate y cocinar 5 min.",
      "Añadir el vino y dejar evaporar 2 min.",
      "Incorporar la carne, papas, zanahoria y caldo.",
      "Cocinar tapado 35 min a fuego bajo hasta que la carne esté tierna.",
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function RecipesScreen({ navigation }) {
  const [products, setProducts]               = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [expandedId, setExpandedId]           = useState(null);
  const [addingMap, setAddingMap]             = useState({});

  const { loadCartSummary } = useCartStore();
  const { token }           = useAuthStore();

  // Cargar catálogo real de productos al montar
  useEffect(() => {
    (async () => {
      try {
        // Carga hasta 3 páginas de 50 productos para cubrir catálogos grandes
        const pages = await Promise.all([
          getProducts({ limit: 50, page: 1 }),
          getProducts({ limit: 50, page: 2 }),
          getProducts({ limit: 50, page: 3 }),
        ]);

        // Log para ver la estructura real del response
        console.log("RECIPES page1 keys:", Object.keys(pages[0] || {}));
        console.log("RECIPES page1 raw:", JSON.stringify(pages[0])?.slice(0, 300));

        const extractList = (raw) =>
          Array.isArray(raw)                  ? raw
          : Array.isArray(raw?.products)      ? raw.products
          : Array.isArray(raw?.data)          ? raw.data
          : Array.isArray(raw?.items)         ? raw.items
          : Array.isArray(raw?.results)       ? raw.results
          : Array.isArray(raw?.data?.products)? raw.data.products
          : [];

        const list = pages.flatMap(extractList);
        console.log("RECIPES products loaded:", list.length, list[0]?.name);
        setProducts(list);
      } catch (e) {
        console.log("RECIPES fetch error:", e?.message);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // Busca producto cuyo nombre contenga el key como palabra completa.
  // Primero intenta inicio-de-palabra (evita que "sal" matchee "salsa").
  // Si no encuentra, cae a substring normal.
  const findProduct = useCallback(
    (key) => {
      if (!key || products.length === 0) return null;
      const lower = key.trim().toLowerCase();

      // 1) Palabra completa o inicio de palabra
      const wordMatch = products.find((p) => {
        const haystack = p.search_name || p.name?.toLowerCase() || "";
        return haystack.split(/\s+/).some((word) => word.startsWith(lower));
      });
      if (wordMatch) return wordMatch;

      // 2) Substring como fallback (para claves compuestas como "aceite oliva")
      return (
        products.find((p) => {
          const haystack = p.search_name || p.name?.toLowerCase() || "";
          return haystack.includes(lower);
        }) || null
      );
    },
    [products]
  );

  // Añadir un ingrediente al carrito
  const handleAddIngredient = async (recipe, ingredient) => {
    if (!token) { navigation.navigate("Login"); return; }
    const product = findProduct(ingredient.key);
    if (!product) return;

    const mapKey = `${recipe.id}-${ingredient.name}`;
    setAddingMap((prev) => ({ ...prev, [mapKey]: "loading" }));
    try {
      await addItemToCart({ productId: product._id, quantity: 1 });
      await loadCartSummary();
      setAddingMap((prev) => ({ ...prev, [mapKey]: "done" }));
      setTimeout(() => {
        setAddingMap((prev) => { const n = { ...prev }; delete n[mapKey]; return n; });
      }, 2200);
    } catch {
      setAddingMap((prev) => { const n = { ...prev }; delete n[mapKey]; return n; });
    }
  };

  // Añadir TODOS los ingredientes disponibles de una receta
  const handleAddAll = async (recipe) => {
    if (!token) { navigation.navigate("Login"); return; }
    const available = recipe.ingredients.filter((i) => findProduct(i.key));
    if (available.length === 0) return;

    setAddingMap((prev) => {
      const n = { ...prev };
      available.forEach((i) => { n[`${recipe.id}-${i.name}`] = "loading"; });
      return n;
    });

    for (const ing of available) {
      const product = findProduct(ing.key);
      if (!product) continue;
      try {
        await addItemToCart({ productId: product._id, quantity: 1 });
        setAddingMap((prev) => ({ ...prev, [`${recipe.id}-${ing.name}`]: "done" }));
      } catch {
        setAddingMap((prev) => { const n = { ...prev }; delete n[`${recipe.id}-${ing.name}`]; return n; });
      }
    }

    await loadCartSummary();
    setTimeout(() => {
      setAddingMap((prev) => {
        const n = { ...prev };
        recipe.ingredients.forEach((i) => { delete n[`${recipe.id}-${i.name}`]; });
        return n;
      });
    }, 2500);
  };

  return (
    <ScreenContainer maxWidth={700} padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <AppText style={{ fontSize: 40, marginBottom: 10 }}>🍳</AppText>
          <AppText style={styles.heroTitle}>Ideas para cocinar</AppText>
          <AppText style={styles.heroSub}>
            Recetas con ingredientes que puedes pedir en CIBOX.{"\n"}¡Todo llega a tu puerta!
          </AppText>
        </View>

        {/* ── Tarjetas ── */}
        {RECIPES.map((recipe) => {
          const isExpanded = expandedId === recipe.id;
          const foundCount = recipe.ingredients.filter((i) => findProduct(i.key)).length;

          return (
            <View key={recipe.id} style={styles.card}>

              {/* Encabezado — tap expande/colapsa pasos */}
              <Pressable
                onPress={() => setExpandedId(isExpanded ? null : recipe.id)}
                style={styles.cardHeader}
              >
                <View style={styles.emojiCircle}>
                  <AppText style={{ fontSize: 26 }}>{recipe.emoji}</AppText>
                </View>

                <View style={{ flex: 1 }}>
                  <AppText style={styles.recipeTitle}>{recipe.title}</AppText>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={12} color={colors.muted} />
                      <AppText style={styles.metaText}>{recipe.time}</AppText>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={12} color={colors.muted} />
                      <AppText style={styles.metaText}>{recipe.servings} porciones</AppText>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: `${recipe.diffColor}18` }]}>
                      <AppText style={[styles.diffText, { color: recipe.diffColor }]}>
                        {recipe.difficulty}
                      </AppText>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.muted}
                  style={{ marginLeft: 6 }}
                />
              </Pressable>

              {/* Descripción */}
              <AppText style={styles.description}>{recipe.description}</AppText>

              {/* ── Ingredientes ── */}
              <View style={styles.ingredientsBox}>
                <View style={styles.ingredientsHeader}>
                  <AppText style={styles.sectionLabel}>Ingredientes</AppText>
                  {loadingProducts ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : foundCount > 0 ? (
                    <View style={styles.availableBadge}>
                      <Ionicons name="storefront-outline" size={11} color={colors.primary} />
                      <AppText style={styles.availableText}>{foundCount} en CIBOX</AppText>
                    </View>
                  ) : null}
                </View>

                <View style={styles.chipsContainer}>
                  {recipe.ingredients.map((ing, i) => {
                    const product   = findProduct(ing.key);
                    const mapKey    = `${recipe.id}-${ing.name}`;
                    const status    = addingMap[mapKey];
                    const isLoading = status === "loading";
                    const isDone    = status === "done";

                    return (
                      <Pressable
                        key={i}
                        onPress={() => product && !isLoading && handleAddIngredient(recipe, ing)}
                        disabled={!product || isLoading}
                        style={[
                          styles.chip,
                          product && !isDone && styles.chipAvailable,
                          isDone             && styles.chipDone,
                          !product           && styles.chipUnavailable,
                        ]}
                      >
                        <View style={{ width: 14, alignItems: "center" }}>
                          {isLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : isDone ? (
                            <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                          ) : product ? (
                            <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                          ) : (
                            <Ionicons name="ellipse-outline" size={12} color={colors.muted} />
                          )}
                        </View>
                        <View>
                          <AppText style={[
                            styles.chipName,
                            product && !isDone && { color: colors.primary },
                            isDone             && { color: "#16a34a" },
                            !product           && { color: colors.muted },
                          ]}>
                            {ing.name}
                          </AppText>
                          <AppText style={styles.chipQty}>{ing.qty}</AppText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Leyenda */}
                {!loadingProducts && (
                  <View style={styles.legend}>
                    <Ionicons name="add-circle-outline" size={11} color={colors.primary} />
                    <AppText style={styles.legendText}>
                      Disponible en CIBOX — toca para añadir al carrito
                    </AppText>
                  </View>
                )}
              </View>

              {/* ── Pasos (expandible) ── */}
              {isExpanded && (
                <View style={styles.stepsBox}>
                  <AppText style={[styles.sectionLabel, { marginBottom: 10 }]}>
                    Preparación
                  </AppText>
                  {recipe.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View style={styles.stepBubble}>
                        <AppText style={styles.stepNumber}>{i + 1}</AppText>
                      </View>
                      <AppText style={styles.stepText}>{step}</AppText>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Footer ── */}
              <View style={styles.cardFooter}>
                <Pressable
                  onPress={() => setExpandedId(isExpanded ? null : recipe.id)}
                  style={styles.stepsBtn}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-up-circle-outline" : "list-outline"}
                    size={14}
                    color={colors.primary}
                  />
                  <AppText style={styles.stepsBtnText}>
                    {isExpanded ? "Ocultar pasos" : "Ver preparación"}
                  </AppText>
                </Pressable>

                {foundCount > 0 && (
                  <Pressable onPress={() => handleAddAll(recipe)} style={styles.addAllBtn}>
                    <Ionicons name="cart-outline" size={14} color="#fff" />
                    <AppText style={styles.addAllText}>
                      Añadir {foundCount} {foundCount === 1 ? "ingrediente" : "ingredientes"}
                    </AppText>
                  </Pressable>
                )}
              </View>

            </View>
          );
        })}

        {/* ── CTA final ── */}
        <Pressable
          onPress={() => navigation.navigate("Products")}
          style={styles.cta}
        >
          <Ionicons name="storefront-outline" size={16} color="#fff" />
          <AppText style={styles.ctaText}>Ver todos los productos →</AppText>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#fef3c7",
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: colors.muted,
  },
  diffBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginBottom: 12,
  },

  ingredientsBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  ingredientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.primary}12`,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availableText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipAvailable: {
    backgroundColor: `${colors.primary}10`,
    borderColor: `${colors.primary}30`,
  },
  chipDone: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  chipUnavailable: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipName: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipQty: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  legendText: {
    fontSize: 10,
    color: colors.muted,
    fontStyle: "italic",
  },

  stepsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  stepBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  stepText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
    flex: 1,
  },

  cardFooter: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  stepsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    backgroundColor: `${colors.primary}08`,
  },
  stepsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  addAllBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  addAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
