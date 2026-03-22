'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Image from 'next/image';
import { statusLocacaoLabels } from '@/lib/types';
import { Loan } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getImageUrl } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CheckCircle2, Calendar, Clock, RefreshCcw } from 'lucide-react';
import { useLocacoes } from '@/hooks/use-locacoes';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export default function LocacoesPage() {
  const { isAdmin } = useAuth();
  const {
    locacoes, loading, dialogAction,
    setDialogAction, closeDialog, handleDevolver, handleCancelar, refresh,
  } = useLocacoes();

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'livro',
      header: 'Livro',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-[60px] w-[40px] shrink-0">
            <Image 
              src={getImageUrl(row.original.livro.capaFoto)} 
              alt={row.original.livro.titulo}
              fill
              className="object-cover rounded-sm" 
            />
          </div>
          <div>
            <div className="font-medium">{row.original.livro.titulo}</div>
            <div className="text-sm text-muted-foreground">{row.original.livro.autor}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'usuario.nome',
      header: 'Usuário',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.usuario.nome}</span>
          <span className="text-sm text-muted-foreground">{row.original.usuario.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'dataLocacao',
      header: 'Data de Locação',
      cell: ({ row }) => formatDate(row.original.dataLocacao),
    },
    {
      accessorKey: 'dataDevolucao',
      header: 'Data de Devolução',
      cell: ({ row }) => row.original.dataDevolucao ? formatDate(row.original.dataDevolucao) : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'ATIVA' ? 'default' : status === 'FINALIZADA' ? 'outline'
          : status === 'ATRASADA' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{statusLocacaoLabels[status]}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const locacao = row.original;
        if (locacao.status !== 'ATIVA') {
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" disabled>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Status: {statusLocacaoLabels[locacao.status]}</p>
                  <p className="text-xs text-muted-foreground">
                    Esta locação não está mais ativa e não pode ser modificada.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        }
        return (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="h-8 gap-1"
              onClick={() => setDialogAction({ type: 'devolver', id: locacao.id })}>
              <CheckCircle2 className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Devolver</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Locações">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Locações de Livros</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? 'Gerencie locações, devoluções e cancelamentos de livros'
                : 'Visualize e gerencie suas locações de livros'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
             <RefreshCcw 
               size={16} 
               className="animate-spin" 
               style={{ animationPlayState: loading ? 'running' : 'paused' }}
             />
            Atualizar
          </Button>
        </header>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-md" />)}
          </div>
        ) : locacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Nenhuma locação encontrada</h3>
            <p className="text-muted-foreground">
              {isAdmin ? 'Não há registros de locações no sistema.' : 'Você ainda não possui nenhuma locação de livro.'}
            </p>
          </div>
        ) : (
          <section aria-label="Lista de Locações" className="rounded-md border">
            <DataTable columns={columns} data={locacoes} className="[&_.custom-cell]:p-0" />
          </section>
        )}
      </div>

      <Dialog open={dialogAction?.type === 'devolver'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar devolução</DialogTitle>
            <DialogDescription>Você está registrando a devolução deste livro. Confirme para prosseguir.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleDevolver}>Confirmar devolução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogAction?.type === 'cancelar'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelamento</DialogTitle>
            <DialogDescription>Você está cancelando esta locação. Confirme para prosseguir.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancelar}>Cancelar locação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
