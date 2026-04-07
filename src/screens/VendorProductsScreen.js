import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import AppButton from "../components/AppButton";
import { colors, radius, spacing } from "../constants/theme";
import {
  deactivateMyProduct,
  getMyProducts,
  reactivateMyProduct,
  updateMyProductStock,
} from "../services/productService";
import StockEditModal from "../components/StockEditModal";
import { showAppAlert, confirmAppAction } from "../utils/appAlerts";
export default function VendorProductsScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [stockSaving, setStockSaving] = useState(false);

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };
  const filterButtonStyle = (isActive) => ({
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: isActive ? colors.text : colors.border,
    backgroundColor: isActive ? colors.text : colors.surface,
    marginRight: 8,
  });

  const filterTextStyle = (isActive) => ({
    color: isActive ? colors.background : colors.text,
    fontWeight: "700",
  });
  const sortButtonStyle = (isActive) => ({
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: isActive ? colors.text : colors.border,
    backgroundColor: isActive ? colors.text : colors.surface,
    marginRight: 8,
    marginBottom: 8,
  });

  const sortTextStyle = (isActive) => ({
    color: isActive ? colors.background : colors.text,
    fontWeight: "700",
    fontSize: 12,
  });
  const badgeStyle = (backgroundColor) => ({
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor,
    marginRight: 8,
    marginBottom: 8,
  });

  const badgeTextStyle = {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  };

  const loadProducts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getMyProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "GET MY PRODUCTS ERROR:",
        error?.response?.data || error.message,
      );
      showAppAlert("Error", "No se pudieron cargar tus productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts(false);
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(false);
  };

  const handleDeactivate = (productId) => {
    confirmAppAction({
      title: "Desactivar producto",
      message: "¿Seguro que quieres desactivar este producto?",
      confirmText: "Desactivar",
      destructive: true,
      onConfirm: async () => {
        try {
          await deactivateMyProduct(productId);
          showAppAlert("Listo", "Producto desactivado correctamente");
          loadProducts(false);
        } catch (error) {
          console.log(
            "DEACTIVATE PRODUCT ERROR:",
            error?.response?.data || error.message,
          );
          showAppAlert(
            "Error",
            error?.response?.data?.message ||
              "No se pudo desactivar el producto",
          );
        }
      },
    });
  };

  const handleReactivate = (productId) => {
    confirmAppAction({
      title: "Reactivar producto",
      message: "¿Seguro que quieres reactivar este producto?",
      confirmText: "Reactivar",
      onConfirm: async () => {
        try {
          await reactivateMyProduct(productId);
          showAppAlert("Listo", "Producto reactivado correctamente");
          loadProducts(false);
        } catch (error) {
          console.log(
            "REACTIVATE PRODUCT ERROR:",
            error?.response?.data || error.message,
          );
          showAppAlert(
            "Error",
            error?.response?.data?.message ||
              "No se pudo reactivar el producto",
          );
        }
      },
    });
  };
  const handleQuickStockEdit = (item) => {
    setSelectedProductForStock(item);
    setStockModalVisible(true);
  };
  const handleSaveStock = async (newStock) => {
    if (!selectedProductForStock?._id) return;

    try {
      setStockSaving(true);

      await updateMyProductStock(selectedProductForStock._id, newStock);

      showAppAlert("Listo", "Stock actualizado correctamente");

      setStockModalVisible(false);
      setSelectedProductForStock(null);

      loadProducts(false);
    } catch (error) {
      console.log(
        "UPDATE STOCK ERROR:",
        error?.response?.data || error.message,
      );

      showAppAlert(
        "Error",
        error?.response?.data?.message || "No se pudo actualizar el stock",
      );
    } finally {
      setStockSaving(false);
    }
  };

  const handleCloseStockModal = () => {
    if (stockSaving) return;

    setStockModalVisible(false);
    setSelectedProductForStock(null);
  };
  const getBasePrice = (product) => {
    const tiers = product?.pricing?.tiers || [];
    if (!tiers.length) return 0;
    return tiers[0]?.price ?? 0;
  };
  const hasPackPricing = (product) => {
    const tiers = product?.pricing?.tiers || [];
    return tiers.some((tier) => Number(tier.min_qty) > 1);
  };
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item?.name?.toLowerCase().includes(normalizedSearch) ||
      item?.sku?.toLowerCase().includes(normalizedSearch) ||
      item?.brand?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.is_active) ||
      (statusFilter === "inactive" && !item.is_active);

    return matchesSearch && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);

      case "name_asc":
        return (a.name || "").localeCompare(b.name || "");

      case "name_desc":
        return (b.name || "").localeCompare(a.name || "");

      case "stock_asc":
        return (a.stock ?? 0) - (b.stock ?? 0);

      case "stock_desc":
        return (b.stock ?? 0) - (a.stock ?? 0);

      case "newest":
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });
  if (loading) {
    return (
      <ScreenContainer maxWidth={900}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={900}>
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Mis productos
            </Text>

            <Text
              style={{
                color: colors.muted,
                marginBottom: spacing.md,
              }}
            >
              Gestiona los productos de tu tienda.
            </Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre, SKU o marca"
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.text,
                marginBottom: spacing.md,
              }}
            />

            <View style={{ flexDirection: "row", marginBottom: spacing.md }}>
              <TouchableOpacity
                onPress={() => setStatusFilter("all")}
                style={filterButtonStyle(statusFilter === "all")}
              >
                <Text style={filterTextStyle(statusFilter === "all")}>
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatusFilter("active")}
                style={filterButtonStyle(statusFilter === "active")}
              >
                <Text style={filterTextStyle(statusFilter === "active")}>
                  Activos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatusFilter("inactive")}
                style={filterButtonStyle(statusFilter === "inactive")}
              >
                <Text style={filterTextStyle(statusFilter === "inactive")}>
                  Inactivos
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: colors.muted,
                marginBottom: spacing.md,
              }}
            >
              {sortedProducts.length} resultado
              {sortedProducts.length === 1 ? "" : "s"}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontWeight: "800",
                marginBottom: spacing.sm,
              }}
            >
              Ordenar por
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => setSortBy("newest")}
                style={sortButtonStyle(sortBy === "newest")}
              >
                <Text style={sortTextStyle(sortBy === "newest")}>
                  Más nuevos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("oldest")}
                style={sortButtonStyle(sortBy === "oldest")}
              >
                <Text style={sortTextStyle(sortBy === "oldest")}>
                  Más antiguos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("name_asc")}
                style={sortButtonStyle(sortBy === "name_asc")}
              >
                <Text style={sortTextStyle(sortBy === "name_asc")}>
                  Nombre A-Z
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("name_desc")}
                style={sortButtonStyle(sortBy === "name_desc")}
              >
                <Text style={sortTextStyle(sortBy === "name_desc")}>
                  Nombre Z-A
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("stock_asc")}
                style={sortButtonStyle(sortBy === "stock_asc")}
              >
                <Text style={sortTextStyle(sortBy === "stock_asc")}>
                  Stock menor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("stock_desc")}
                style={sortButtonStyle(sortBy === "stock_desc")}
              >
                <Text style={sortTextStyle(sortBy === "stock_desc")}>
                  Stock mayor
                </Text>
              </TouchableOpacity>
            </View>
            <AppButton
              title="Nuevo producto"
              onPress={() => navigation.navigate("CreateProduct")}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={cardStyle}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 6,
              }}
            >
              {products.length
                ? "No hay resultados"
                : "Aún no tienes productos"}
            </Text>

            <Text style={{ color: colors.muted, marginBottom: spacing.md }}>
              {products.length
                ? "Prueba con otra búsqueda o cambia el filtro."
                : "Crea tu primer producto para empezar a vender."}
            </Text>

            {!products.length ? (
              <AppButton
                title="Crear producto"
                onPress={() => navigation.navigate("CreateProduct")}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={cardStyle}>
            {item.thumbnail ? (
              <View
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: radius.md,
                  marginBottom: 12,
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              {item.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {!item.is_active ? (
                <View style={badgeStyle("#d33")}>
                  <Text style={badgeTextStyle}>Inactivo</Text>
                </View>
              ) : null}

              {(item.stock ?? 0) <= 0 ? (
                <View style={badgeStyle("#ff8c00")}>
                  <Text style={badgeTextStyle}>Sin stock</Text>
                </View>
              ) : null}

              {item?.cibox_plus?.enabled ? (
                <View style={badgeStyle("#111")}>
                  <Text style={badgeTextStyle}>CIBOX+</Text>
                </View>
              ) : null}

              {hasPackPricing(item) ? (
                <View style={badgeStyle("#2f8f4e")}>
                  <Text style={badgeTextStyle}>Pack</Text>
                </View>
              ) : null}

            </View>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              Precio base:{" "}
              {getBasePrice(item) ? `$${getBasePrice(item)}` : "No definido"}
            </Text>
            <Text
              style={{
                color: (item.stock ?? 0) > 0 ? colors.muted : "#d33",
                marginBottom: 4,
                fontWeight: (item.stock ?? 0) > 0 ? "400" : "700",
              }}
            >
              Stock: {item.stock ?? 0}
            </Text>
            {item.brand ? (
              <View style={badgeStyle("#6b7280")}>
                <Text style={badgeTextStyle}>{item.brand}</Text>
              </View>
            ) : null}
            {item.sku ? (
              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                SKU: {item.sku}
              </Text>
            ) : null}

            {item.brand ? (
              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Marca: {item.brand}
              </Text>
            ) : null}

            {item.weight?.value ? (
              <Text style={{ color: colors.muted, marginBottom: 4 }}>
                Peso: {item.weight.value} {item.weight.unit}
              </Text>
            ) : null}

            <Text
              style={{
                color: item.is_active ? "#2f8f4e" : "#d33",
                fontWeight: "700",
                marginBottom: 12,
              }}
            >
              {item.is_active ? "Activo" : "Inactivo"}
            </Text>

            <View
              style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditProduct", { productId: item._id })
                }
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingVertical: 12,
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickStockEdit(item)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#c98a00",
                  borderRadius: radius.md,
                  paddingVertical: 12,
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#c98a00", fontWeight: "700" }}>
                  Editar stock
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  item.is_active
                    ? handleDeactivate(item._id)
                    : handleReactivate(item._id)
                }
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: item.is_active ? "#d33" : "#2f8f4e",
                  borderRadius: radius.md,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: item.is_active ? "#d33" : "#2f8f4e",
                    fontWeight: "700",
                  }}
                >
                  {item.is_active ? "Desactivar" : "Reactivar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <StockEditModal
        visible={stockModalVisible}
        product={selectedProductForStock}
        loading={stockSaving}
        onClose={handleCloseStockModal}
        onSave={handleSaveStock}
      />
    </ScreenContainer>
  );
}
