import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/lib/auth-context';

// Mock do useAuth hook
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    // Configuração padrão do mock para cada teste
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<LoginForm />);

    // Verifica se os elementos principais estão presentes
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar erro para email inválido', async () => {
    render(<LoginForm />);

    // Encontra o campo de email e digita um valor inválido
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    await user.type(emailInput, 'emailinvalido');
    
    // Tenta submeter o formulário
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    // Verifica se a mensagem de erro aparece
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('deve chamar a função de login com os dados corretos', async () => {
    render(<LoginForm />);

    // Preenche os campos com dados válidos
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('Sua senha');
    
    await user.type(emailInput, 'teste@email.com');
    await user.type(senhaInput, 'senha123');

    // Submete o formulário
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    // Verifica se a função de login foi chamada com os dados corretos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('teste@email.com', 'senha123');
    });
  });

  it('deve mostrar estado de loading durante o login', async () => {
    // Configura o mock para demorar um pouco
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginForm />);

    // Preenche e submete o formulário
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('Sua senha');
    
    await user.type(emailInput, 'teste@email.com');
    await user.type(senhaInput, 'senha123');

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Clica no botão e verifica se o texto muda para "Entrando..."
    await user.click(submitButton);
    expect(await screen.findByText('Entrando...')).toBeInTheDocument();

    // Espera o login terminar e verifica se o texto volta para "Entrar"
    await waitFor(() => {
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });
  });
}); 