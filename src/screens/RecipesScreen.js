import { ScrollView, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";

const RECIPES = [
  {
    id: "1",
    emoji: "🍲",
    title: "Cazuela de vacuno",
    time: "60 min",
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "El clásico chileno. Caldo reconfortante con papas, choclo, zapallo y carne a fuego lento.",
    ingredients: ["Carne de vacuno", "Papas", "Choclo", "Zapallo", "Porotos verdes", "Arroz"],
  },
  {
    id: "2",
    emoji: "🥗",
    title: "Ensalada chilena",
    time: "10 min",
    difficulty: "Muy fácil",
    diffColor: "#16a34a",
    description:
      "Tomate, cebolla y cilantro. El acompañamiento infaltable en la mesa chilena.",
    ingredients: ["Tomates", "Cebolla", "Cilantro", "Aceite de oliva", "Sal"],
  },
  {
    id: "3",
    emoji: "🌽",
    title: "Pastel de choclo",
    time: "75 min",
    difficulty: "Media",
    diffColor: "#f59e0b",
    description:
      "Cubierta de choclo molido sobre pino de carne, huevo duro y aceitunas. Sabor único.",
    ingredients: ["Choclo", "Carne molida", "Cebolla", "Huevos", "Aceitunas", "Albahaca"],
  },
  {
    id: "4",
    emoji: "🍝",
    title: "Tallarines con salsa casera",
    time: "25 min",
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Pasta al dente con salsa de tomate natural, ajo y orégano. Rápido y delicioso.",
    ingredients: ["Tallarines", "Tomates", "Ajo", "Cebolla", "Aceite de oliva", "Orégano"],
  },
  {
    id: "5",
    emoji: "🍳",
    title: "Revuelto de huevos y verduras",
    time: "15 min",
    difficulty: "Muy fácil",
    diffColor: "#16a34a",
    description:
      "Desayuno nutritivo con huevos, pimentón, espinaca y queso derretido. Listo en minutos.",
    ingredients: ["Huevos", "Pimentón", "Espinaca", "Queso", "Aceite", "Sal y pimienta"],
  },
  {
    id: "6",
    emoji: "🍚",
    title: "Arroz a la jardinera",
    time: "30 min",
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Arroz esponjoso con arvejas, zanahoria y choclo. Nutritivo, colorido y versátil.",
    ingredients: ["Arroz", "Arvejas", "Zanahoria", "Choclo", "Caldo de verduras"],
  },
  {
    id: "7",
    emoji: "🫕",
    title: "Porotos granados",
    time: "90 min",
    difficulty: "Media",
    diffColor: "#f59e0b",
    description:
      "Guiso de verano con porotos frescos, choclo y zapallo. Típico chileno de temporada.",
    ingredients: ["Porotos granados", "Choclo", "Zapallo", "Albahaca", "Ajo", "Cebolla"],
  },
  {
    id: "8",
    emoji: "🥘",
    title: "Estofado de vacuno",
    time: "50 min",
    difficulty: "Fácil",
    diffColor: "#16a34a",
    description:
      "Carne tierna en salsa de tomate con papas y zanahorias. Un plato que reconforta.",
    ingredients: ["Carne de vacuno", "Papas", "Zanahoria", "Tomates", "Cebolla", "Vino tinto"],
  },
];

export default function RecipesScreen({ navigation }) {
  return (
    <ScreenContainer maxWidth={700} padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Hero */}
        <View
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: 20,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#fde68a",
          }}
        >
          <AppText style={{ fontSize: 40, marginBottom: 10 }}>🍳</AppText>
          <AppText
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: colors.text,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Ideas para cocinar
          </AppText>
          <AppText
            style={{
              fontSize: 13,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Recetas simples con ingredientes que puedes pedir en CIBOX. ¡Todo
            llega a tu puerta!
          </AppText>
        </View>

        {/* Recetas */}
        {RECIPES.map((recipe) => (
          <View
            key={recipe.id}
            style={{
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
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#fef3c7",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <AppText style={{ fontSize: 26 }}>{recipe.emoji}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {recipe.title}
                </AppText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons name="time-outline" size={13} color={colors.muted} />
                    <AppText style={{ fontSize: 12, color: colors.muted }}>
                      {recipe.time}
                    </AppText>
                  </View>
                  <View
                    style={{
                      backgroundColor: `${recipe.diffColor}18`,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: recipe.diffColor,
                      }}
                    >
                      {recipe.difficulty}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            {/* Descripción */}
            <AppText
              style={{
                fontSize: 13,
                color: colors.muted,
                lineHeight: 19,
                marginBottom: 10,
              }}
            >
              {recipe.description}
            </AppText>

            {/* Ingredientes */}
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <AppText
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 6,
                }}
              >
                Ingredientes:
              </AppText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {recipe.ingredients.map((ing, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: `${colors.primary}15`,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: colors.primary,
                      }}
                    >
                      {ing}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* CTA */}
        <Pressable
          onPress={() => navigation.navigate("Products")}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: spacing.sm,
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
            Comprar ingredientes en CIBOX →
          </AppText>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}