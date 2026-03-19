'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { generoLabels } from '@/lib/types';
import { LivroCard } from '@/components/livros/livro-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLivros } from '@/hooks/use-livros';

export default function LivrosPage() {
  const { isAdmin } = useAuth();
  const {
    loading, searchTerm, generoFilter, page, selectedBook,
    deleteDialogOpen, locacaoDialogOpen, filteredBooks, paginatedBooks, totalPages, PAGE_SIZE,
    setPage, setDeleteDialogOpen, setLocacaoDialogOpen,
    handleSearchChange, handleGeneroChange, clearFilters,
    openDeleteDialog, handleDelete, openLocacaoDialog, handleLocacao,
  } = useLivros();

  const renderBookGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
              ? 'Tente ajustar seus filtros de busca.'
              : 'Não há livros cadastrados na biblioteca ainda.'}
          </p>
          {isAdmin && (
            <Button className="mt-4" asChild>
              <Link href="/livros/novo"><Plus className="mr-2 h-4 w-4" />Adicionar Livro</Link>
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
            onDelete={openDeleteDialog}
            onLocacao={openLocacaoDialog}
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
              <Link href="/livros/novo"><Plus className="mr-2 h-4 w-4" />Novo Livro</Link>
            </Button>
          )}
        </div>

        {renderBookGrid()}

        {paginatedBooks.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{paginatedBooks.length}</span> de{' '}
              <span className="font-medium">{filteredBooks.length}</span> livros
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O livro {selectedBook?.titulo} será removido permanentemente do sistema.
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

      <Dialog open={locacaoDialogOpen} onOpenChange={setLocacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar locação</DialogTitle>
            <DialogDescription>
              Você está prestes a realizar a locação deste livro. Confirme para prosseguir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocacaoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleLocacao}>Confirmar locação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
