import client from '../api/client';

export const getCustomBox = async () => {
  const response = await client.get('/custom-box');
  return response.data;
};

export const addItemToCustomBox = async ({ productId, quantity }) => {
  const response = await client.post('/custom-box/items', {
    productId,
    quantity,
  });

  return response.data;
};

export const updateCustomBoxItemQuantity = async ({ productId, quantity }) => {
  const response = await client.put(`/custom-box/items/${productId}`, {
    quantity,
  });

  return response.data;
};

export const removeCustomBoxItem = async (productId) => {
  const response = await client.delete(`/custom-box/items/${productId}`);
  return response.data;
};