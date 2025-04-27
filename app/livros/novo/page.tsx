'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LivroForm } from '@/components/livros/livro-form';
import { useToast } from '@/hooks/use-toast';
import { livrosApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoLivroPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin } = useAuth();
  
  const handleSubmit = async (formData: FormData) => {
    try {
      await livrosApi.create(formData);
      toast({
        title: "Livro cadastrado",
        description: "O livro foi adicionado à biblioteca com sucesso.",
      });
      router.push('/livros');
    } catch (error) {
      console.error('Error creating book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar livro",
        description: "Não foi possível cadastrar o livro. Verifique os dados e tente novamente.",
      });
      throw error;
    }
  };

  // Redirect non-admin users
  if (!isAdmin) {
    router.push('/livros');
    return null;
  }

  return (
    <DashboardLayout title="Novo Livro">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/livros">
              <ChevronLeft className="h-4 w-4" />
              Voltar para livros
            </Link>
          </Button>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Cadastrar Novo Livro</h2>
          <LivroForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  );
}