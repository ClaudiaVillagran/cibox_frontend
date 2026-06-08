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
import {
  createOrderFromCustomBox,
  createWebpayTransaction,
} from "../services/orderService";
import { previewShippingFromItems as previewShippingService } from "../services/shippingService";
import {
  getCheckoutAddress,
  saveCheckoutAddress,
} from "../utils/checkoutStorage";
import { showAppAlert } from "../utils/appAlerts";
import { CHILE_REGIONS } from "../constants/chileLocations";
import useAuthStore from "../store/authStore";

// ── helpers ──────────────────────────────────────────────────────────────────
const normalizeEmail = (e) => String(e).trim().toLowerCase();
const isValidEmail = (e) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(e));
const normalizePhoneCL = (phone = "") => {
  let v = String(phone).replace(/[^\d+]/g, "");
  if (v.startsWith("56")) v = `+${v}`;
  if (!v.startsWith("+56") && v.length === 9 && v.startsWith("9"))
    v = `+56${v}`;
  return v;
};
const isValidPhoneCL = (p) => /^\+569\d{8}$/.test(normalizePhoneCL(p));
const cleanRut = (r) =>
  String(r).replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
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
    if (count === 3 && i !== 0) {
      out = "." + out;
      count = 0;
    }
  }
  return `${out}-${dv}`;
};
const isValidRut = (r) => {
  const c = cleanRut(r);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  let sum = 0,
    multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - (sum % 11);
  const expected = result === 11 ? "0" : result === 10 ? "K" : String(result);
  return expected === dv;
};

