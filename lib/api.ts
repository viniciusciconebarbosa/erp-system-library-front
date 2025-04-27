import axios from 'axios';

const API_URL = 'https://minha1api.duckdns.org';

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
    const response = await api.post('/api/auth/login', { email, senha });
    return response.data;
  },
  register: async (userData: { nome: string; email: string; senha: string; idade: number }) => {
    try {
      console.log('Enviando requisição para:', `${API_URL}/api/auth/registro`);
      console.log('Dados enviados:', userData);
      
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
  create: async (livroData: FormData) => {
    const response = await api.post('/api/livros', livroData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
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
    const response = await api.get('/api/usuarios', {
      params: { page, size }
    });
    return response.data;
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





