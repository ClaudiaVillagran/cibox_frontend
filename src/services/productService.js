import client from '../api/client';

export const getProducts = async () => {
  const response = await client.get('/products');
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await client.get(`/products/${productId}`);
  return response.data;
};