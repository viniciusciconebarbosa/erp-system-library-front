'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const registerSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  idade: z.coerce.number().min(10, 'A idade mínima é 10 anos').max(120, 'Idade inválida'),
});

type RegisterValues = z.infer<typeof registerSchema>;

const formFields = [
  { name: 'nome', label: 'Nome completo', placeholder: 'Seu nome', type: 'text' },
  { name: 'email', label: 'Email', placeholder: 'seu@email.com', type: 'text' },
  { name: 'senha', label: 'Senha', placeholder: 'Crie uma senha', type: 'password' },
  { name: 'idade', label: 'Idade', placeholder: 'Sua idade', type: 'number' },
] as const;

export function RegisterForm() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      idade: undefined,
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      setIsLoading(true);
      const userData = {
        ...values,
        nome: values.nome.trim(),
        email: values.email.trim().toLowerCase(),
        idade: Number(values.idade)
      };
      await register(userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Ocorreu um erro ao tentar registrar.';
      
      toast.error("Erro ao registrar", {
        description: errorMessage
      });
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <BookOpen size={40} className="text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Registro</CardTitle>
        <CardDescription className="text-center">
          Crie sua conta na biblioteca comunitária
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formFields.map(({ name, label, placeholder, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        type={type}
                        placeholder={placeholder}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

