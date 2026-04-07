import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import { createOrderFromCustomBox } from "../services/orderService";
import { getCustomBox } from "../services/customBoxService";
import useCartStore from "../store/cartStore";
import {
  getCheckoutAddress,
  saveCheckoutAddress,
} from "../utils/checkoutStorage";

export default function CheckoutScreen({ navigation }) {
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("webpay");
  const [couponCode, setCouponCode] = useState("");

  const [box, setBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);
  const [loadingSavedAddress, setLoadingSavedAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { loadCartSummary } = useCartStore();

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
  };

  const fetchBox = async () => {
    try {
      setLoadingBox(true);
      const data = await getCustomBox();
      setBox(data);
    } catch (error) {
      console.log("GET CHECKOUT BOX ERROR:", error?.response?.data || error.message);
      
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
        setRegion(saved.region || "");
        setCity(saved.city || "");
        setAddress(saved.address || "");
        setPaymentMethod(saved.paymentMethod || "webpay");
      }
    } catch (error) {
      console.log("LOAD SAVED ADDRESS ERROR:", error);
    } finally {
      setLoadingSavedAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (!region.trim() || !city.trim() || !address.trim()) {
      showAppAlert("Faltan datos", "Completa región, ciudad y dirección");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        shipping: {
          region: region.trim(),
          city: city.trim(),
          address: address.trim(),
        },
        payment: {
          method: paymentMethod.trim() || "webpay",
        },
      };

      if (couponCode.trim()) {
        payload.couponCode = couponCode.trim();
      }

      const data = await createOrderFromCustomBox(payload);

      const order =
        data?.order ||
        data?.data?.order ||
        data?.data ||
        data;

      await saveCheckoutAddress({
        region: region.trim(),
        city: city.trim(),
        address: address.trim(),
        paymentMethod: paymentMethod.trim() || "webpay",
      });

      await loadCartSummary();

     showAppAlert("Compra creada", "La orden fue creada correctamente");

      if (order?._id) {
        navigation.replace("OrderSuccess", { orderId: order._id });
      } else {
        navigation.replace("MainTabs");
      }
    } catch (error) {
      console.log("CHECKOUT ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "No se pudo crear la orden"
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
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const items = Array.isArray(box?.items) ? box.items : [];
  const total = box?.total || 0;

  return (
    <ScreenContainer maxWidth={720}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
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
            Resumen del pedido
          </Text>

          {!items.length ? (
            <Text style={{ color: colors.muted }}>
              Tu carrito está vacío.
            </Text>
          ) : (
            items.map((item) => (
              <View
                key={item.product_id}
                style={{
                  paddingBottom: 12,
                  marginBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {item.name}
                </Text>

                <Text style={{ color: colors.muted, marginBottom: 4 }}>
                  Cantidad: {item.quantity}
                </Text>

                <Text style={{ color: colors.muted, marginBottom: 4 }}>
                  Precio unitario: ${item.unit_price}
                </Text>

                {item.discount_applied ? (
                  <Text style={{ color: colors.success, marginBottom: 4 }}>
                    Descuento {item.discount_source}: -{item.discount_percent}%
                  </Text>
                ) : null}

                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  Subtotal: ${item.subtotal}
                </Text>
              </View>
            ))
          )}

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: colors.text,
              marginTop: 6,
            }}
          >
            Total: ${total}
          </Text>
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

          <Text style={{ color: colors.muted, marginBottom: 14 }}>
            Usamos tu última dirección guardada si existe. Puedes editarla antes de confirmar.
          </Text>

          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 6 }}>
            Región
          </Text>
          <TextInput
            value={region}
            onChangeText={setRegion}
            placeholder="Ej: RM"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 6 }}>
            Ciudad
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ej: Santiago"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 6 }}>
            Dirección
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Las Condes 123"
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
            Pago y cupón
          </Text>

          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 6 }}>
            Método de pago
          </Text>
          <TextInput
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="webpay"
            style={{ ...inputStyle, marginBottom: 14 }}
            placeholderTextColor="#999"
          />

          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 6 }}>
            Código de cupón
          </Text>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Opcional"
            autoCapitalize="characters"
            style={inputStyle}
            placeholderTextColor="#999"
          />
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