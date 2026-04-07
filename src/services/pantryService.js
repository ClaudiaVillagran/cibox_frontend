import client from '../api/client';

export const getPantry = async () => {
  const response = await client.get('/pantry');
  return response.data;
};

export const addItemToPantry = async ({ productId, quantity = 1, frequency = 'monthly' }) => {
  const response = await client.post('/pantry/items', {
    productId,
    quantity,
    frequency,
  });
  return response.data;
};

export const movePantryItemToCart = async (productId) => {
  const response = await client.post(`/pantry/items/${productId}/add-to-box`);
  return response.data;
};