import axios from 'axios';
import { LivroDTO } from './types';

export const API_URL = 'http://localhost:8080/';

const api = axios.create({
  baseURL: API_URL,
});

const isBrowser = typeof window !== 'undefined';

api.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isBrowser && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, senha: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      console.log('Resposta do login:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no login:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  register: async (userData: { nome: string; email: string; senha: string; idade: number }) => {
    try {
      const response = await api.post('/api/auth/registro', userData);
      return response.data;
    } catch (error: any) {
      console.error('Erro na requisição:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  }
};

export const livrosApi = {
  getAll: async () => {
    const response = await api.get('/api/livros');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/livros/${id}`);
    return response.data;
  },
  create: async (livro: LivroDTO, capaFile?: File) => {
    try {
      const formData = new FormData();
      
      // Adiciona o JSON do livro
      formData.append(
        'livro', 
        new Blob([JSON.stringify(livro)], { type: 'application/json' })
      );
      
      // Adiciona o arquivo da capa se existir
      if (capaFile) {
        formData.append('capa', capaFile);
      }
      
      const response = await api.post('/api/livros', formData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para cadastrar livros');
      } else if (error.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos obrigatórios');
      }
      console.error('Erro ao cadastrar livro:', error);
      throw new Error('Erro ao cadastrar livro');
    }
  },
  update: async (id: string, livroData: FormData) => {
    const response = await api.put(`/api/livros/${id}`, livroData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/livros/${id}`);
    return response.data;
  }
};

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
    } catch (error: any) {
      console.error('Erro ao buscar quantidade de locações ativas:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      // Retorna 0 em caso de erro para não quebrar a interface
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
  }
};

export const usuariosApi = {
  getAll: async (page = 0, size = 10) => {
    try {
      console.log('Fazendo requisição para /api/usuarios com params:', { page, size });
      const response = await api.get('/api/usuarios', {
        params: { page, size }
      });
      console.log('Resposta da API de usuários:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/api/usuarios/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/usuarios/${id}`);
    return response.data;
  }
};

export default api;





