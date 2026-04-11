import client from "../api/client";

export const createOrderFromCart = async (payload) => {
  const response = await client.post("/orders/from-cart", payload);
  return response.data;
};

export const createWebpayTransaction = async ({ orderId, platform }) => {
  const response = await client.post("/payments/webpay/create", {
    orderId,
    platform,
  });

  const data = response?.data || {};

  return {
    orderId: data.orderId || orderId,
    paymentToken: data.paymentToken || data.token,
    paymentUrl: data.paymentUrl || data.url,
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
  const response = await client.get("/orders/my-orders");
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