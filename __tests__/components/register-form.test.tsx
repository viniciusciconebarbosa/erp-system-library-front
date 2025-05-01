import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/register-form';
import { useAuth } from '@/lib/auth-context';

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('RegisterForm', () => {
  const mockRegister = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Crie uma senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
  });

  it('deve mostrar erro para campos obrigatórios vazios', async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /registrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('O nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('deve chamar a função de registro com os dados corretos', async () => {
    render(<RegisterForm />);

    const nomeInput = screen.getByPlaceholderText('Seu nome');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('Crie uma senha');
    const idadeInput = screen.getByPlaceholderText('Sua idade');
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@email.com');
    await user.type(senhaInput, 'senha123');
    await user.type(idadeInput, '25');

    const submitButton = screen.getByRole('button', { name: /registrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
        idade: 25,
      });
    });
  });

  it('deve mostrar estado de loading durante o registro', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<RegisterForm />);

    const nomeInput = screen.getByPlaceholderText('Seu nome');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('Crie uma senha');
    const idadeInput = screen.getByPlaceholderText('Sua idade');
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@email.com');
    await user.type(senhaInput, 'senha123');
    await user.type(idadeInput, '25');

    const submitButton = screen.getByRole('button', { name: /registrar/i });
    await user.click(submitButton);

    // Verifica se o botão está desabilitado durante o loading
    expect(submitButton).toBeDisabled();

    // Espera o registro terminar
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 