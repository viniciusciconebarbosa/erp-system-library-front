'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Book, BookFormData, generoLabels, classificacaoEtariaLabels, estadoConservacaoLabels } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const livroSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  autor: z.string().min(3, 'O autor deve ter pelo menos 3 caracteres'),
  genero: z.enum(['FICCAO', 'NAO_FICCAO', 'TERROR', 'ROMANCE', 'EDUCACAO', 'TECNICO']),
  classificacaoEtaria: z.enum(['LIVRE', 'DOZE_ANOS', 'QUATORZE_ANOS', 'DEZESSEIS_ANOS', 'DEZOITO_ANOS']),
  estadoConservacao: z.enum(['OTIMO', 'BOM', 'REGULAR', 'RUIM']),
  sinopse: z.string().min(10, 'A sinopse deve ter pelo menos 10 caracteres'),
  capaFoto: z
    .instanceof(FileList)
    .refine((files) => files.length === 0 || files.length === 1, 'Selecione apenas uma imagem')
    .transform(files => files.length > 0 ? files[0] : undefined)
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'O tamanho máximo do arquivo é 5MB'
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Apenas os formatos JPG, PNG e WebP são suportados'
    )
    .optional(),
});

type LivroFormValues = z.infer<typeof livroSchema>;

interface LivroFormProps {
  livro?: Book;
  onSubmit: (data: FormData) => Promise<void>;
}

export function LivroForm({ livro, onSubmit }: LivroFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(livro?.capaFoto || null);

  const form = useForm<LivroFormValues>({
    resolver: zodResolver(livroSchema),
    defaultValues: {
      titulo: livro?.titulo || '',
      autor: livro?.autor || '',
      genero: livro?.genero || 'FICCAO',
      classificacaoEtaria: livro?.classificacaoEtaria || 'LIVRE',
      estadoConservacao: livro?.estadoConservacao || 'BOM',
      sinopse: livro?.sinopse || '',
      capaFoto: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (values: LivroFormValues) => {
    try {
      setIsSubmitting(true);

      // Create a new FormData object
      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('autor', values.autor);
      formData.append('genero', values.genero);
      formData.append('classificacaoEtaria', values.classificacaoEtaria);
      formData.append('estadoConservacao', values.estadoConservacao);
      formData.append('sinopse', values.sinopse);

      // Add image file if provided
      if (values.capaFoto) {
        formData.append('capaFoto', values.capaFoto);
      }

      await onSubmit(formData);
      
      toast({
        title: `Livro ${livro ? 'atualizado' : 'criado'} com sucesso`,
        description: `O livro "${values.titulo}" foi ${livro ? 'atualizado' : 'cadastrado'} na biblioteca.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar livro",
        description: "Ocorreu um erro ao tentar salvar as informações do livro.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do livro" {...field} disabled={isSubmitting} />
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
                    <Input placeholder="Nome do autor" {...field} disabled={isSubmitting} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(generoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classificacaoEtaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classificação Etária</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(classificacaoEtariaLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(estadoConservacaoLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sinopse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinopse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do livro"
                      className="h-32 resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="capaFoto"
              render={({ field: { ref, value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Capa do Livro</FormLabel>
                  <FormControl>
                    <Card className="overflow-hidden">
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview da capa"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          id="picture"
                          ref={ref}
                          onChange={(e) => {
                            handleImageChange(e);
                            onChange(e.target.files);
                          }}
                          {...fieldProps}
                          disabled={isSubmitting}
                          className="cursor-pointer"
                        />
                        <FormDescription className="mt-2 text-xs">
                          Selecione uma imagem para a capa (JPG, PNG ou WebP, máx. 5MB)
                        </FormDescription>
                      </CardContent>
                    </Card>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {livro ? 'Atualizar Livro' : 'Cadastrar Livro'}
          </Button>
        </div>
      </form>
    </Form>
  );
}