'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { livrosApi } from '@/lib/api';
import {
  LivroDTO,
  generoLabels,
  classificacaoEtariaLabels,
  estadoConservacaoLabels,
} from '@/lib/types';

const livroSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  autor: z.string().min(1, 'O autor é obrigatório'),
  genero: z.enum(['FICCAO', 'NAO_FICCAO', 'TERROR', 'ROMANCE', 'EDUCACAO', 'TECNICO']),
  classificacaoEtaria: z.enum(['LIVRE', 'DOZE_ANOS', 'QUATORZE_ANOS', 'DEZESSEIS_ANOS', 'DEZOITO_ANOS']),
  estadoConservacao: z.enum(['NOVO', 'OTIMO', 'BOM', 'REGULAR', 'RUIM']),
  sinopse: z.string().optional(),
});

type LivroForm = z.infer<typeof livroSchema>;

export default function NovoLivroPage() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LivroForm>({
    resolver: zodResolver(livroSchema),
    defaultValues: {
      titulo: '',
      autor: '',
      sinopse: '',
    },
  });

  const onSubmit = async (data: LivroForm) => {
    try {
      setLoading(true);
      const livroDTO: LivroDTO = { ...data };
      await livrosApi.create(livroDTO, selectedFile || undefined);
      toast({ title: 'Livro cadastrado', description: 'O livro foi cadastrado com sucesso.' });
      router.push('/livros');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar livro',
        description: error.message ?? 'Ocorreu um erro ao cadastrar o livro.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <DashboardLayout title="Novo Livro">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Cadastrar Novo Livro</h2>
          <p className="text-muted-foreground">
            Preencha os dados do livro que será adicionado ao acervo
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do livro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do autor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(generoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classificacaoEtaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificação Etária</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classificação etária" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(classificacaoEtariaLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estadoConservacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Conservação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado de conservação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(estadoConservacaoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sinopse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinopse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a sinopse do livro"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Capa do Livro</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Livro'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
