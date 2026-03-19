import api from './client';
import { UpdateUserDTO } from '@/lib/types';

export const usuariosApi = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get('/api/usuarios', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  update: async (id: string, partialUserData: UpdateUserDTO) => {
    const currentUser = await usuariosApi.getById(id);
    const updatedData = {
      nome: partialUserData.nome ?? currentUser.nome,
      email: partialUserData.email ?? currentUser.email,
      idade: partialUserData.idade ?? currentUser.idade,
      ...(partialUserData.senha ? { senha: partialUserData.senha } : {}),
    };
    const response = await api.put(`/api/usuarios/${id}`, updatedData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/usuarios/${id}`);
    return response.data;
  },
};
