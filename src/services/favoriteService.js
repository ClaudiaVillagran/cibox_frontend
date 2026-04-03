import client from '../api/client';

export const addFavorite = async (productId) => {
  const response = await client.post('/favorites', { productId });
  return response.data;
};

export const removeFavorite = async (productId) => {
  const response = await client.delete(`/favorites/${productId}`);
  return response.data;
};

export const checkFavorite = async (productId) => {
  const response = await client.get(`/favorites/${productId}/check`);
  return response.data;

};

export const getFavorites = async () => {
  const response = await client.get('/favorites');
  return response.data;
};