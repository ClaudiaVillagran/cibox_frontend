import client from '../api/client';

export const getProducts = async (params = {}) => {
  const response = await client.get('/products', { params });
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await client.get(`/products/${productId}`);
  return response.data;
};

export const getFeaturedProducts = async (params = {}) => {
  const response = await client.get('/products/featured', { params });
  return response.data;
};

export const getTopRatedProducts = async (params = {}) => {
  const response = await client.get('/products/top-rated', { params });
  return response.data;
};

export const getRecommendedProducts = async (params = {}) => {
  const response = await client.get('/products/recommended/me', { params });
  return response.data;
};

export const getRelatedProducts = async (productId, params = {}) => {
  const response = await client.get(`/products/${productId}/related`, { params });
  return response.data;
};

export const getMyProducts = async () => {
  const response = await client.get("/products/mine/list");
  return response.data;
};

export const deactivateMyProduct = async (productId) => {
  const response = await client.patch(`/products/${productId}/deactivate`);
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await client.post("/products", payload);
  return response.data;
};

export const updateProduct = async (productId, payload) => {
  const response = await client.put(`/products/${productId}`, payload);
  return response.data;
};

export const reactivateMyProduct = async (productId) => {
  const response = await client.patch(`/products/${productId}/reactivate`);
  return response.data;
};
export const updateMyProductStock = async (productId, stock) => {
  const response = await client.patch(`/products/${productId}/stock`, { stock });
  return response.data;
};