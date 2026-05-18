import { ScrollView, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";

const STEPS = [
  {
    icon: "search-outline",
    title: "1. Explora nuestros productos",
    description:
      "Navega por cientos de productos frescos y de despensa. Filtra por categoría o busca lo que necesitas.",
  },
  {
    icon: "cube-outline",
    title: "2. Arma tu caja o compra suelto",
    description:
      "Puedes armar una caja personalizada con lo que quieras, o agregar productos individuales directo al carrito.",
  },
  {
    icon: "card-outline",
    title: "3. Paga de forma segura",
    description:
      "Pagamos con Webpay Plus. Tu información siempre protegida con tecnología de punta.",
  },
  {
    icon: "bicycle-outline",
    title: "4. Recibe en tu puerta",
    description:
      "Coordinamos el despacho a tu dirección. Fresco y a tiempo, sin que tengas que salir de casa.",
  },
  {
    icon: "star-outline",
    title: "5. Cibox+",
    description:
      "Suscríbete a Cibox+ y accede a precios exclusivos, descuentos especiales y envíos prioritarios.",
  },
];

export default function HowItWorksScreen({ navigation }) {
  return (
    <ScreenContainer maxWidth={700} padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Hero */}
        <View
          style={{
            backgroundColor: `${colors.primary}12`,
            borderRadius: 20,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: `${colors.primary}25`,
          }}
        >
          <Ionicons
            name="information-circle"
            size={48}
            color={colors.primary}
            style={{ marginBottom: 12 }}
          />
          <AppText
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: colors.text,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            ¿Cómo funciona CIBOX?
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            Tu supermercado inteligente. Compra más fácil, ahorra más y recibe
            todo en la puerta de tu casa.
          </AppText>
        </View>

        {/* Pasos */}
        {STEPS.map((step, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.md,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 14,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${colors.primary}15`,
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Ionicons name={step.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {step.title}
              </AppText>
              <AppText
                style={{ fontSize: 13, color: colors.muted, lineHeight: 20 }}
              >
                {step.description}
              </AppText>
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
            marginTop: spacing.md,
          }}
        >
          <AppText
            style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}
          >
            Empezar a comprar →
          </AppText>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}