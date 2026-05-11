import client from "../api/client";
export const createCustomBox = async (payload = {}) => {
  const response = await client.post("/custom-box", payload);  // ← sin s
  return response.data?.data?.customBox || response.data;
};

export const getCustomBoxById = async (id) => {
  const response = await client.get(`/custom-box/${id}`);  // ← sin s
  return response.data?.data?.customBox || response.data;
};

export const addItemToCustomBox = async ({ boxId, productId, quantity }) => {
  const response = await client.post(`/custom-box/${boxId}/items`, { productId, quantity });
  return response.data?.data?.customBox || response.data;
};

export const updateItemInCustomBox = async ({ boxId, productId, quantity }) => {
  const response = await client.patch(`/custom-box/${boxId}/items/${productId}`, { quantity });
  return response.data?.data?.customBox || response.data;
};

export const removeItemFromCustomBox = async ({ boxId, productId }) => {
  const response = await client.delete(`/custom-box/${boxId}/items/${productId}`);
  return response.data?.data?.customBox || response.data;
};

export const deleteCustomBox = async (id) => {
  const response = await client.delete(`/custom-box/${id}`);
  return response.data;
};