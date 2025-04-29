'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { locacoesApi } from '@/lib/api';
import { Loan, statusLocacaoLabels } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getImageUrl } from '@/lib/utils';
import { 
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function LocacoesPage() {
  const [locacoes, setLocacoes] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogAction, setDialogAction] = useState<{ type: 'devolver' | 'cancelar', id: string } | null>(null);
  
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const fetchLocacoes = async () => {
    try {
      setLoading(true);
      let response;
      
      // Se não for admin, busca apenas as locações do usuário
      if (!isAdmin && user) {
        response = await locacoesApi.getByUsuarioId(user.id);
      } else {
        response = await locacoesApi.getAll();
      }
      
      setLocacoes(Array.isArray(response) ? response : []);
      
      // Log para debug
      console.log('Locações carregadas:', response);
    } catch (error) {
      console.error('Error fetching locacoes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar locações",
        description: "Não foi possível carregar a lista de locações.",
      });
      setLocacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocacoes();
  }, [user, isAdmin]); // Adiciona user e isAdmin como dependências

  const handleDevolver = async () => {
    if (!dialogAction) return;
    
    try {
      const response = await locacoesApi.devolver(dialogAction.id);
      
      // Update the status in the UI using the response from the API
      setLocacoes(locacoes.map(locacao => 
        locacao.id === dialogAction.id ? { ...locacao, status: response.status } : locacao
      ));
      
      toast({
        title: "Devolução registrada",
        description: "O livro foi devolvido com sucesso.",
      });
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar devolução",
        description: "Não foi possível registrar a devolução do livro.",
      });
    } finally {
      setDialogAction(null);
    }
  };

  const handleCancelar = async () => {
    if (!dialogAction) return;
    
    try {
      await locacoesApi.cancelar(dialogAction.id);
      
      // Update the status in the UI
      setLocacoes(locacoes.map(locacao => 
        locacao.id === dialogAction.id ? { ...locacao, status: 'CANCELADA' } : locacao
      ));
      
      toast({
        title: "Locação cancelada",
        description: "A locação foi cancelada com sucesso.",
      });
    } catch (error) {
      console.error('Error canceling loan:', error);
      toast({
        variant: "destructive",
        title: "Erro ao cancelar locação",
        description: "Não foi possível cancelar a locação.",
      });
    } finally {
      setDialogAction(null);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'livro',
      header: 'Livro',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(row.original.livro.capaFoto)}
            alt={row.original.livro.titulo}
            className="h-[60px] w-[40px] object-cover rounded-sm"
          />
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
      cell: ({ row }) => (
        row.original.dataDevolucao ? formatDate(row.original.dataDevolucao) : '-'
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = 
          status === 'ATIVA' ? 'default' : 
          status === 'FINALIZADA' ? 'outline' :
          status === 'ATRASADA' ? 'destructive' :
          'secondary';
        
        return (
          <Badge variant={variant}>
            {statusLocacaoLabels[status]}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const locacao = row.original;
        
        // Only show action buttons for active loans
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
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 gap-1"
              onClick={() => setDialogAction({ type: 'devolver', id: locacao.id })}
            >
              <CheckCircle2 className="h-4 w-4 text-black-500" />
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
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Locações de Livros</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? "Gerencie locações, devoluções e cancelamentos de livros"
                : "Visualize e gerencie suas locações de livros"}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLocacoes}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              style={{ animationPlayState: loading ? 'running' : 'paused' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Atualizar
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-muted rounded-md" />
              ))}
            </div>
          </div>
        ) : locacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Nenhuma locação encontrada</h3>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Não há registros de locações no sistema."
                : "Você ainda não possui nenhuma locação de livro."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <DataTable
              columns={columns}
              data={locacoes}
              className="[&_.custom-cell]:p-0"
            />
          </div>
        )}
      </div>

      {/* Devolução Dialog */}
      <Dialog
        open={dialogAction?.type === 'devolver'}
        onOpenChange={(open) => !open && setDialogAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar devolução</DialogTitle>
            <DialogDescription>
              Você está registrando a devolução deste livro. Confirme para prosseguir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancelar
            </Button>
            <Button onClick={handleDevolver}>
              Confirmar devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancelamento Dialog */}
      <Dialog
        open={dialogAction?.type === 'cancelar'}
        onOpenChange={(open) => !open && setDialogAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelamento</DialogTitle>
            <DialogDescription>
              Você está cancelando esta locação. Confirme para prosseguir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelar}>
              Cancelar locação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

