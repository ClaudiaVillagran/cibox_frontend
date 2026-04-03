import client from '../api/client';

export const loginRequest = async ({ email, password }) => {
  const response = await client.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const registerRequest = async (payload) => {
  const response = await client.post('/auth/register', payload);
  return response.data;
};