import { api } from './client';

export async function testApi() {
  const response = await api.get('/parcelles');
  return response.data;
}