// ── SelectField (mismo que CheckoutScreen) ───────────────────────────────────
function SelectField({
  label,
  value,
  placeholder,
  options = [],
  onSelect,
  error,
  disabled = false,
  zIndex = 1,
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((item) => item.value === value)?.label || "";

  return (
    <View style={{ marginBottom: error ? 6 : 14, zIndex }}>
      <AppText
        style={{
          color: colors.text,
          fontWeight: "700",
          marginBottom: 6,
          fontSize: 14,
        }}
      >
        {label}
      </AppText>

      <View style={{ position: "relative", zIndex }}>
        <Pressable
          onPress={() => {
            if (!disabled) setOpen((p) => !p);
          }}
          style={{
            minHeight: 52,
            borderWidth: 1,
            borderColor: error ? "#b91c1c" : "#DDE7D7",
            borderRadius: 14,
            backgroundColor: disabled ? "#F3F4F6" : "#FAFBF8",
            paddingHorizontal: 14,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <AppText
            style={{
              color: selectedLabel ? colors.text : "#999",
              fontSize: 15,
            }}
          >
            {selectedLabel || placeholder}
          </AppText>
          <AppText style={{ color: "#6B7280", fontSize: 14, marginLeft: 12 }}>
            {open ? "▲" : "▼"}
          </AppText>
        </Pressable>

        {open ? (
          <>
            <Pressable
              onPress={() => setOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 58,
                left: 0,
                right: 0,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#DDE7D7",
                borderRadius: 14,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
                maxHeight: 220,
                overflow: "hidden",
                zIndex: zIndex + 100,
              }}
            >
              <ScrollView nestedScrollEnabled>
                {options.length ? (
                  options.map((item, index) => (
                    <Pressable
                      key={`${item.value}-${index}`}
                      onPress={() => {
                        onSelect(item.value);
                        setOpen(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth: index === options.length - 1 ? 0 : 1,
                        borderBottomColor: "#EEF3EA",
                        backgroundColor:
                          item.value === value ? "#F4F9EF" : "#FFFFFF",
                      }}
                    >
                      <AppText
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          fontWeight: item.value === value ? "700" : "400",
                        }}
                      >
                        {item.label}
                      </AppText>
                    </Pressable>
                  ))
                ) : (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                    <AppText style={{ color: "#6B7280" }}>
                      No hay opciones
                    </AppText>
                  </View>
                )}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>

      {!!error && (
        <AppText style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
          {error}
        </AppText>
      )}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);

  // ── address options ────────────────────────────────────────────────────────
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

  // ── load saved address ─────────────────────────────────────────────────────
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

  // ── shipping preview — solo cuando hay dirección completa ──────────────────
  useEffect(() => {
    if (loadingAddress) return; // esperar que cargue la dirección guardada

    const hasAddress =
      region.trim() && city.trim() && address.trim().length >= 5;

    if (!hasAddress) {
      setShippingQuote(null);
      setShippingError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setShippingLoading(true);
        setShippingError("");

        const response = await previewShippingService({
          shipping: {
            region: region.trim(),
            city: city.trim(),
            address: address.trim(),
            addressLine2: addressLine2.trim(),
            reference: reference.trim(),
          },
          items: (box?.items || []).map((it) => ({
            // ← agregar esto
            product_id: it.product_id,
            quantity: it.quantity,
          })),
        });

        const quote =
          response?.quote ||
          response?.data?.quote ||
          response?.data ||
          response;

        const rawOptions =
          quote?.services ||
          quote?.rates ||
          quote?.options ||
          quote?.quotes ||
          quote?.data?.services ||
          quote?.data?.rates ||
          quote?.data?.options ||
          [];

        const options = (Array.isArray(rawOptions) ? rawOptions : []).map(
          (item, i) => ({
            id: item?.id || item?.service_code || `${i}`,
            name:
              item?.service_name ||
              item?.serviceName ||
              item?.name ||
              item?.label ||
              "Blue Express manual",
            amount:
              Number(
                item?.amount ??
                  item?.price ??
                  item?.total ??
                  item?.value ??
                  item?.rate ??
                  0,
              ) || 0,
          }),
        );

        if (!options.length) {
          setShippingQuote(null);
          setShippingError("No hay tarifas disponibles para esta dirección");
          return;
        }

        setShippingQuote(options[0]);
      } catch (error) {
        console.log(
          "SHIPPING PREVIEW ERROR:",
          error?.response?.data || error.message,
        );
        setShippingQuote(null);
        setShippingError(
          error?.response?.data?.message || "No se pudo calcular el envío",
        );
      } finally {
        setShippingLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [region, city, address, addressLine2, reference, loadingAddress]);

  // ── validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = "Ingresa tu nombre completo";
    if (!isValidEmail(email)) next.email = "Ingresa un correo válido";
    if (!isValidPhoneCL(phone))
      next.phone = "Ingresa un teléfono chileno válido";
    if (!isValidRut(rut)) next.rut = "Ingresa un RUT válido";
    if (!region.trim()) next.region = "Selecciona una región";
    if (!city.trim()) next.city = "Selecciona una comuna";
    if (address.trim().length < 5)
      next.address = "Ingresa una dirección válida";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!validate()) {
      showAppAlert("Revisa tus datos", "Hay campos inválidos en el checkout");
      return;
    }
    if (!termsAccepted) {
      showAppAlert(
        "Términos y condiciones",
        "Debes aceptar los términos y condiciones para continuar.",
      );
      return;
    }
    if (!shippingQuote?.amount) {
      showAppAlert(
        "Envío no disponible",
        "Primero necesitamos calcular el costo de envío",
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        items: (box?.items || []).map((it) => ({
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
      };

      if (couponCode.trim()) {
        payload.couponCode = couponCode.trim().toUpperCase();
      }

      const orderResponse = await createOrderFromCustomBox(payload);
      const order =
        orderResponse?.order ||
        orderResponse?.data?.order ||
        orderResponse?.data ||
        orderResponse;

      if (!order?._id) throw new Error("No se pudo obtener la orden");

      const guestToken =
        orderResponse?.guest_token || orderResponse?.data?.guest_token || null;

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
        region,
        city,
        address: address.trim(),
        addressLine2: addressLine2.trim(),
        reference: reference.trim(),
        paymentMethod: "webpay",
      });

      if (!payment?.paymentToken || !payment?.paymentUrl) {
        showAppAlert("Error", "No se pudo iniciar el pago con Webpay");
        return;
      }

      navigation.replace("Webpay", {
        orderId: order._id,
        paymentToken: payment.paymentToken,
        paymentUrl: payment.paymentUrl,
      });
    } catch (error) {
      console.log(
        "CUSTOM BOX CHECKOUT ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert(
        "Error",
        error?.response?.data?.message ||
          error.message ||
          "No se pudo procesar el pedido",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── styles ─────────────────────────────────────────────────────────────────
  const inputStyle = {
    borderWidth: 1,
    borderColor: "#DDE7D7",
    borderRadius: 14,
    backgroundColor: "#FAFBF8",
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    minHeight: 52,
  };
  const labelStyle = {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
  };
  const errorTextStyle = {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 10,
  };
  const cardStyle = {
    borderWidth: 1,
    borderColor: "#DDE7D7",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (loadingAddress) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <AppText
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Checkout — Caja personalizada
        </AppText>
        <AppText
          style={{
            color: colors.muted,
            marginBottom: spacing.md,
            fontSize: 15,
          }}
        >
          Completa tus datos y revisa tu caja antes de confirmar.
        </AppText>

        {/* Resumen caja */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Tu caja personalizada
          </AppText>
          {(box?.items || []).map((item, index) => (
            <View
              key={String(item.product_id) + index}
              style={{
                paddingBottom: 10,
                marginBottom: 10,
                borderBottomWidth:
                  index === (box?.items?.length ?? 0) - 1 ? 0 : 1,
                borderBottomColor: "#EEF3EA",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <AppText
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {item.quantity}x {item.name}
              </AppText>
              <AppText style={{ color: colors.muted, fontSize: 14 }}>
                {formatPrice(item.subtotal)}
              </AppText>
            </View>
          ))}
          <View
            style={{
              marginTop: 6,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#EEF3EA",
            }}
          >
            <AppText style={{ fontWeight: "800", color: colors.text }}>
              Subtotal: {formatPrice(subtotal)}
            </AppText>
          </View>
        </View>

        {/* Contacto */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Contacto
          </AppText>

          <AppText style={labelStyle}>Nombre completo</AppText>
          <TextInput
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
            }}
            placeholder="Ej: Claudia Pérez"
            style={{ ...inputStyle, marginBottom: errors.fullName ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.fullName && (
            <AppText style={errorTextStyle}>{errors.fullName}</AppText>
          )}

          <AppText style={labelStyle}>RUT</AppText>
          <TextInput
            value={rut}
            onChangeText={(v) => {
              setRut(formatRut(v));
              if (errors.rut) setErrors((p) => ({ ...p, rut: "" }));
            }}
            placeholder="Ej: 12.345.678-5"
            autoCapitalize="characters"
            style={{ ...inputStyle, marginBottom: errors.rut ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.rut && (
            <AppText style={errorTextStyle}>{errors.rut}</AppText>
          )}

          <AppText style={labelStyle}>Correo electrónico</AppText>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="Ej: correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ ...inputStyle, marginBottom: errors.email ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.email && (
            <AppText style={errorTextStyle}>{errors.email}</AppText>
          )}

          <AppText style={labelStyle}>Teléfono</AppText>
          <TextInput
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
            }}
            placeholder="Ej: +56 9 1234 5678"
            keyboardType="phone-pad"
            style={inputStyle}
            placeholderTextColor="#999"
          />
          {!!errors.phone && (
            <AppText style={errorTextStyle}>{errors.phone}</AppText>
          )}
        </View>

        {/* Envío */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Envío
          </AppText>

          <AppText
            style={{
              color: colors.muted,
              marginBottom: 14,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Usamos tu última dirección guardada si existe. Puedes editarla antes
            de confirmar.
          </AppText>

          <SelectField
            label="Región"
            value={region}
            placeholder="Selecciona una región"
            options={regionOptions.map((r) => ({
              label: r.label,
              value: r.value,
            }))}
            onSelect={(v) => {
              setRegion(v);
              setCity("");
              if (errors.region) setErrors((p) => ({ ...p, region: "" }));
            }}
            error={errors.region}
            zIndex={3000}
          />

          <SelectField
            label="Comuna / Ciudad"
            value={city}
            placeholder={
              region ? "Selecciona una comuna" : "Primero elige una región"
            }
            options={cityOptions}
            onSelect={(v) => {
              setCity(v);
              if (errors.city) setErrors((p) => ({ ...p, city: "" }));
            }}
            error={errors.city}
            disabled={!region}
            zIndex={2000}
          />

          <AppText style={labelStyle}>Dirección</AppText>
          <TextInput
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors((p) => ({ ...p, address: "" }));
            }}
            placeholder="Ej: Av. Providencia 1234"
            style={{ ...inputStyle, marginBottom: errors.address ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.address && (
            <AppText style={errorTextStyle}>{errors.address}</AppText>
          )}

          <AppText style={labelStyle}>Depto / Casa / Oficina</AppText>
          <TextInput
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Opcional"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <AppText style={labelStyle}>Referencia</AppText>
          <TextInput
            value={reference}
            onChangeText={setReference}
            placeholder="Ej: Portón negro, al lado de la farmacia"
            style={inputStyle}
            placeholderTextColor="#999"
          />

          <View style={{ marginTop: 16 }}>
            {shippingLoading ? (
              <AppText style={{ color: colors.muted }}>
                Calculando envío...
              </AppText>
            ) : shippingQuote ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#DDE7D7",
                  backgroundColor: "#F4F9EF",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <AppText style={{ color: colors.text, fontWeight: "800" }}>
                  {shippingQuote.name}
                </AppText>
                <AppText
                  style={{ color: "#4E9B27", fontWeight: "800", marginTop: 4 }}
                >
                  Envío: {formatPrice(shippingQuote.amount)}
                </AppText>
              </View>
            ) : shippingError ? (
              <AppText style={{ color: "#b91c1c" }}>{shippingError}</AppText>
            ) : (
              <AppText style={{ color: colors.muted }}>
                Ingresa tu dirección para calcular el envío.
              </AppText>
            )}
          </View>
        </View>

        {/* Pago */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Pago
          </AppText>
          <View
            style={{
              borderWidth: 1.5,
              borderColor: "#4E9B27",
              backgroundColor: "#F4F9EF",
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 14,
            }}
          >
            <AppText
              style={{ color: colors.text, fontWeight: "800", marginBottom: 2 }}
            >
              Webpay
            </AppText>
            <AppText style={{ color: colors.muted, fontSize: 13 }}>
              Pago online con tarjeta.
            </AppText>
          </View>
        </View>

        {/* Cupón */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Cupón y notas
          </AppText>
          <AppText style={labelStyle}>Código de cupón</AppText>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Opcional"
            autoCapitalize="characters"
            style={inputStyle}
            placeholderTextColor="#999"
          />
        </View>

        {/* Resumen total */}
        <View style={cardStyle}>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Resumen del pedido
          </AppText>

          <View
            style={{
              marginTop: 6,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#EEF3EA",
              gap: 6,
            }}
          >
            <AppText style={{ color: colors.muted }}>
              Total productos: {formatPrice(subtotal)}
            </AppText>
            <AppText style={{ color: colors.muted }}>
              Envío:{" "}
              {shippingQuote ? formatPrice(shippingAmount) : "Por calcular"}
            </AppText>
            <AppText
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
                marginTop: 4,
              }}
            >
              Total final: {formatPrice(finalTotal)}
            </AppText>
          </View>
        </View>

        <AppText
          style={{
            color: colors.muted,
            fontSize: 13,
            lineHeight: 18,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          Al confirmar tu compra, te enviaremos un correo con el resumen del
          pedido y te notificaremos por email cuando el estado cambie.
        </AppText>

        {/* ── Checkbox Términos y Condiciones ── */}
        <Pressable
          onPress={() => setTermsAccepted((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 16,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: termsAccepted ? colors.primary : colors.border,
            backgroundColor: termsAccepted ? `${colors.primary}0A` : "#FAFBF8",
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: termsAccepted ? colors.primary : "#C0C0C0",
              backgroundColor: termsAccepted ? colors.primary : "#fff",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {termsAccepted && (
              <AppText style={{ color: "#fff", fontSize: 13, fontWeight: "900", lineHeight: 16 }}>
                ✓
              </AppText>
            )}
          </View>
          <AppText style={{ fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 }}>
            He leído y acepto los{" "}
            <AppText
              style={{ color: colors.primary, fontWeight: "700", textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("Terms")}
            >
              Términos y Condiciones
            </AppText>
            {" "}y la{" "}
            <AppText
              style={{ color: colors.primary, fontWeight: "700", textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("Privacy")}
            >
              Política de Privacidad
            </AppText>
            {" "}de CIBOX.
          </AppText>
        </Pressable>

        <AppButton
          title={submitting ? "Procesando..." : "Confirmar compra"}
          onPress={handleCheckout}
          disabled={submitting || shippingLoading || !termsAccepted}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
