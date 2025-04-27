'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LivroForm } from '@/components/livros/livro-form';
import { useToast } from '@/hooks/use-toast';
import { livrosApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditarLivroPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [livro, setLivro] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        setLoading(true);
        const livroData = await livrosApi.getById(id as string);
        setLivro(livroData);
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

    if (id) {
      fetchLivro();
    }
  }, [id, router, toast]);

  const handleSubmit = async (formData: FormData) => {
    try {
      await livrosApi.update(id as string, formData);
      toast({
        title: "Livro atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      router.push(`/livros/${id}`);
    } catch (error) {
      console.error('Error updating book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar livro",
        description: "Não foi possível atualizar o livro. Verifique os dados e tente novamente.",
      });
      throw error;
    }
  };

  // Redirect non-admin users
  if (!isAdmin) {
    router.push('/livros');
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout title="Editar Livro">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/livros/${id}`}>
              <ChevronLeft className="h-4 w-4" />
              Voltar para detalhes
            </Link>
          </Button>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">Editar Livro</h2>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!livro) {
    return null;
  }

  return (
    <DashboardLayout title="Editar Livro">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/livros/${id}`}>
              <ChevronLeft className="h-4 w-4" />
              Voltar para detalhes
            </Link>
          </Button>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Editar Livro</h2>
          <LivroForm livro={livro} onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  );
}