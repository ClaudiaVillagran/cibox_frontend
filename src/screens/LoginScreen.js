import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  loginRequest,
  resendVerificationRequest,
} from "../services/authService";
import useAuthStore from "../store/authStore";
import { showAppAlert } from "../utils/appAlerts";
import { colors, spacing, shadows } from "../constants/theme";
import AppText from "../components/AppText";

export default function LoginScreen({ navigation }) {
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAppAlert("Faltan datos", "Ingresa tu correo y contraseña");
      return;
    }

    try {
      setLoading(true);

      const data = await loginRequest({
        email: email.trim().toLowerCase(),
        password,
      });

      const user = data.user || data.data?.user;
      const token = data.token || data.data?.token;

      if (!user || !token) {
        throw new Error("No se recibió la sesión correctamente");
      }

      await setAuth({ user, token });

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.history.replaceState({}, "", "/");
      }

      navigation.reset({
        index: 0,
        routes: [{ name: Platform.OS === "web" ? "Inicio" : "MainTabs" }],
      });
    } catch (error) {
      console.log("LOGIN ERROR:", error?.response?.data || error.message);

      const message = error?.response?.data?.message || "Login fallido";

      if (message.includes("verificar tu correo")) {
        showAppAlert(
          "Correo no verificado",
          "Debes verificar tu correo antes de iniciar sesión.",
        );
        return;
      }

      showAppAlert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      showAppAlert(
        "Falta correo",
        "Ingresa tu correo para reenviar verificación",
      );
      return;
    }

    try {
      setLoading(true);

      await resendVerificationRequest({
        email: email.trim().toLowerCase(),
      });

      showAppAlert(
        "Correo reenviado",
        "Te enviamos nuevamente el correo de verificación.",
      );
    } catch (error) {
      showAppAlert(
        "Error",
        error?.response?.data?.message || "No se pudo reenviar el correo",
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
              minHeight: 620,
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

            <View style={{ marginTop: 28 }}>
              <View style={{ marginBottom: spacing.lg }}>
                <AppText
                  style={{
                    fontSize: 30,
                    fontWeight: "900",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Iniciar sesión
                </AppText>

                <AppText
                  style={{
                    color: colors.muted,
                    textAlign: "center",
                    lineHeight: 20,
                    fontSize: 14,
                    paddingHorizontal: 8,
                  }}
                >
                  Accede a tu cuenta CIBOX para revisar pedidos, favoritos y tu
                  perfil.
                </AppText>
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
                onPress={handleLogin}
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
                  <AppText
                    style={{
                      color: colors.primaryText,
                      fontSize: 16,
                      fontWeight: "800",
                      letterSpacing: 0.4,
                    }}
                  >
                    INGRESAR
                  </AppText>
                )}
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("ForgotPassword")}
                style={{
                  marginTop: spacing.sm,
                  alignItems: "center",
                }}
              >
                <AppText
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleResendVerification}
                style={{
                  marginTop: spacing.sm,
                  alignItems: "center",
                }}
              >
                <AppText
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Reenviar verificación de correo
                </AppText>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: spacing.lg,
                  alignItems: "center",
                }}
              >
                <AppText style={{ color: colors.muted, fontSize: 14 }}>
                  ¿No tienes cuenta?
                </AppText>

                <Pressable onPress={() => navigation.navigate("Register")}>
                  <AppText
                    style={{
                      color: colors.primary,
                      fontWeight: "800",
                      fontSize: 14,
                      marginLeft: 8,
                    }}
                  >
                    Regístrate
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
