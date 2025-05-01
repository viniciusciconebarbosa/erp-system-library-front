import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookList } from '../../components/book-list';

// Mock do livrosApi
jest.mock('@/lib/api', () => ({
  livrosApi: {
    getAll: jest.fn().mockResolvedValue([
      { id: '1', titulo: 'Clean Code', autor: 'Robert C. Martin', disponivelLocacao: true },
      { id: '2', titulo: 'Domain-Driven Design', autor: 'Eric Evans', disponivelLocacao: false }
    ])
  }
}));

describe('BookList', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar lista de livros corretamente', async () => {
    render(<BookList />);
    
    // Verifica se os livros são exibidos
    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('Domain-Driven Design')).toBeInTheDocument();
    });
  });

  it('deve mostrar status de disponibilidade dos livros', async () => {
    render(<BookList />);
    
    await waitFor(() => {
      const availableBook = screen.getByText('Clean Code').closest('div');
      const unavailableBook = screen.getByText('Domain-Driven Design').closest('div');
      
      expect(availableBook).toHaveTextContent('Disponível');
      expect(unavailableBook).toHaveTextContent('Indisponível');
    });
  });

  it('deve filtrar livros por busca', async () => {
    render(<BookList />);
    
    // Espera os livros carregarem
    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
    });

    // Digita no campo de busca
    const searchInput = screen.getByPlaceholderText('Buscar livros...');
    await user.type(searchInput, 'Clean');

    // Verifica se apenas o livro correto é mostrado
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.queryByText('Domain-Driven Design')).not.toBeInTheDocument();
  });
}); 