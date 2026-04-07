import client from "../api/client";

export const getVendorDashboard = async () => {
  const response = await client.get("/vendor/dashboard");
  return response.data;
};

export const getVendorSalesSummary = async (params = {}) => {
  const response = await client.get("/vendor/dashboard/sales-summary", {
    params,
  });
  return response.data;
};