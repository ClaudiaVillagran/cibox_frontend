import { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing } from "../constants/theme";
import AppText from "../components/AppText";

const SUCCESS_URL = "https://jarring-mashing-buckshot.ngrok-free.dev/success";
const FAILED_URL = "https://jarring-mashing-buckshot.ngrok-free.dev /failed";

export default function WebpayScreen({ route, navigation }) {
  const { orderId, paymentToken, paymentUrl, guestEmail } = route.params || {};
  const alreadyHandledRef = useRef(false);

  const html = `
    <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <form id="webpayForm" action="${paymentUrl}" method="POST">
          <input type="hidden" name="token_ws" value="${paymentToken}" />
        </form>
        <script>
          setTimeout(function() {
            document.getElementById("webpayForm").submit();
          }, 300);
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!paymentToken || !paymentUrl) return;

    const formHtml = `
      <html>
        <body>
          <form id="webpayForm" action="${paymentUrl}" method="POST">
            <input type="hidden" name="token_ws" value="${paymentToken}" />
          </form>
          <script>
            document.getElementById("webpayForm").submit();
          </script>
        </body>
      </html>
    `;

    document.open();
    document.write(formHtml);
    document.close();
  }, [paymentToken, paymentUrl]);

  const goToSuccess = (finalOrderId) => {
    if (alreadyHandledRef.current) return;
    alreadyHandledRef.current = true;

    navigation.replace("OrderSuccess", {
      orderId: finalOrderId || orderId,
      guestEmail,
    });
  };

  const goToOrderDetail = (finalOrderId) => {
    if (alreadyHandledRef.current) return;
    alreadyHandledRef.current = true;

    navigation.replace("OrderDetail", {
      orderId: finalOrderId || orderId,
      guestEmail,
    });
  };

  const inspectUrl = (url) => {
    if (!url || alreadyHandledRef.current) return;

    console.log("WEBPAY URL:", url);

    try {
      const parsed = new URL(url);
      const finalOrderId = parsed.searchParams.get("orderId") || orderId;

      if (url.startsWith(SUCCESS_URL)) {
        goToSuccess(finalOrderId);
        return;
      }

      if (url.startsWith(FAILED_URL)) {
        goToOrderDetail(finalOrderId);
      }
    } catch (error) {
      if (url.startsWith(SUCCESS_URL)) {
        goToSuccess(orderId);
        return;
      }

      if (url.startsWith(FAILED_URL)) {
        goToOrderDetail(orderId);
      }
    }
  };
  const handleMessage = (event) => {
    try {
      const raw = event?.nativeEvent?.data;
      console.log("WEBPAY MESSAGE RAW:", raw);

      if (!raw) return;

      const data = JSON.parse(raw);
      console.log("WEBPAY MESSAGE PARSED:", data);

      if (data?.type === "WEBPAY_SUCCESS") {
        goToSuccess(data.orderId);
        return;
      }

      if (data?.type === "WEBPAY_FAILED") {
        goToOrderDetail(data.orderId);
      }
    } catch (error) {
      console.log("WEBPAY MESSAGE ERROR:", error?.message);
    }
  };

  if (Platform.OS === "web") {
    return (
      <ScreenContainer maxWidth={900}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
          <AppText style={{ marginTop: 12, color: colors.muted }}>
            Redirigiendo a Webpay...
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={900}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingVertical: spacing.md }}>
          <AppText
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 6,
            }}
          >
            Pago con Webpay
          </AppText>

          <AppText style={{ color: colors.muted }}>
            Estamos redirigiéndote al pago.
          </AppText>
        </View>

        <View
          style={{
            flex: 1,
            overflow: "hidden",
            borderRadius: 16,
            backgroundColor: "#fff",
          }}
        >
          <WebView
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            onMessage={handleMessage}
            onNavigationStateChange={(navState) => {
              inspectUrl(navState?.url || "");
            }}
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" />
                <AppText style={{ marginTop: 12, color: colors.muted }}>
                  Cargando Webpay...
                </AppText>
              </View>
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
