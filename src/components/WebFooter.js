import { Linking, Pressable, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AppText from "./AppText";
import useAuthStore from "../store/authStore";

const BG       = "#2B2B2B";
const BG_LINE  = "#3D3D3D";
const TEXT     = "#FFFFFF";
const MUTED    = "#AAAAAA";
const PRIMARY  = "#4E9B27";

// ─── Link helper ────────────────────────────────────────────────────────────
function FooterLink({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 10 }}>
      {({ hovered }) => (
        <AppText style={{
          fontSize: 13,
          color: hovered ? "#fff" : MUTED,
          fontWeight: "500",
          transitionDuration: "120ms",
        }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

// ─── Columna ─────────────────────────────────────────────────────────────────
function Col({ title, children }) {
  return (
    <View style={{ flex: 1, minWidth: 160 }}>
      <AppText style={{
        fontSize: 12,
        fontWeight: "900",
        color: TEXT,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 18,
      }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

// ─── Ícono social ─────────────────────────────────────────────────────────────
function SocialBtn({ name, url }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: BG_LINE,
        backgroundColor: pressed ? "#3a3a3a" : "transparent",
        justifyContent: "center",
        alignItems: "center",
      })}
    >
      <Ionicons name={name} size={19} color={MUTED} />
    </Pressable>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function WebFooter() {
  const navigation = useNavigation();
  const { token } = useAuthStore();

  return (
    <View style={{ backgroundColor: BG }}>
      {/* Separador superior */}
      <View style={{ height: 1, backgroundColor: BG_LINE }} />

      {/* Cuerpo del footer */}
      <View style={{
        maxWidth: 1280,
        alignSelf: "center",
        width: "100%",
        paddingHorizontal: 32,
        paddingVertical: 48,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 32,
      }}>

        {/* ── Columna 1: Contáctanos ── */}
        <Col title="Contáctanos">
          <Pressable
            onPress={() => Linking.openURL("tel:+56991264828")}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}
          >
            <Ionicons name="logo-whatsapp" size={16} color={MUTED} />
            <AppText style={{ fontSize: 13, color: MUTED, fontWeight: "500" }}>
              +569 91264828
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("mailto:soporte@cibox.cl")}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}
          >
            <Ionicons name="mail-outline" size={16} color={MUTED} />
            <AppText style={{ fontSize: 13, color: MUTED, fontWeight: "500" }}>
              soporte@cibox.cl
            </AppText>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <SocialBtn name="logo-facebook"  url="https://facebook.com/cibox.cl" />
            <SocialBtn name="logo-instagram" url="https://instagram.com/cibox_supermercado" />
            <SocialBtn name="logo-whatsapp"  url="https://wa.me/56991264828" />
          </View>
        </Col>

        {/* ── Columna 2: Información ── */}
        <Col title="Información">
          <FooterLink label="Registro vendedores"  onPress={() => navigation.navigate("Auth")} />
          <FooterLink label="Nuestra empresa"      onPress={() => navigation.navigate("HowItWorks")} />
          <FooterLink label="Términos y condiciones" onPress={() => navigation.navigate("Terms")} />
          <FooterLink label="Cambios y devoluciones" onPress={() => Linking.openURL("https://www.cibox.cl/devoluciones")} />
          <FooterLink label="Seguridad y privacidad" onPress={() => navigation.navigate("Privacy")} />
          <FooterLink label="Contáctanos"           onPress={() => navigation.navigate("Contact")} />
        </Col>

        {/* ── Columna 3: Sobre tus compras ── */}
        <Col title="Sobre tus compras">
          <FooterLink
            label="Mi Cuenta"
            onPress={() => navigation.navigate(token ? "ProfileTab" : "Auth")}
          />
          <FooterLink label="Carrito"          onPress={() => navigation.navigate("Cart")} />
          <FooterLink label="Finalizar compra" onPress={() => navigation.navigate("Checkout")} />
          <FooterLink label="Mis órdenes"      onPress={() => navigation.navigate(token ? "OrdersTab" : "Auth")} />
        </Col>

        {/* ── Columna 4: Medios de pago ── */}
        <Col title="Medios de pago">
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignSelf: "flex-start",
            alignItems: "center",
          }}>
            <AppText style={{ fontSize: 17, fontWeight: "900", color: "#6B1FA8", letterSpacing: -0.5 }}>
              •webpay.
            </AppText>
            <AppText style={{ fontSize: 10, fontWeight: "700", color: "#E1211B", letterSpacing: 0.5 }}>
              transbank
            </AppText>
          </View>
        </Col>
      </View>

      {/* ── Bottom bar ── */}
      <View style={{
        borderTopWidth: 1,
        borderColor: BG_LINE,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center",
      }}>
        <AppText style={{ fontSize: 12, color: MUTED, textAlign: "center" }}>
          © 2026 Cibox. Desarrollado por Claudia Villagrán
        </AppText>
      </View>
    </View>
  );
}
