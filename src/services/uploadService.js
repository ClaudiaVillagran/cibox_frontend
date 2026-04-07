import { Platform } from "react-native";

export const uploadImageAsync = async (asset, index = 0) => {
  const formData = new FormData();

  if (Platform.OS === "web") {
    if (!asset?.file) {
      throw new Error("No se encontró el archivo web de la imagen");
    }

    formData.append("file", asset.file);
  } else {
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || `product_${Date.now()}_${index}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
  }

  formData.append("upload_preset", "cibox_products_unsigned");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dwhycvdsj/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "No se pudo subir la imagen");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};

export const uploadMultipleImagesAsync = async (assets = []) => {
  const uploads = [];

  for (let i = 0; i < assets.length; i += 1) {
    const uploaded = await uploadImageAsync(assets[i], i);
    uploads.push(uploaded);
  }

  return uploads;
};