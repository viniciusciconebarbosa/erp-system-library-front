import { render, screen } from '@testing-library/react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import * as navigation from 'next/navigation';

// Mock do useAuth
jest.mock('@/lib/auth-context');

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (navigation.useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush
    }));
  });

  it('deve redirecionar para login quando usuário não está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      user: null,
      isAuthenticated: false,
      loading: false
    });
    
    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('deve renderizar children quando usuário está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      user: { id: 1, name: 'Teste' },
      isAuthenticated: true,
      loading: false
    });
    
    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
}); 