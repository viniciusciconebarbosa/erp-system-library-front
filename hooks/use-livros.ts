import { useState, useEffect, useCallback } from 'react';
import { livrosApi, locacoesApi } from '@/lib/api';
import { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

const PAGE_SIZE = 8;

export function useLivros() {
  const [livros, setLivros] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locacaoDialogOpen, setLocacaoDialogOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLivros = useCallback(async () => {
    try {
      setLoading(true);
      const response = await livrosApi.getAll();
      setLivros(response);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar livros',
        description: 'Não foi possível carregar a lista de livros.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLivros();
  }, [fetchLivros]);

  // Derived state
  const filteredBooks = livros.filter((livro) => {
    const matchesSearch = searchTerm
      ? livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesGenre = generoFilter === 'ALL' || livro.genero === generoFilter;
    return matchesSearch && matchesGenre;
  });

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Filter actions
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleGeneroChange = (value: string) => {
    setGeneroFilter(value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGeneroFilter('ALL');
    setPage(0);
  };

  // CRUD actions
  const openDeleteDialog = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBook) return;
    try {
      await livrosApi.delete(selectedBook.id);
      setLivros((prev) => prev.filter((b) => b.id !== selectedBook.id));
      toast({ title: 'Livro excluído', description: 'O livro foi removido com sucesso.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir livro',
        description: 'Não foi possível excluir o livro.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBook(null);
    }
  };

  const openLocacaoDialog = (book: Book) => {
    setSelectedBook(book);
    setLocacaoDialogOpen(true);
  };

  const handleLocacao = async () => {
    if (!selectedBook || !user) return;
    try {
      await locacoesApi.create(selectedBook.id, user.id);
      setLivros((prev) =>
        prev.map((b) => (b.id === selectedBook.id ? { ...b, disponivelLocacao: false } : b))
      );
      toast({ title: 'Locação realizada', description: 'O livro foi reservado com sucesso.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao realizar locação',
        description: 'Não foi possível realizar a locação do livro.',
      });
    } finally {
      setLocacaoDialogOpen(false);
      setSelectedBook(null);
    }
  };

  return {
    // State
    livros,
    loading,
    searchTerm,
    generoFilter,
    page,
    selectedBook,
    deleteDialogOpen,
    locacaoDialogOpen,
    // Derived
    filteredBooks,
    paginatedBooks,
    totalPages,
    PAGE_SIZE,
    // Actions
    setPage,
    setDeleteDialogOpen,
    setLocacaoDialogOpen,
    handleSearchChange,
    handleGeneroChange,
    clearFilters,
    openDeleteDialog,
    handleDelete,
    openLocacaoDialog,
    handleLocacao,
  };
}
