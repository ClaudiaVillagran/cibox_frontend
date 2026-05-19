import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AppText from "../components/AppText";
import { colors, spacing, radius } from "../constants/theme";
import useMissionStore from "../store/missionStore";
import useAuthStore from "../store/authStore";

const MISSION_COLORS = {
  first_purchase: "#4E9B27",
  complete_profile: "#2196F3",
  five_favorites: "#E91E63",
  leave_review: "#FF9800",
  share_app: "#9C27B0",
};

const HINTS = {
  first_purchase: "Completa al menos una compra en CIBOX.",
  complete_profile: "Ve a tu Perfil y agrega teléfono y RUT.",
  five_favorites: "Agrega 5 productos distintos a Favoritos.",
  leave_review: "Deja una reseña en un producto que hayas comprado.",
  share_app: "Usa el botón Compartir que aparece aquí.",
};

function MissionCard({ mission, onVerify, onClaim, verifying, claiming }) {
  const isCompleted = mission.is_completed;
  const isClaimed = mission.reward_claimed;
  const color = MISSION_COLORS[mission.key] || colors.primary;

  return (
    <View style={[styles.card, isCompleted && { borderColor: color + "55", backgroundColor: "#fafffe" }]}>
      {/* Icono */}
      <View style={[styles.iconWrap, { backgroundColor: color + "1A" }]}>
        <AppText style={{ fontSize: 28 }}>{mission.icon}</AppText>
        {isCompleted && (
          <View style={[styles.checkBadge, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={9} color="#fff" />
          </View>
        )}
      </View>

      {/* Contenido */}
      <View style={{ flex: 1, gap: 4 }}>
        <AppText style={[styles.cardTitle, isCompleted && { color }]}>
          {mission.title}
        </AppText>
        <AppText style={styles.cardDesc}>{mission.description}</AppText>

        {/* Chip recompensa */}
        <View style={[styles.rewardChip, { backgroundColor: color + "15", borderColor: color + "40" }]}>
          <Ionicons name="gift-outline" size={11} color={color} />
          <AppText style={[styles.rewardLabel, { color }]}>{mission.reward}</AppText>
        </View>

        {/* Acción */}
        {!isCompleted && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: color }]}
            onPress={() => onVerify(mission.key)}
            disabled={verifying === mission.key}
          >
            {verifying === mission.key ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText style={styles.actionBtnText}>
                {mission.key === "share_app" ? "📢 Compartir y completar" : "Verificar misión"}
              </AppText>
            )}
          </Pressable>
        )}

        {isCompleted && !isClaimed && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#F7B81C" }]}
            onPress={() => onClaim(mission.key)}
            disabled={claiming === mission.key}
          >
            {claiming === mission.key ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText style={styles.actionBtnText}>🎁 Reclamar recompensa</AppText>
            )}
          </Pressable>
        )}

        {isClaimed && mission.reward_code && (
          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <AppText style={styles.codeLabel}>Código:</AppText>
              <AppText style={styles.codeText}>{mission.reward_code}</AppText>
            </View>
            <AppText style={styles.codeHint}>Úsalo en el checkout</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MissionsScreen() {
  const navigation = useNavigation();
  const { token } = useAuthStore();
  const { missions, stats, loading, loadMissions, verifyMission, claimReward } =
    useMissionStore();
  const [verifying, setVerifying] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;

  useEffect(() => {
    if (token) loadMissions();
  }, [token]);

  const handleVerify = async (key) => {
    if (!token) {
      Alert.alert(
        "Inicia sesión",
        "Necesitas una cuenta para completar misiones",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar sesión", onPress: () => navigation.navigate("Auth") },
        ]
      );
      return;
    }

    if (key === "share_app") {
      try {
        const result = await Share.share({
          message:
            "Descubre CIBOX 🥦 — Cajas de productos frescos a precio justo, directo a tu casa. ¡Descárgala ya!",
          url: "https://cibox.cl",
          title: "CIBOX — Productos frescos",
        });
        if (result.action === Share.dismissedAction) return;
      } catch {
        return;
      }
    }

    setVerifying(key);
    try {
      const result = await verifyMission(key);
      if (result.data?.completed) {
        Alert.alert(
          "¡Misión completada! 🎉",
          result.message || "Ahora reclama tu recompensa.",
          [{ text: "¡Excelente!" }]
        );
      } else {
        Alert.alert("Misión pendiente ⏳", HINTS[key] || result.message || "Aún no cumples la condición.");
      }
    } catch {
      Alert.alert("Error", "No se pudo verificar. Intenta nuevamente.");
    } finally {
      setVerifying(null);
    }
  };

  const handleClaim = async (key) => {
    setClaiming(key);
    try {
      const result = await claimReward(key);
      Alert.alert(
        "🎁 ¡Recompensa desbloqueada!",
        `Tu código: ${result.data?.reward_code}\n\nÚsalo al pagar. Válido por 30 días.`,
        [{ text: "¡Genial!" }]
      );
    } catch {
      Alert.alert("Error", "No se pudo reclamar. Intenta más tarde.");
    } finally {
      setClaiming(null);
    }
  };

  const progressPct = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const maxWidth = isDesktop ? 680 : "100%";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48, alignItems: "center" }}
    >
      {/* Hero */}
      <View style={[styles.hero, { width: "100%" }]}>
        <View style={styles.heroInner}>
          <AppText style={styles.heroEmoji}>🏆</AppText>
          <AppText style={styles.heroTitle}>Misiones CIBOX</AppText>
          <AppText style={styles.heroSub}>
            Completa retos y desbloquea descuentos exclusivos
          </AppText>

          {token && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              <AppText style={styles.progressText}>
                {stats.completed} de {stats.total} misiones completadas
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Cards */}
      <View style={{ width: maxWidth, paddingHorizontal: spacing.md, gap: 12, marginTop: spacing.md }}>
        {!token ? (
          <View style={styles.authPrompt}>
            <AppText style={{ fontSize: 44, marginBottom: 12 }}>🔒</AppText>
            <AppText style={styles.authTitle}>Inicia sesión para ver tus misiones</AppText>
            <AppText style={styles.authSub}>
              Completa retos y gana descuentos que se aplican directo en el checkout.
            </AppText>
            <Pressable
              style={styles.loginBtn}
              onPress={() => navigation.navigate("Auth")}
            >
              <AppText style={styles.loginBtnText}>Iniciar sesión</AppText>
            </Pressable>
          </View>
        ) : loading && missions.length === 0 ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ marginTop: 60 }}
          />
        ) : (
          missions.map((m) => (
            <MissionCard
              key={m.key}
              mission={m}
              onVerify={handleVerify}
              onClaim={handleClaim}
              verifying={verifying}
              claiming={claiming}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f8" },

  // Hero
  hero: { backgroundColor: colors.primary },
  heroInner: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 4,
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 4 },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  progressWrap: { width: "100%", gap: 8, alignItems: "center" },
  progressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#F7B81C", borderRadius: 5 },
  progressText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#e7e7e7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  cardDesc: { fontSize: 12, color: "#666", lineHeight: 17 },
  rewardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  rewardLabel: { fontSize: 11, fontWeight: "700" },
  actionBtn: {
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: "center",
    alignSelf: "flex-start",
    minWidth: 130,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  codeRow: { gap: 4 },
  codeBox: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  codeLabel: { color: "#888", fontSize: 11 },
  codeText: { color: "#F7B81C", fontSize: 14, fontWeight: "800", letterSpacing: 1.2 },
  codeHint: { fontSize: 11, color: "#888" },

  // Auth prompt
  authPrompt: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
  },
  authTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 8, textAlign: "center" },
  authSub: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 19 },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 36,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});