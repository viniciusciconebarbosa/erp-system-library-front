'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { livrosApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

interface LivroDetailsProps {
  id: string;
}

export function LivroDetails({ id }: LivroDetailsProps) {
  const [livro, setLivro] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        setLoading(true);
        const data = await livrosApi.getById(id);
        setLivro(data);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar livro",
          description: "Não foi possível carregar os detalhes do livro.",
        });
        router.push('/livros');
      } finally {
        setLoading(false);
      }
    };

    fetchLivro();
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/livros">
            <ChevronLeft className="h-4 w-4" />
            Voltar para lista
          </Link>
        </Button>
        
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-48 w-32" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!livro) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/livros">
            <ChevronLeft className="h-4 w-4" />
            Voltar para lista
          </Link>
        </Button>
        
        {isAdmin && (
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <Link href={`/livros/editar/${id}`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex gap-6">
          <img
            src={livro.capaFoto || 'https://placehold.co/240x360/e5e7eb/a1a1aa?text=Sem+Capa'}
            alt={`Capa do livro ${livro.titulo}`}
            className="h-[360px] w-[240px] rounded-lg object-cover shadow-md"
          />
          
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{livro.titulo}</h1>
            <p className="text-xl text-muted-foreground">{livro.autor}</p>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-semibold">Gênero:</span>
                <span>{livro.genero}</span>
              </div>
              
              <div className="flex gap-2">
                <span className="font-semibold">Classificação Etária:</span>
                <span>{livro.classificacaoEtaria}</span>
              </div>
              
              <div className="flex gap-2">
                <span className="font-semibold">Estado:</span>
                <span>{livro.estadoConservacao}</span>
              </div>
              
              <div className="flex gap-2">
                <span className="font-semibold">Status:</span>
                <span>{livro.disponivelLocacao ? 'Disponível' : 'Indisponível'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Sinopse</h2>
          <p className="text-muted-foreground">{livro.sinopse}</p>
        </div>
      </div>
    </div>
  );
}