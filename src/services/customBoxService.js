import client from "../api/client";

export const createCustomBox = async (payload = {}) => {
  const response = await client.post("/custom-boxes", payload);
  return response.data?.data?.customBox || response.data;
};

export const getCustomBoxById = async (id) => {
  const response = await client.get(`/custom-boxes/${id}`);
  return response.data?.data?.customBox || response.data;
};

export const addItemToCustomBox = async ({ boxId, productId, quantity }) => {
  const response = await client.post(`/custom-boxes/${boxId}/items`, {
    productId,
    quantity,
  });
  return response.data?.data?.customBox || response.data;
};

export const updateItemInCustomBox = async ({ boxId, productId, quantity }) => {
  const response = await client.patch(
    `/custom-boxes/${boxId}/items/${productId}`,
    { quantity }
  );
  return response.data?.data?.customBox || response.data;
};

export const removeItemFromCustomBox = async ({ boxId, productId }) => {
  const response = await client.delete(
    `/custom-boxes/${boxId}/items/${productId}`
  );
  return response.data?.data?.customBox || response.data;
};

export const deleteCustomBox = async (id) => {
  const response = await client.delete(`/custom-boxes/${id}`);
  return response.data;
};