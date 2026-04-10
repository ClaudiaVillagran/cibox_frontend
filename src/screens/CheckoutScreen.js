import { useEffect, useState } from "react";
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
import { colors, radius, spacing } from "../constants/theme";
import {
  createOrderFromCustomBox,
  createWebpayTransaction,
} from "../services/orderService";
import { getCustomBox } from "../services/customBoxService";
import useCartStore from "../store/cartStore";
import {
  getCheckoutAddress,
  saveCheckoutAddress,
} from "../utils/checkoutStorage";
import { showAppAlert } from "../utils/appAlerts";
export default function CheckoutScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [reference, setReference] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("webpay");
  const [couponCode, setCouponCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [box, setBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);
  const [loadingSavedAddress, setLoadingSavedAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { loadCartSummary } = useCartStore();

  const formatPrice = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("es-CL");
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
  };

  const labelStyle = {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
  };

  const fetchBox = async () => {
    try {
      setLoadingBox(true);
      const data = await getCustomBox();
      setBox(data);
    } catch (error) {
      console.log(
        "GET CHECKOUT BOX ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudo cargar el resumen del carrito");
    } finally {
      setLoadingBox(false);
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

  const validateEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const validatePhone = (value) => {
    const cleaned = value.replace(/\s+/g, "");
    return cleaned.length >= 8;
  };

  const handleCheckout = async () => {
    if (!fullName.trim()) {
      showAppAlert("Faltan datos", "Ingresa tu nombre completo");
      return;
    }

    if (!email.trim()) {
      showAppAlert("Faltan datos", "Ingresa tu correo");
      return;
    }

    if (!validateEmail(email.trim())) {
      showAppAlert("Correo inválido", "Ingresa un correo válido");
      return;
    }

    if (!phone.trim()) {
      showAppAlert("Faltan datos", "Ingresa tu teléfono");
      return;
    }

    if (!validatePhone(phone.trim())) {
      showAppAlert("Teléfono inválido", "Ingresa un teléfono válido");
      return;
    }

    if (!region.trim() || !city.trim() || !address.trim()) {
      showAppAlert(
        "Faltan datos",
        "Completa región, ciudad y dirección de envío",
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
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
        },
        notes: deliveryNotes.trim() || null,
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

      if (!order?._id) {
        throw new Error("No se pudo obtener la orden creada");
      }

      const payment = await createWebpayTransaction({
        orderId: order._id,
        platform: Platform.OS,
      });

      await saveCheckoutAddress({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        region: region.trim(),
        city: city.trim(),
        address: address.trim(),
        addressLine2: addressLine2.trim(),
        reference: reference.trim(),
        paymentMethod: "webpay",
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
      showAppAlert(
        "Error",
        error?.response?.data?.message || "No se pudo iniciar el checkout",
      );
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    fetchBox();
    loadSavedAddress();
  }, []);

  if (loadingBox || loadingSavedAddress) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4E9B27" />
        </View>
      </ScreenContainer>
    );
  }

  const items = Array.isArray(box?.items) ? box.items : [];
  const total = box?.total || 0;

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            onChangeText={setFullName}
            placeholder="Ej: Claudia Pérez"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Ej: correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Teléfono</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej: +56 9 1234 5678"
            keyboardType="phone-pad"
            style={inputStyle}
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

          <Text style={labelStyle}>Región</Text>
          <TextInput
            value={region}
            onChangeText={setRegion}
            placeholder="Ej: Región Metropolitana"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Comuna / Ciudad</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ej: Santiago"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Dirección</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Av. Providencia 1234"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

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
            items.map((item, index) => (
              <View
                key={item.product_id || index}
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
                  Precio unitario: ${formatPrice(item.unit_price)}
                </Text>

                {item.discount_applied ? (
                  <Text
                    style={{
                      color: "#4E9B27",
                      marginBottom: 4,
                      fontWeight: "700",
                    }}
                  >
                    Descuento {item.discount_source}: -{item.discount_percent}%
                  </Text>
                ) : null}

                <Text style={{ color: colors.text, fontWeight: "800" }}>
                  Subtotal: ${formatPrice(item.subtotal)}
                </Text>
              </View>
            ))
          )}

          <View
            style={{
              marginTop: 6,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#EEF3EA",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              Total: ${formatPrice(total)}
            </Text>
          </View>
        </View>

        <AppButton
          title={submitting ? "Creando orden..." : "Confirmar compra"}
          onPress={handleCheckout}
          disabled={submitting || !items.length}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
