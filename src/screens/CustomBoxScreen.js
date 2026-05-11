import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";
import { getProducts } from "../services/productService";
import {
  createCustomBox,
  addItemToCustomBox,
  updateItemInCustomBox,
  removeItemFromCustomBox,
  deleteCustomBox,
} from "../services/customBoxService";
import { showAppAlert } from "../utils/appAlerts";

export default function CustomBoxScreen({ navigation }) {
  const [box, setBox] = useState(null);
  const [boxLoading, setBoxLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const boxRef = useRef(null);

  const formatPrice = (v) => `$${Number(v || 0).toLocaleString("es-CL")}`;

  const fetchProducts = async ({ nextPage = 1, append = false } = {}) => {
    try {
      append ? setLoadingMore(true) : setProductsLoading(true);
      const response = await getProducts({
        search: debouncedSearch || undefined,
        page: nextPage,
        limit: 12,
        product_type: "simple",
      });
      const items = response?.items || [];
      const pagination = response?.pagination || {};
      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(Number(pagination.page) || nextPage);
      setHasNextPage(!!pagination.has_next);
    } catch (error) {
      console.log("CUSTOM BOX PRODUCTS ERROR:", error?.response?.data || error.message);
    } finally {
      setProductsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchProducts({ nextPage: 1, append: false });
  }, [debouncedSearch]);

  const getOrCreateBox = async () => {
    if (boxRef.current) return boxRef.current;
    try {
      setBoxLoading(true);
      const newBox = await createCustomBox({ name: "Mi caja personalizada" });
      boxRef.current = newBox;
      setBox(newBox);
      return newBox;
    } catch (error) {
      showAppAlert("Error", "No se pudo crear la caja");
      return null;
    } finally {
      setBoxLoading(false);
    }
  };

  const getItemQuantity = (productId) => {
    const current = boxRef.current || box;
    if (!current?.items) return 0;
    const found = current.items.find(
      (it) => String(it.product_id) === String(productId)
    );
    return found?.quantity || 0;
  };

  const handleAdd = async (product) => {
    try {
      setUpdatingId(product._id);
      const currentBox = await getOrCreateBox();
      if (!currentBox) return;

      const currentQty = getItemQuantity(product._id);
      let updatedBox;

      if (currentQty > 0) {
        updatedBox = await updateItemInCustomBox({
          boxId: currentBox._id,
          productId: product._id,
          quantity: currentQty + 1,
        });
      } else {
        updatedBox = await addItemToCustomBox({
          boxId: currentBox._id,
          productId: product._id,
          quantity: 1,
        });
      }

      boxRef.current = updatedBox;
      setBox({ ...updatedBox });
    } catch (error) {
      showAppAlert("Error", error?.response?.data?.message || "No se pudo agregar el producto");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrease = async (product) => {
    const currentBox = boxRef.current || box;
    if (!currentBox) return;

    const currentQty = getItemQuantity(product._id);
    if (currentQty <= 0) return;

    try {
      setUpdatingId(product._id);
      let updatedBox;

      if (currentQty === 1) {
        updatedBox = await removeItemFromCustomBox({
          boxId: currentBox._id,
          productId: product._id,
        });
      } else {
        updatedBox = await updateItemInCustomBox({
          boxId: currentBox._id,
          productId: product._id,
          quantity: currentQty - 1,
        });
      }

      boxRef.current = updatedBox;
      setBox({ ...updatedBox });
    } catch (error) {
      showAppAlert("Error", "No se pudo actualizar el producto");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelBox = async () => {
    const currentBox = boxRef.current || box;
    if (!currentBox) {
      navigation.goBack();
      return;
    }
    try {
      await deleteCustomBox(currentBox._id);
    } catch (e) {
      // ignorar error al eliminar
    }
    boxRef.current = null;
    setBox(null);
    navigation.goBack();
  };

  const handleContinue = () => {
    const currentBox = boxRef.current || box;
    if (!currentBox?.items?.length) {
      showAppAlert("Caja vacía", "Agrega al menos un producto a tu caja");
      return;
    }
    navigation.navigate("CustomBoxCheckout", { box: currentBox });
  };

  const totalItems = (box?.items || []).reduce((acc, it) => acc + it.quantity, 0);
  const totalPrice = box?.total || box?.subtotal || 0;

  const renderProduct = ({ item }) => {
    const qty = getItemQuantity(item._id);
    const isUpdating = String(updatingId) === String(item._id);
    const price = item?.pricing?.tiers?.[0]?.price || 0;

    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: "#DDE7D7",
          borderRadius: 16,
          backgroundColor: "#fff",
          padding: 12,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          opacity: isUpdating ? 0.7 : 1,
        }}
      >
        {item.thumbnail ? (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: "#F7F8F5",
              overflow: "hidden",
              marginRight: 12,
              borderWidth: 1,
              borderColor: "#EEF3EA",
            }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <AppText
            numberOfLines={2}
            style={{ fontWeight: "800", color: colors.text, fontSize: 14, marginBottom: 4 }}
          >
            {item.name}
          </AppText>
          <AppText style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
            {formatPrice(price)}
          </AppText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {qty > 0 ? (
            <>
              <Pressable
                onPress={() => handleDecrease(item)}
                disabled={isUpdating}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: "#E8F1E1",
                  justifyContent: "center", alignItems: "center",
                }}
              >
                <AppText style={{ fontSize: 18, fontWeight: "800", color: "#2E5F16" }}>-</AppText>
              </Pressable>

              <AppText style={{ fontSize: 15, fontWeight: "800", color: colors.text, minWidth: 20, textAlign: "center" }}>
                {qty}
              </AppText>
            </>
          ) : null}

          <Pressable
            onPress={() => handleAdd(item)}
            disabled={isUpdating || boxLoading}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: colors.primary,
              justifyContent: "center", alignItems: "center",
            }}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>+</AppText>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer maxWidth={720}>
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: spacing.md }}>
          <AppText style={{ fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: 4 }}>
            Arma tu caja
          </AppText>
          <AppText style={{ color: colors.muted, fontSize: 14 }}>
            Selecciona los productos que quieres incluir en tu caja personalizada.
          </AppText>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#DDE7D7",
            borderRadius: 999,
            backgroundColor: "#F7F8F5",
            paddingHorizontal: 14,
            height: 46,
            marginBottom: spacing.md,
          }}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, fontSize: 14 }}
          />
        </View>

        {productsLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderProduct}
            onEndReached={() => {
              if (!loadingMore && hasNextPage) {
                fetchProducts({ nextPage: page + 1, append: true });
              }
            }}
            onEndReachedThreshold={0.4}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: spacing.xl }}>
                <AppText style={{ color: colors.muted }}>No encontramos productos.</AppText>
              </View>
            }
          />
        )}

        {/* Footer flotante */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#DDE7D7",
            padding: spacing.md,
            gap: 10,
          }}
        >
          {totalItems > 0 ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <AppText style={{ color: colors.muted, fontSize: 14 }}>
                {totalItems} producto{totalItems !== 1 ? "s" : ""} en tu caja
              </AppText>
              <AppText style={{ fontWeight: "800", color: colors.text, fontSize: 16 }}>
                {formatPrice(totalPrice)}
              </AppText>
            </View>
          ) : null}

          <AppButton
            title="Continuar al checkout"
            onPress={handleContinue}
            disabled={!totalItems}
          />

          <Pressable onPress={handleCancelBox} style={{ alignItems: "center", paddingVertical: 6 }}>
            <AppText style={{ color: colors.muted, fontSize: 14 }}>Cancelar y volver</AppText>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}