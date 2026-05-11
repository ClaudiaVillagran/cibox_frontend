import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";
import { createOrderFromCustomBox, createWebpayTransaction } from "../services/orderService";
import { previewShipping as previewShippingService } from "../services/shippingService";
import { getCheckoutAddress, saveCheckoutAddress } from "../utils/checkoutStorage";
import { showAppAlert } from "../utils/appAlerts";
import { CHILE_REGIONS } from "../constants/chileLocations";
import useAuthStore from "../store/authStore";

const normalizeEmail = (e) => String(e).trim().toLowerCase();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(e));
const normalizePhoneCL = (phone = "") => {
  let v = String(phone).replace(/[^\d+]/g, "");
  if (v.startsWith("56")) v = `+${v}`;
  if (!v.startsWith("+56") && v.length === 9 && v.startsWith("9")) v = `+56${v}`;
  return v;
};
const isValidPhoneCL = (p) => /^\+569\d{8}$/.test(normalizePhoneCL(p));
const cleanRut = (r) => String(r).replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
const formatRut = (r) => {
  const c = cleanRut(r);
  if (c.length < 2) return c;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  let out = "";
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    out = body[i] + out;
    count++;
    if (count === 3 && i !== 0) { out = "." + out; count = 0; }
  }
  return `${out}-${dv}`;
};
const isValidRut = (r) => {
  const c = cleanRut(r);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  let sum = 0, multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - (sum % 11);
  const expected = result === 11 ? "0" : result === 10 ? "K" : String(result);
  return expected === dv;
};

