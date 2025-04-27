'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { livrosApi, locacoesApi } from '@/lib/api';
import { Book } from '@/lib/types';
import { LivroCard } from '@/components/livros/livro-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generoLabels } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function LivrosPage() {
  const [livros, setLivros] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [locacaoDialogOpen, setLocacaoDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const pageSize = 8;

  useEffect(() => {
    fetchLivros();
  }, []);

  const fetchLivros = async () => {
    try {
      setLoading(true);
      const response = await livrosApi.getAll();
      setLivros(response);
    } catch (error) {
      console.error('Error fetching livros:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar livros",
        description: "Não foi possível carregar a lista de livros.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = livros.filter((livro) => {
    const matchesSearch = searchTerm
      ? livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesGenre = generoFilter === 'ALL' ? true : livro.genero === generoFilter;
    
    return matchesSearch && matchesGenre;
  });

  const totalElements = filteredBooks.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const paginatedBooks = filteredBooks.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleGeneroChange = (value: string) => {
    setGeneroFilter(value);
    setPage(0);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGeneroFilter('ALL');
    setPage(0);
  };

  const openDeleteDialog = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      await livrosApi.delete(bookToDelete.id);
      setLivros(livros.filter(book => book.id !== bookToDelete.id));
      toast({
        title: "Livro excluído",
        description: "O livro foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir livro",
        description: "Não foi possível excluir o livro.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const openLocacaoDialog = (book: Book) => {
    setBookToDelete(book);
    setLocacaoDialogOpen(true);
  };

  const handleLocacao = async () => {
    if (!bookToDelete) return;
    
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      await locacoesApi.create(bookToDelete.id, user.id);
      setLivros(livros.map(book => 
        book.id === bookToDelete.id ? { ...book, disponivelLocacao: false } : book
      ));
      
      toast({
        title: "Locação realizada",
        description: "O livro foi reservado com sucesso.",
      });
    } catch (error) {
      console.error('Error reserving book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao realizar locação",
        description: "Não foi possível realizar a locação do livro.",
      });
    } finally {
      setLocacaoDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const renderBookGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (paginatedBooks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Nenhum livro encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm || generoFilter !== 'ALL'
              ? "Tente ajustar seus filtros de busca."
              : "Não há livros cadastrados na biblioteca ainda."}
          </p>
          {isAdmin && (
            <Button className="mt-4" asChild>
              <Link href="/livros/novo">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Livro
              </Link>
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedBooks.map((livro) => (
          <LivroCard 
            key={livro.id} 
            livro={livro} 
            onDelete={id => openDeleteDialog(livros.find(b => b.id === id)!)}
            onLocacao={id => openLocacaoDialog(livros.find(b => b.id === id)!)}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="Livros">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título ou autor..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <Select value={generoFilter} onValueChange={handleGeneroChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os gêneros</SelectItem>
                <SelectGroup>
                  {Object.entries(generoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {(searchTerm || generoFilter !== 'ALL') && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar filtros</span>
              </Button>
            )}
          </div>

          {isAdmin && (
            <Button asChild>
              <Link href="/livros/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Livro
              </Link>
            </Button>
          )}
        </div>
        
        {renderBookGrid()}
        
        {paginatedBooks.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{paginatedBooks.length}</span> de{" "}
              <span className="font-medium">{totalElements}</span> livros
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O livro {bookToDelete?.titulo} será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Locação Confirmation Dialog */}
      <Dialog open={locacaoDialogOpen} onOpenChange={setLocacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar locação</DialogTitle>
            <DialogDescription>
              Você está prestes a realizar a locação deste livro. Confirme para prosseguir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocacaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLocacao}>
              Confirmar locação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}



