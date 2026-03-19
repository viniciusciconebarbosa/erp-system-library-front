import { useState, useEffect, useCallback } from 'react';
import { locacoesApi } from '@/lib/api';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

type DialogAction = { type: 'devolver' | 'cancelar'; id: string } | null;

export function useLocacoes() {
  const [locacoes, setLocacoes] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const fetchLocacoes = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (isAdmin) {
        response = await locacoesApi.getAll();
      } else if (user) {
        response = await locacoesApi.getByUsuarioId(user.id);
      }
      setLocacoes(Array.isArray(response) ? response : []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar locações',
        description: 'Não foi possível carregar a lista de locações.',
      });
      setLocacoes([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, toast]);

  useEffect(() => {
    fetchLocacoes();
  }, [fetchLocacoes]);

  const handleDevolver = async () => {
    if (!dialogAction) return;
    try {
      const response = await locacoesApi.devolver(dialogAction.id);
      setLocacoes((prev) =>
        prev.map((l) => (l.id === dialogAction.id ? { ...l, status: response.status } : l))
      );
      toast({ title: 'Devolução registrada', description: 'O livro foi devolvido com sucesso.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar devolução',
        description: 'Não foi possível registrar a devolução do livro.',
      });
    } finally {
      setDialogAction(null);
    }
  };

  const handleCancelar = async () => {
    if (!dialogAction) return;
    try {
      await locacoesApi.cancelar(dialogAction.id);
      setLocacoes((prev) =>
        prev.map((l) => (l.id === dialogAction.id ? { ...l, status: 'CANCELADA' } : l))
      );
      toast({ title: 'Locação cancelada', description: 'A locação foi cancelada com sucesso.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar locação',
        description: 'Não foi possível cancelar a locação.',
      });
    } finally {
      setDialogAction(null);
    }
  };

  const closeDialog = () => setDialogAction(null);

  return {
    locacoes,
    loading,
    dialogAction,
    setDialogAction,
    closeDialog,
    handleDevolver,
    handleCancelar,
    refresh: fetchLocacoes,
  };
}
