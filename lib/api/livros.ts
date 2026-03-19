import api from './client';
import { LivroDTO } from '@/lib/types';

export const livrosApi = {
  getAll: async () => {
    const response = await api.get('/api/livros');
    return response.data;
  },

  getEstatisticasGeneros: async () => {
    const response = await api.get('/api/livros/estatisticas/generos');
    return response.data;
  },

  getEstatisticasConservacao: async () => {
    const response = await api.get('/api/livros/estatisticas/conservacao');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/livros/${id}`);
    return response.data;
  },

  create: async (livro: LivroDTO, capaFile?: File) => {
    const formData = new FormData();
    formData.append(
      'livro',
      new Blob([JSON.stringify(livro)], { type: 'application/json' })
    );
    if (capaFile) {
      formData.append('capa', capaFile);
    }

    try {
      const response = await api.post('/api/livros', formData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para cadastrar livros');
      } else if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos obrigatórios');
      }
      throw new Error('Erro ao cadastrar livro');
    }
  },

  update: async (id: string, livroData: FormData) => {
    const response = await api.put(`/api/livros/${id}`, livroData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/livros/${id}`);
    return response.data;
  },
};
