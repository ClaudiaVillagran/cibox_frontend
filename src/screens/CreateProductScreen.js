import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import ProductForm from "../components/ProductForm";
import { createProduct } from "../services/productService";

import { showAppAlert } from "../utils/appAlerts";
export default function CreateProductScreen() {
  const navigation = useNavigation();

  const handleCreate = async (payload) => {
    await createProduct(payload);

    showAppAlert("Listo", "Producto creado correctamente");
    navigation.goBack();
  };

  return (
    <ScreenContainer maxWidth={900}>
      <ProductForm
        mode="create"
        onSubmit={handleCreate}
        submitLabel="Crear producto"
      />
    </ScreenContainer>
  );
}
