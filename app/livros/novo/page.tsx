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
import { LivroDTO, Genero, ClassificacaoEtaria, EstadoConservacao } from '@/lib/types';

const generos: { value: Genero; label: string }[] = [
  { value: 'FICCAO', label: 'Ficção' },
  { value: 'NAO_FICCAO', label: 'Não Ficção' },
  { value: 'ROMANCE', label: 'Romance' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'INFANTIL', label: 'Infantil' },
];

const classificacoes: { value: ClassificacaoEtaria; label: string }[] = [
  { value: 'LIVRE', label: 'Livre' },
  { value: 'DEZ_ANOS', label: '10 anos' },
  { value: 'DOZE_ANOS', label: '12 anos' },
  { value: 'QUATORZE_ANOS', label: '14 anos' },
  { value: 'DEZESSEIS_ANOS', label: '16 anos' },
  { value: 'DEZOITO_ANOS', label: '18 anos' },
];

const estados: { value: EstadoConservacao; label: string }[] = [
  { value: 'NOVO', label: 'Novo' },
  { value: 'OTIMO', label: 'Ótimo' },
  { value: 'BOM', label: 'Bom' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'RUIM', label: 'Ruim' },
];

const livroSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  autor: z.string().min(1, 'O autor é obrigatório'),
  genero: z.enum(['FICCAO', 'NAO_FICCAO', 'ROMANCE', 'TECNICO', 'INFANTIL']),
  classificacaoEtaria: z.enum(['LIVRE', 'DEZ_ANOS', 'DOZE_ANOS', 'QUATORZE_ANOS', 'DEZESSEIS_ANOS', 'DEZOITO_ANOS']),
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
      
      const livroDTO: LivroDTO = {
        ...data,
      };

      await livrosApi.create(livroDTO, selectedFile || undefined);
      
      toast({
        title: "Livro cadastrado",
        description: "O livro foi cadastrado com sucesso.",
      });
      
      router.push('/livros');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar livro",
        description: error.message || "Ocorreu um erro ao cadastrar o livro.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
  }
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
                      {generos.map((genero) => (
                        <SelectItem key={genero.value} value={genero.value}>
                          {genero.label}
                        </SelectItem>
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
                      {classificacoes.map((classificacao) => (
                        <SelectItem key={classificacao.value} value={classificacao.value}>
                          {classificacao.label}
                        </SelectItem>
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
                      {estados.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
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



