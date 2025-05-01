import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/lib/auth-context';

// Mock do módulo de API
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn()
  }
}));

// Importa o módulo mockado
import { authApi } from '@/lib/api';

describe('useAuth', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    nome: 'Test User',
    role: 'USER'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para login bem-sucedido
    (authApi.login as jest.Mock).mockResolvedValue({
      token: 'fake-token',
      usuario: mockUser
    });

    // Limpa o localStorage antes de cada teste
    localStorage.clear();
  });

  it('deve iniciar com usuário não autenticado', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
  });

  it('deve autenticar usuário após login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('deve limpar dados do usuário após logout', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Faz login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('fake-token');

    // Faz logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('deve lidar com erro de login', async () => {
    const errorMessage = 'Credenciais inválidas';
    (authApi.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error: any) {
        expect(error.message).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
}); 