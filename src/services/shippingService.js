import client from "../api/client";

export const previewShipping = async ({ shipping }) => {
  const response = await client.post("/shipping/preview", { shipping });
  return response.data;
};

export const createOrderFromCart = async (payload) => {
  const response = await client.post("/orders/from-cart", payload);
  return response.data;
};

export const quoteShipping = async ({ orderId }) => {
  const response = await client.post("/shipping/quote", { orderId });
  return response.data;
};

export const applyShippingToOrder = async ({
  orderId,
  shippingAmount,
  serviceName,
  serviceCode,
}) => {
  const response = await client.post("/shipping/apply", {
    orderId,
    shippingAmount,
    serviceName,
    serviceCode,
  });

  return response.data;
};