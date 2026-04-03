import client from '../api/client';

export const createOrderFromCustomBox = async (payload) => {
  const response = await client.post('/orders/from-custom-box', payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await client.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await client.get(`/orders/${orderId}`);
  return response.data;
};