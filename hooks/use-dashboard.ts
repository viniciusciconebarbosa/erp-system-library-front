import { useState, useEffect, useCallback } from 'react';
import { livrosApi, locacoesApi, usuariosApi } from '@/lib/api';
import { Book, GeneroEstatistica } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface DashboardStats {
  totalLivros: number;
  livrosDisponiveis: number;
  locacoesAtivas: number;
  totalUsuarios: number;
  generoData: GeneroEstatistica[];
  conservacaoData: Array<{ nome: string; quantidade: number }>;
}

const INITIAL_STATS: DashboardStats = {
  totalLivros: 0,
  livrosDisponiveis: 0,
  locacoesAtivas: 0,
  totalUsuarios: 0,
  generoData: [],
  conservacaoData: [],
};

export function useDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const livrosData: Book[] = await livrosApi.getAll();
      const [generoData, conservacaoData, quantidadeAtivas] = await Promise.all([
        livrosApi.getEstatisticasGeneros(),
        livrosApi.getEstatisticasConservacao(),
        locacoesApi.getQuantidadeAtivas(),
      ]);

      const patch: Partial<DashboardStats> = {
        totalLivros: livrosData.length,
        livrosDisponiveis: livrosData.filter((l) => l.disponivelLocacao).length,
        generoData,
        conservacaoData,
        locacoesAtivas: typeof quantidadeAtivas === 'number' ? quantidadeAtivas : 0,
      };

      if (isAdmin) {
        const usuariosData = await usuariosApi.getAll();
        patch.totalUsuarios = Array.isArray(usuariosData) ? usuariosData.length : usuariosData.content?.length ?? 0;
      }

      setStats((prev) => ({ ...prev, ...patch }));
    } catch {
      // stats remain at previous valid state
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { stats, loading, refresh: fetch };
}
