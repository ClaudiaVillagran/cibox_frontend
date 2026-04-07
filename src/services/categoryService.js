import client from '../api/client';

export const getCategories = async () => {
  const response = await client.get('/categories');
  return response.data;
};

