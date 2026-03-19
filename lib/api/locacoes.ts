import api from './client';

export const locacoesApi = {
  getAll: async () => {
    const response = await api.get('/api/locacoes');
    return response.data;
  },

  getAtivas: async () => {
    const response = await api.get('/api/locacoes/ativas');
    return response.data;
  },

  getQuantidadeAtivas: async () => {
    try {
      const response = await api.get('/api/locacoes/ativas/quantidade');
      return response.data;
    } catch {
      return 0;
    }
  },

  getByUsuarioId: async (usuarioId: string) => {
    const response = await api.get(`/api/locacoes/usuario/${usuarioId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/locacoes/${id}`);
    return response.data;
  },

  create: async (livroId: string, usuarioId: string) => {
    const response = await api.post('/api/locacoes', { livroId, usuarioId });
    return response.data;
  },

  devolver: async (id: string) => {
    const response = await api.put(`/api/locacoes/${id}/devolver`);
    return response.data;
  },

  cancelar: async (id: string) => {
    const response = await api.put(`/api/locacoes/${id}/cancelar`);
    return response.data;
  },
};
