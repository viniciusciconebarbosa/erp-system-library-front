import api from './client';

export const authApi = {
  login: async (email: string, senha: string) => {
    const response = await api.post('/api/auth/login', { email, senha });
    return response.data;
  },

  register: async (userData: { nome: string; email: string; senha: string; idade: number }) => {
    const response = await api.post('/api/auth/registro', userData);
    return response.data;
  },
};
