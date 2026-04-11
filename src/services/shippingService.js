import client from "../api/client";

export const quoteShipping = async ({ orderId }) => {
  const response = await client.post("/shipping/quote", { orderId });
  return response.data;
};

export const applyShippingToOrder = async ({
  orderId,
  shippingAmount,
  serviceName,
}) => {
  const response = await client.post("/shipping/apply", {
    orderId,
    shippingAmount,
    serviceName,
  });
  return response.data;
};