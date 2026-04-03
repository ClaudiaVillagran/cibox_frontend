import axios from 'axios';
import useAuthStore from '../store/authStore';


const client = axios.create({
  baseURL: 'http://192.168.1.3:3000/api',
  timeout: 10000,
});


client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default client;