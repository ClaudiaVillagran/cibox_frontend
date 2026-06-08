import { Platform } from "react-native";
import client from "../api/client";

export const createOrderFromCart = async (payload) => {
  const response = await client.post("/orders/from-cart", payload);
  return response.data;
};

export const createWebpayTransaction = async ({
  orderId,
  platform,
  guestToken,
}) => {
  const response = await client.post("/payments/webpay/create", {
    orderId,
    platform,
    guestToken,
  });

  const payload = response?.data?.data || response?.data || {};

  return {
    orderId: payload.orderId || orderId,
    paymentToken: payload.paymentToken || payload.token || payload.token_ws,
    paymentUrl: payload.paymentUrl || payload.url,
  };
};

export const commitWebpayTransaction = async ({ orderId, token }) => {
  const response = await client.post("/payments/webpay/commit", {
    orderId,
    token,
  });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await client.get("/orders/me");
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await client.get(`/orders/${orderId}`);
  return response.data;
};

// ✅ NUEVO: detalle de invitado
export const getGuestOrderById = async ({ orderId, email }) => {
  const response = await client.get(`/orders/guest/${orderId}`, {
    params: { email },
  });
  return response.data;
};


export const createOrderFromCustomBox = async (payload) => {
  const response = await client.post("/orders/from-custom-box", payload);
  return response.data;
};

export const adminGetOrders = async ({ page = 1, limit = 20, status } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const response = await client.get("/orders/admin", { params });
  return response.data?.data || response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await client.post(`/orders/${orderId}/cancel`);
  return response.data;
};

export const retryOrderPayment = async ({ orderId, platform, guestToken }) => {
  const response = await client.post(`/orders/${orderId}/retry-payment`, {
    platform,
    guestToken,
  });
  const payload = response?.data?.data || response?.data || {};
  return {
    orderId: payload.orderId || orderId,
    paymentToken: payload.paymentToken || payload.token,
    paymentUrl: payload.paymentUrl || payload.url,
  };
};

export const adminUpdateOrderStatus = async (orderId, { status, tracking_number, note }) => {
  const response = await client.patch(`/orders/admin/${orderId}/status`, {
    status,
    tracking_number,
    note,
  });
  return response.data;
};