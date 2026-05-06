import client from "../api/client";

const normalizeList = (response) => {
  const body = response.data;

  if (Array.isArray(body?.data)) {
    return {
      items: body.data,
      pagination: body.pagination || {},
    };
  }

  if (Array.isArray(body?.items)) {
    return {
      items: body.items,
      pagination: body.pagination || {},
    };
  }

  if (Array.isArray(body)) {
    return {
      items: body,
      pagination: {},
    };
  }

  return {
    items: [],
    pagination: {},
  };
};

const unwrapOne = (response) => response.data?.data ?? response.data;

export const getProducts = async (params = {}) => {
  const response = await client.get("/products", { params });
  return normalizeList(response);
};

export const getProductById = async (productId) => {
  const response = await client.get(`/products/${productId}`);
  return unwrapOne(response);
};

export const getFeaturedProducts = async (params = {}) => {
  const response = await client.get("/products/featured", {
    params: { limit: 8, ...params },
  });
  return normalizeList(response);
};

export const getTopRatedProducts = async (params = {}) => {
  const response = await client.get("/products", {
    params: { sort: "rating", limit: 8, ...params },
  });
  return normalizeList(response);
};

export const getRecommendedProducts = async (params = {}) => {
  const response = await client.get("/products/recommended", { params });
  return normalizeList(response);
};

export const getRelatedProducts = async (productId, params = {}) => {
  const response = await client.get("/products", {
    params: { limit: 8, ...params },
  });
  return normalizeList(response);
};

export const getMyProducts = async (params = {}) => {
  const response = await client.get("/products/mine", { params });
  return normalizeList(response);
};

export const createProduct = async (payload) => {
  const response = await client.post("/products", payload);
  return unwrapOne(response);
};

export const updateProduct = async (productId, payload) => {
  const response = await client.patch(`/products/${productId}`, payload);
  return unwrapOne(response);
};

export const deactivateMyProduct = async (productId) => {
  const response = await client.patch(`/products/${productId}/toggle-active`);
  return unwrapOne(response);
};

export const reactivateMyProduct = async (productId) => {
  const response = await client.patch(`/products/${productId}/toggle-active`);
  return unwrapOne(response);
};

export const updateMyProductStock = async (productId, stock) => {
  const response = await client.patch(`/products/${productId}`, { stock });
  return unwrapOne(response);
};