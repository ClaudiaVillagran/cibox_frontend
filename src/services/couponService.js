import client from "../api/client";

export const getCheckoutCouponPreview = async ({ subtotal }) => {
  const response = await client.post("/coupons/checkout-preview", {
    subtotal,
  });

  return response.data?.data || response.data;
};