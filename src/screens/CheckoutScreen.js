import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, spacing } from "../constants/theme";
import {
  createOrderFromCart,
  createWebpayTransaction,
} from "../services/orderService";
import {
  previewShipping as previewShippingService,
  applyShippingToOrder as applyShippingToOrderService,
} from "../services/shippingService";
import { getCart } from "../services/cartService";
import useCartStore from "../store/cartStore";
import {
  getCheckoutAddress,
  saveCheckoutAddress,
} from "../utils/checkoutStorage";
import { showAppAlert } from "../utils/appAlerts";
import { CHILE_REGIONS } from "../constants/chileLocations";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));

const normalizePhoneCL = (phone = "") => {
  let value = String(phone).replace(/[^\d+]/g, "");

  if (value.startsWith("56")) value = `+${value}`;
  if (!value.startsWith("+56") && value.length === 9 && value.startsWith("9")) {
    value = `+56${value}`;
  }

  return value;
};

const isValidPhoneCL = (phone = "") =>
  /^\+569\d{8}$/.test(normalizePhoneCL(phone));

const cleanRut = (rut = "") =>
  String(rut).replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();

const formatRut = (rut = "") => {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

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

const isValidRut = (rut = "") => {
  const cleaned = cleanRut(rut);

  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const result = 11 - (sum % 11);
  let expected = "";

  if (result === 11) expected = "0";
  else if (result === 10) expected = "K";
  else expected = String(result);

  return expected === dv;
};

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
  const containerRef = useRef(null);

  const selectedLabel =
    options.find((item) => item.value === value)?.label || "";

  return (
    <View style={{ marginBottom: error ? 6 : 14, zIndex }}>
      <Text
        style={{
          color: colors.text,
          fontWeight: "700",
          marginBottom: 6,
          fontSize: 14,
        }}
      >
        {label}
      </Text>

      <View ref={containerRef} style={{ position: "relative", zIndex }}>
        <Pressable
          onPress={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
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
          <Text
            style={{
              color: selectedLabel ? colors.text : "#999",
              fontSize: 15,
            }}
          >
            {selectedLabel || placeholder}
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              marginLeft: 12,
            }}
          >
            {open ? "▲" : "▼"}
          </Text>
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
                zIndex: zIndex,
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
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          fontWeight: item.value === value ? "700" : "400",
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                    <Text style={{ color: "#6B7280" }}>
                      No hay opciones disponibles
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>

      {!!error && (
        <Text
          style={{
            color: "#b91c1c",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export default function CheckoutScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rut, setRut] = useState("");

  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [reference, setReference] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("webpay");
  const [couponCode, setCouponCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingSavedAddress, setLoadingSavedAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const [errors, setErrors] = useState({});

  const { loadCartSummary } = useCartStore();

  const regionOptions = useMemo(() => {
    if (!Array.isArray(CHILE_REGIONS)) return [];

    return CHILE_REGIONS.map((item) => ({
      label: item.label || item.name || item.value,
      value: item.value || item.label || item.name,
      cities: Array.isArray(item.cities) ? item.cities : [],
    }));
  }, []);

  const cityOptions = useMemo(() => {
    const found = regionOptions.find((item) => item.value === region);

    if (!found?.cities?.length) return [];

    return found.cities.map((cityName) => ({
      label: cityName,
      value: cityName,
    }));
  }, [region, regionOptions]);

  const formatPrice = (value) => {
    const number = Number(value || 0);
    return `$${number.toLocaleString("es-CL")}`;
  };

  const getBoxItems = (item) => {
    if (Array.isArray(item?.box_items) && item.box_items.length > 0) {
      return item.box_items;
    }

    if (
      Array.isArray(item?.product?.box_items) &&
      item.product.box_items.length > 0
    ) {
      return item.product.box_items;
    }

    return [];
  };

  const isBoxProduct = (item) => {
    return (
      item?.product_type === "box" ||
      item?.product?.product_type === "box" ||
      getBoxItems(item).length > 0
    );
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

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.log(
        "GET CHECKOUT CART ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudo cargar el resumen del carrito");
    } finally {
      setLoadingCart(false);
    }
  };

  const loadSavedAddress = async () => {
    try {
      setLoadingSavedAddress(true);

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
        setPaymentMethod(saved.paymentMethod || "webpay");
      }
    } catch (error) {
      console.log("LOAD SAVED ADDRESS ERROR:", error);
    } finally {
      setLoadingSavedAddress(false);
    }
  };

  const normalizeQuoteOptions = (quote) => {
    const rawOptions =
      quote?.services ||
      quote?.rates ||
      quote?.options ||
      quote?.quotes ||
      quote?.data?.services ||
      quote?.data?.rates ||
      quote?.data?.options ||
      [];

    if (!Array.isArray(rawOptions)) return [];

    return rawOptions.map((item, index) => ({
      id:
        item?.id ||
        item?.service_code ||
        item?.serviceCode ||
        item?.code ||
        `${index}`,
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
    }));
  };

  const fetchShippingPreview = async () => {
    const hasAddress = region.trim() && city.trim() && address.trim();
    const hasItems = Array.isArray(cart?.items) && cart.items.length > 0;

    if (!hasAddress || !hasItems) {
      setShippingQuote(null);
      setShippingError("");
      return;
    }

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
      });

      const quote =
        response?.quote || response?.data?.quote || response?.data || response;

      const options = normalizeQuoteOptions(quote);

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
  };

  useEffect(() => {
    fetchCart();
    loadSavedAddress();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShippingPreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [region, city, address, addressLine2, reference, cart]);

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const productsTotal = Number(cart?.total || 0);
  const shippingAmount = Number(shippingQuote?.amount || 0);
  const finalTotal = productsTotal + shippingAmount;

  const validateForm = () => {
    const nextErrors = {};

    if (!fullName.trim()) nextErrors.fullName = "Ingresa tu nombre completo";
    if (!isValidEmail(email)) nextErrors.email = "Ingresa un correo válido";
    if (!isValidPhoneCL(phone)) {
      nextErrors.phone = "Ingresa un teléfono chileno válido";
    }
    if (!isValidRut(rut)) nextErrors.rut = "Ingresa un RUT válido";
    if (!region.trim()) nextErrors.region = "Selecciona una región";
    if (!city.trim()) nextErrors.city = "Selecciona una comuna";
    if (address.trim().length < 5) {
      nextErrors.address = "Ingresa una dirección válida";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      showAppAlert("Revisa tus datos", "Hay campos inválidos en el checkout");
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
          method: paymentMethod,
          platform: Platform.OS === "web" ? "web" : Platform.OS,
        },
        notes: deliveryNotes.trim() || null,
      };

      if (couponCode.trim()) {
        payload.couponCode = couponCode.trim().toUpperCase();
      }

      const orderResponse = await createOrderFromCart(payload);
      const order =
        orderResponse?.order ||
        orderResponse?.data?.order ||
        orderResponse?.data ||
        orderResponse;

      if (!order?._id) {
        throw new Error("No se pudo obtener la orden creada");
      }

      await applyShippingToOrderService({
        orderId: order._id,
        shippingAmount: shippingQuote.amount,
        serviceName: shippingQuote.name,
        serviceCode: shippingQuote.id,
      });

      const payment = await createWebpayTransaction({
        orderId: order._id,
        platform: Platform.OS === "web" ? "web" : Platform.OS,
      });

      await saveCheckoutAddress({
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        phone: normalizePhoneCL(phone),
        rut: formatRut(rut),
        region: region.trim(),
        city: city.trim(),
        address: address.trim(),
        addressLine2: addressLine2.trim(),
        reference: reference.trim(),
        paymentMethod,
      });

      await loadCartSummary();

      if (!payment?.paymentToken || !payment?.paymentUrl) {
        showAppAlert("Error", "No se pudo iniciar el pago con Webpay");
        navigation.replace("OrderDetail", { orderId: order._id });
        return;
      }

      navigation.replace("Webpay", {
        orderId: order._id,
        paymentToken: payment.paymentToken,
        paymentUrl: payment.paymentUrl,
      });
    } catch (error) {
      console.log("CHECKOUT ERROR:", error?.response?.data || error.message);

      const backendErrors = error?.response?.data?.errors || {};
      if (Object.keys(backendErrors).length) {
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }

      showAppAlert(
        "Error",
        error?.response?.data?.message ||
          error.message ||
          "No se pudo iniciar el checkout",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart || loadingSavedAddress) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4E9B27" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Checkout
        </Text>

        <Text
          style={{
            color: colors.muted,
            marginBottom: spacing.md,
            fontSize: 15,
          }}
        >
          Completa tus datos y revisa tu compra antes de confirmar.
        </Text>

        <View style={cardStyle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Contacto
          </Text>

          <Text style={labelStyle}>Nombre completo</Text>
          <TextInput
            value={fullName}
            onChangeText={(value) => {
              setFullName(value);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: "" }));
              }
            }}
            placeholder="Ej: Claudia Pérez"
            style={{ ...inputStyle, marginBottom: errors.fullName ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.fullName && (
            <Text style={errorTextStyle}>{errors.fullName}</Text>
          )}

          <Text style={labelStyle}>RUT</Text>
          <TextInput
            value={rut}
            onChangeText={(value) => {
              setRut(formatRut(value));
              if (errors.rut) setErrors((prev) => ({ ...prev, rut: "" }));
            }}
            placeholder="Ej: 12.345.678-5"
            autoCapitalize="characters"
            style={{ ...inputStyle, marginBottom: errors.rut ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.rut && <Text style={errorTextStyle}>{errors.rut}</Text>}

          <Text style={labelStyle}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="Ej: correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ ...inputStyle, marginBottom: errors.email ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.email && <Text style={errorTextStyle}>{errors.email}</Text>}

          <Text style={labelStyle}>Teléfono</Text>
          <TextInput
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            placeholder="Ej: +56 9 1234 5678"
            keyboardType="phone-pad"
            style={inputStyle}
            placeholderTextColor="#999"
          />
          {!!errors.phone && <Text style={errorTextStyle}>{errors.phone}</Text>}
        </View>

        <View style={cardStyle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Envío
          </Text>

          <Text
            style={{
              color: colors.muted,
              marginBottom: 14,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Usamos tu última dirección guardada si existe. Puedes editarla antes
            de confirmar.
          </Text>

          <SelectField
            label="Región"
            value={region}
            placeholder="Selecciona una región"
            options={regionOptions.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onSelect={(value) => {
              setRegion(value);
              setCity("");
              if (errors.region) {
                setErrors((prev) => ({ ...prev, region: "" }));
              }
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
            onSelect={(value) => {
              setCity(value);
              if (errors.city) {
                setErrors((prev) => ({ ...prev, city: "" }));
              }
            }}
            error={errors.city}
            disabled={!region}
            zIndex={2000}
          />

          <Text style={labelStyle}>Dirección</Text>
          <TextInput
            value={address}
            onChangeText={(value) => {
              setAddress(value);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: "" }));
              }
            }}
            placeholder="Ej: Av. Providencia 1234"
            style={{ ...inputStyle, marginBottom: errors.address ? 0 : 14 }}
            placeholderTextColor="#999"
          />
          {!!errors.address && (
            <Text style={errorTextStyle}>{errors.address}</Text>
          )}

          <Text style={labelStyle}>Depto / Casa / Oficina</Text>
          <TextInput
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Opcional"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Referencia</Text>
          <TextInput
            value={reference}
            onChangeText={setReference}
            placeholder="Ej: Portón negro, al lado de la farmacia"
            style={inputStyle}
            placeholderTextColor="#999"
          />

          <View style={{ marginTop: 16 }}>
            {shippingLoading ? (
              <Text style={{ color: colors.muted }}>Calculando envío...</Text>
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
                <Text style={{ color: colors.text, fontWeight: "800" }}>
                  {shippingQuote.name}
                </Text>
                <Text
                  style={{ color: "#4E9B27", fontWeight: "800", marginTop: 4 }}
                >
                  Envío: {formatPrice(shippingQuote.amount)}
                </Text>
              </View>
            ) : shippingError ? (
              <Text style={{ color: "#b91c1c" }}>{shippingError}</Text>
            ) : (
              <Text style={{ color: colors.muted }}>
                Ingresa tu dirección para calcular el envío.
              </Text>
            )}
          </View>
        </View>

        <View style={cardStyle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Pago
          </Text>

          <Text style={{ color: colors.muted, marginBottom: 12 }}>
            Selecciona cómo quieres pagar tu pedido.
          </Text>

          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => setPaymentMethod("webpay")}
              style={{
                borderWidth: 1.5,
                borderColor: paymentMethod === "webpay" ? "#4E9B27" : "#DDE7D7",
                backgroundColor:
                  paymentMethod === "webpay" ? "#F4F9EF" : "#FFFFFF",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "800",
                  marginBottom: 2,
                }}
              >
                Webpay
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                Pago online con tarjeta.
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={cardStyle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Cupón y notas
          </Text>

          <Text style={labelStyle}>Código de cupón</Text>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Opcional"
            autoCapitalize="characters"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Notas para la entrega</Text>
          <TextInput
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            placeholder="Opcional"
            multiline
            textAlignVertical="top"
            style={{
              ...inputStyle,
              minHeight: 100,
              paddingTop: 14,
            }}
            placeholderTextColor="#999"
          />
        </View>

        <View style={cardStyle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Resumen del pedido
          </Text>

          {!items.length ? (
            <Text style={{ color: colors.muted }}>Tu carrito está vacío.</Text>
          ) : (
            items.map((item, index) => {
              const boxItems = getBoxItems(item);
              const showBoxContents = isBoxProduct(item) && boxItems.length > 0;

              return (
                <View
                  key={item.product_id || item._id || index}
                  style={{
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottomWidth: index === items.length - 1 ? 0 : 1,
                    borderBottomColor: "#EEF3EA",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "800",
                      color: colors.text,
                      marginBottom: 4,
                      fontSize: 15,
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text style={{ color: colors.muted, marginBottom: 4 }}>
                    Cantidad: {item.quantity}
                  </Text>

                  <Text style={{ color: colors.muted, marginBottom: 4 }}>
                    Precio unitario: {formatPrice(item.unit_price)}
                  </Text>

                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "800",
                      marginBottom: showBoxContents ? 10 : 0,
                    }}
                  >
                    Subtotal: {formatPrice(item.subtotal)}
                  </Text>

                  {showBoxContents ? (
                    <View
                      style={{
                        marginTop: 4,
                        backgroundColor: "#F7FAF4",
                        borderWidth: 1,
                        borderColor: "#E3ECD9",
                        borderRadius: 14,
                        padding: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "800",
                          color: colors.text,
                          marginBottom: 8,
                        }}
                      >
                        Contiene esta caja
                      </Text>

                      {boxItems.map((boxItem, boxIndex) => (
                        <Text
                          key={boxItem?.product_id || boxIndex}
                          style={{
                            color: colors.text,
                            fontSize: 12,
                            lineHeight: 18,
                            marginBottom:
                              boxIndex === boxItems.length - 1 ? 0 : 6,
                          }}
                        >
                          {boxItem?.quantity || 1} x{" "}
                          {boxItem?.name || "Producto"}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}

          <View
            style={{
              marginTop: 6,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#EEF3EA",
              gap: 6,
            }}
          >
            <Text style={{ color: colors.muted }}>
              Total productos: {formatPrice(productsTotal)}
            </Text>

            <Text style={{ color: colors.muted }}>
              Envío:{" "}
              {shippingQuote ? formatPrice(shippingAmount) : "Por calcular"}
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
                marginTop: 4,
              }}
            >
              Total final: {formatPrice(finalTotal)}
            </Text>
          </View>
        </View>

        <AppButton
          title={submitting ? "Procesando..." : "Confirmar compra"}
          onPress={handleCheckout}
          disabled={submitting || !items.length || shippingLoading}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
