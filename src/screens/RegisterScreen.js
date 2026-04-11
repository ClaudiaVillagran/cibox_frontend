import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { registerRequest } from "../services/authService";
import { showAppAlert } from "../utils/appAlerts";
import { colors, spacing, shadows } from "../constants/theme";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showAppAlert("Faltan datos", "Completa nombre, correo y contraseña");
      return;
    }

    try {
      setLoading(true);

      await registerRequest({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      showAppAlert("Éxito", "Cuenta creada correctamente");
      navigation.goBack();
    } catch (error) {
      console.log("REGISTER ERROR:", error?.response?.data || error.message);
      showAppAlert(
        "Error",
        error?.response?.data?.message || "No se pudo crear la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 28,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.xl,
              minHeight: 660,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#dfe8d8",
              ...shadows.card,
            }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                position: "absolute",
                top: spacing.lg,
                left: spacing.lg,
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.muted} />
            </Pressable>

            <View style={{ marginTop: 20 }}>
              <View style={{ marginBottom: spacing.lg }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "900",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Crear cuenta
                </Text>

                <Text
                  style={{
                    color: colors.muted,
                    textAlign: "center",
                    lineHeight: 20,
                    fontSize: 14,
                    paddingHorizontal: 8,
                  }}
                >
                  Regístrate en CIBOX para guardar tus pedidos, favoritos y datos
                  de compra.
                </Text>
              </View>

              <View style={{ marginBottom: spacing.md }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: "#cfdcc6",
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    height: 54,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={colors.muted}
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    placeholder="Nombre"
                    placeholderTextColor="#9a9a9a"
                    value={name}
                    onChangeText={setName}
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.md }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: "#cfdcc6",
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    height: 54,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={colors.muted}
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#9a9a9a"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.lg }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: "#cfdcc6",
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    height: 54,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.muted}
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    placeholder="Contraseña"
                    placeholderTextColor="#9a9a9a"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleRegister}
                disabled={loading}
                style={{
                  height: 54,
                  borderRadius: 999,
                  backgroundColor: loading ? colors.muted : colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  ...shadows.card,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text
                    style={{
                      color: colors.primaryText,
                      fontSize: 16,
                      fontWeight: "800",
                      letterSpacing: 0.4,
                    }}
                  >
                    REGISTRARME
                  </Text>
                )}
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: spacing.lg,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  ¿Ya tienes cuenta?
                </Text>

                <Pressable onPress={() => navigation.goBack()}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "800",
                      fontSize: 14,
                      marginLeft: 8,
                    }}
                  >
                    Inicia sesión
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: spacing.lg,
                  marginBottom: spacing.md,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.border,
                  }}
                />
                <Text
                  style={{
                    marginHorizontal: 12,
                    color: colors.muted,
                    fontWeight: "700",
                  }}
                >
                  O
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              <Text
                style={{
                  textAlign: "center",
                  color: colors.muted,
                  fontSize: 13,
                  marginBottom: spacing.md,
                }}
              >
                Crea tu cuenta para una experiencia de compra más rápida.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${colors.primaryLight}55`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="bag-handle-outline" size={20} color={colors.primary} />
                </View>

                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${colors.primaryLight}55`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="heart-outline" size={20} color={colors.primary} />
                </View>

                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${colors.primaryLight}55`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}