export default function CustomBoxCheckoutScreen({ route, navigation }) {
  const { box } = route.params || {};
  const { token } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rut, setRut] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [reference, setReference] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const regionOptions = useMemo(() => {
    if (!Array.isArray(CHILE_REGIONS)) return [];
    return CHILE_REGIONS.map((r) => ({
      label: r.label || r.name || r.value,
      value: r.value || r.label || r.name,
      cities: Array.isArray(r.cities) ? r.cities : [],
    }));
  }, []);

  const cityOptions = useMemo(() => {
    const found = regionOptions.find((r) => r.value === region);
    if (!found?.cities?.length) return [];
    return found.cities.map((c) => ({ label: c, value: c }));
  }, [region, regionOptions]);

  const formatPrice = (v) => `$${Number(v || 0).toLocaleString("es-CL")}`;

  const subtotal = box?.subtotal || box?.total || 0;
  const shippingAmount = Number(shippingQuote?.amount || 0);
  const finalTotal = subtotal + shippingAmount;

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await getCheckoutAddress();
        if (saved) {
          setFullName(saved.fullName || "");
          setEmail(saved.email || "");
          setPhone(saved.phone || "");
          setRut(saved.rut || "");
          setRegion(saved.region || "");
          setCity(saved.city || "");
          setAddress(saved.address || "");
          setAddressLine2(saved.addressLine2 || "");
          setReference(saved.reference || "");
        }
      } catch (e) {
        console.log("LOAD ADDRESS ERROR:", e);
      } finally {
        setLoadingAddress(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!region || !city || !address) { setShippingQuote(null); return; }
      try {
        setShippingLoading(true);
        const response = await previewShippingService({
          shipping: { region, city, address, addressLine2, reference },
        });
        const quote = response?.quote || response?.data?.quote || response?.data || response;
        const options = (quote?.services || quote?.rates || quote?.options || []).map((item, i) => ({
          id: item?.id || `${i}`,
          name: item?.service_name || item?.name || "Blue Express",
          amount: Number(item?.amount ?? item?.price ?? 0) || 0,
        }));
        setShippingQuote(options[0] || null);
      } catch (e) {
        setShippingQuote(null);
      } finally {
        setShippingLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [region, city, address, addressLine2, reference]);

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = "Ingresa tu nombre";
    if (!isValidEmail(email)) next.email = "Correo inválido";
    if (!isValidPhoneCL(phone)) next.phone = "Teléfono inválido";
    if (!isValidRut(rut)) next.rut = "RUT inválido";
    if (!region) next.region = "Selecciona una región";
    if (!city) next.city = "Selecciona una comuna";
    if (address.trim().length < 5) next.address = "Dirección inválida";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) { showAppAlert("Revisa tus datos", "Hay campos inválidos"); return; }
    if (!shippingQuote?.amount) { showAppAlert("Envío", "Calcula el envío antes de continuar"); return; }

    try {
      setSubmitting(true);

      const payload = {
        items: (box.items || []).map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
        customer: {
          fullName: fullName.trim(),
          email: normalizeEmail(email),
          phone: normalizePhoneCL(phone),
          rut: formatRut(rut),
        },
        shipping: {
          region: region.trim(),
          city: city.trim(),
          address: address.trim(),
          addressLine2: addressLine2.trim(),
          reference: reference.trim(),
        },
        payment: {
          method: "webpay",
          platform: Platform.OS === "web" ? "web" : Platform.OS,
        },
        couponCode: couponCode.trim().toUpperCase() || undefined,
      };

      const orderResponse = await createOrderFromCustomBox(payload);
      const order = orderResponse?.order || orderResponse?.data?.order || orderResponse?.data || orderResponse;

      if (!order?._id) throw new Error("No se pudo obtener la orden");

      const guestToken = orderResponse?.guest_token || orderResponse?.data?.guest_token || null;

      const payment = await createWebpayTransaction({
        orderId: order._id,
        platform: Platform.OS === "web" ? "web" : Platform.OS,
        guestToken,
      });

      await saveCheckoutAddress({
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        phone: normalizePhoneCL(phone),
        rut: formatRut(rut),
        region, city,
        address: address.trim(),
        addressLine2: addressLine2.trim(),
        reference: reference.trim(),
        paymentMethod: "webpay",
      });

      if (!payment?.paymentToken || !payment?.paymentUrl) {
        showAppAlert("Error", "No se pudo iniciar el pago");
        return;
      }

      navigation.replace("Webpay", {
        orderId: order._id,
        paymentToken: payment.paymentToken,
        paymentUrl: payment.paymentUrl,
      });
    } catch (error) {
      console.log("CUSTOM BOX CHECKOUT ERROR:", error?.response?.data || error.message);
      showAppAlert("Error", error?.response?.data?.message || error.message || "No se pudo procesar el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    borderWidth: 1, borderColor: "#DDE7D7", borderRadius: 14,
    backgroundColor: "#FAFBF8", paddingHorizontal: 14, paddingVertical: 13,
    color: colors.text, fontSize: 15, minHeight: 52,
  };
  const labelStyle = { color: colors.text, fontWeight: "700", marginBottom: 6, fontSize: 14 };
  const cardStyle = {
    borderWidth: 1, borderColor: "#DDE7D7", borderRadius: 20,
    backgroundColor: "#FFFFFF", padding: 14, marginBottom: 14,
  };

  if (loadingAddress) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <AppText style={{ fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: 6 }}>
          Confirmar pedido
        </AppText>
        <AppText style={{ color: colors.muted, marginBottom: spacing.md }}>
          Completa tus datos para enviar tu caja personalizada.
        </AppText>

        {/* Resumen de la caja */}
        <View style={cardStyle}>
          <AppText style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 }}>
            Tu caja personalizada
          </AppText>
          {(box?.items || []).map((item, index) => (
            <View key={String(item.product_id) + index} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <AppText style={{ flex: 1, color: colors.text, fontSize: 14 }} numberOfLines={1}>
                {item.quantity}x {item.name}
              </AppText>
              <AppText style={{ color: colors.muted, fontSize: 14 }}>
                {formatPrice(item.subtotal)}
              </AppText>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: "#EEF3EA", marginTop: 10, paddingTop: 10 }}>
            <AppText style={{ fontWeight: "800", color: colors.text }}>
              Subtotal: {formatPrice(subtotal)}
            </AppText>
          </View>
        </View>

        {/* Contacto */}
        <View style={cardStyle}>
          <AppText style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 }}>Contacto</AppText>

          <AppText style={labelStyle}>Nombre completo</AppText>
          <TextInput value={fullName} onChangeText={setFullName} placeholder="Ej: Claudia Pérez" style={{ ...inputStyle, marginBottom: errors.fullName ? 4 : 14 }} placeholderTextColor="#999" />
          {errors.fullName ? <AppText style={{ color: "#b91c1c", fontSize: 12, marginBottom: 10 }}>{errors.fullName}</AppText> : null}

          <AppText style={labelStyle}>RUT</AppText>
          <TextInput value={rut} onChangeText={(v) => setRut(formatRut(v))} placeholder="Ej: 12.345.678-5" autoCapitalize="characters" style={{ ...inputStyle, marginBottom: errors.rut ? 4 : 14 }} placeholderTextColor="#999" />
          {errors.rut ? <AppText style={{ color: "#b91c1c", fontSize: 12, marginBottom: 10 }}>{errors.rut}</AppText> : null}

          <AppText style={labelStyle}>Correo electrónico</AppText>
          <TextInput value={email} onChangeText={setEmail} placeholder="Ej: correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" style={{ ...inputStyle, marginBottom: errors.email ? 4 : 14 }} placeholderTextColor="#999" />
          {errors.email ? <AppText style={{ color: "#b91c1c", fontSize: 12, marginBottom: 10 }}>{errors.email}</AppText> : null}

          <AppText style={labelStyle}>Teléfono</AppText>
          <TextInput value={phone} onChangeText={setPhone} placeholder="+56 9 1234 5678" keyboardType="phone-pad" style={inputStyle} placeholderTextColor="#999" />
          {errors.phone ? <AppText style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>{errors.phone}</AppText> : null}
        </View>

        {/* Envío */}
        <View style={cardStyle}>
          <AppText style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 }}>Envío</AppText>

          <AppText style={labelStyle}>Región</AppText>
          <View style={{ borderWidth: 1, borderColor: "#DDE7D7", borderRadius: 14, backgroundColor: "#FAFBF8", marginBottom: 14 }}>
            {regionOptions.map((r) => (
              <Pressable key={r.value} onPress={() => { setRegion(r.value); setCity(""); }}
                style={{ paddingHorizontal: 14, paddingVertical: 12, backgroundColor: region === r.value ? "#F4F9EF" : "transparent" }}>
                <AppText style={{ color: colors.text, fontWeight: region === r.value ? "800" : "400" }}>{r.label}</AppText>
              </Pressable>
            ))}
          </View>

          {region ? (
            <>
              <AppText style={labelStyle}>Comuna</AppText>
              <View style={{ borderWidth: 1, borderColor: "#DDE7D7", borderRadius: 14, backgroundColor: "#FAFBF8", marginBottom: 14 }}>
                {cityOptions.map((c) => (
                  <Pressable key={c.value} onPress={() => setCity(c.value)}
                    style={{ paddingHorizontal: 14, paddingVertical: 12, backgroundColor: city === c.value ? "#F4F9EF" : "transparent" }}>
                    <AppText style={{ color: colors.text, fontWeight: city === c.value ? "800" : "400" }}>{c.label}</AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <AppText style={labelStyle}>Dirección</AppText>
          <TextInput value={address} onChangeText={setAddress} placeholder="Ej: Av. Providencia 1234" style={{ ...inputStyle, marginBottom: 14 }} placeholderTextColor="#999" />

          <AppText style={labelStyle}>Depto / Casa (opcional)</AppText>
          <TextInput value={addressLine2} onChangeText={setAddressLine2} placeholder="Opcional" style={{ ...inputStyle, marginBottom: 14 }} placeholderTextColor="#999" />

          <AppText style={labelStyle}>Referencia (opcional)</AppText>
          <TextInput value={reference} onChangeText={setReference} placeholder="Ej: Portón negro" style={inputStyle} placeholderTextColor="#999" />

          <View style={{ marginTop: 14 }}>
            {shippingLoading ? (
              <AppText style={{ color: colors.muted }}>Calculando envío...</AppText>
            ) : shippingQuote ? (
              <View style={{ backgroundColor: "#F4F9EF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#DDE7D7" }}>
                <AppText style={{ fontWeight: "800", color: colors.text }}>{shippingQuote.name}</AppText>
                <AppText style={{ color: colors.primary, fontWeight: "800", marginTop: 4 }}>
                  Envío: {formatPrice(shippingQuote.amount)}
                </AppText>
              </View>
            ) : (
              <AppText style={{ color: colors.muted }}>Ingresa tu dirección para calcular el envío.</AppText>
            )}
          </View>
        </View>

        {/* Cupón */}
        <View style={cardStyle}>
          <AppText style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 }}>Cupón</AppText>
          <TextInput value={couponCode} onChangeText={setCouponCode} placeholder="Código de cupón (opcional)" autoCapitalize="characters" style={inputStyle} placeholderTextColor="#999" />
        </View>

        {/* Total */}
        <View style={{ ...cardStyle, backgroundColor: "#F7FAF4" }}>
          <AppText style={{ color: colors.muted, marginBottom: 6 }}>Subtotal: {formatPrice(subtotal)}</AppText>
          <AppText style={{ color: colors.muted, marginBottom: 6 }}>
            Envío: {shippingQuote ? formatPrice(shippingAmount) : "Por calcular"}
          </AppText>
          <AppText style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            Total: {formatPrice(finalTotal)}
          </AppText>
        </View>

        <AppButton
          title={submitting ? "Procesando..." : "Confirmar y pagar"}
          onPress={handleCheckout}
          disabled={submitting || shippingLoading}
        />
      </ScrollView>
    </ScreenContainer>
  );
}