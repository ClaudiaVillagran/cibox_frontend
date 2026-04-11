import client from "../api/client";

export const getCart = async () => {
  const response = await client.get("/cart");
  return response.data;
};

export const addItemToCart = async ({ productId, quantity }) => {
  const response = await client.post("/cart/items", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async ({ productId, quantity }) => {
  const response = await client.put(`/cart/items/${productId}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (productId) => {
  const response = await client.delete(`/cart/items/${productId}`);
  return response.data;
};

export const clearCartItems = async () => {
  const response = await client.delete("/cart/clear/all");
  return response.data;
};