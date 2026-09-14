import axios from 'axios';
import { getToken } from '@/storage/authStorage';

export const api = axios.create({
  //baseURL: 'http://192.168.1.43:3000',
  baseURL: 'http://192.168.0.106:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});