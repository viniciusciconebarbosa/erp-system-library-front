'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { usuariosApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Shield, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const profileSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional(),
  idade: z.coerce.number().min(10, 'A idade mínima é 10 anos').max(120, 'Idade inválida'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      idade: user?.idade || undefined,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        nome: user.nome,
        email: user.email,
        idade: user.idade,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await usuariosApi.update(user.id, {
        nome: data.nome,
        idade: data.idade,
      });
      
    
      toast({
        title: "Perfil atualizado",
        description: "As alterações foram salvas com sucesso. Faça login novamente para ver as mudanças.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar as informações do seu perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Meu Perfil">
        <div className="flex items-center justify-center h-full">
          <p>Carregando informações do perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meu Perfil">
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <span>Minhas Informações</span>
              </div>
            </CardTitle>
            
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="idade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informações pessoais</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                      <dd className="text-base">{user.nome}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-base">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Idade</dt>
                      <dd className="text-base">{user.idade} anos</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Perfil</dt>
                      <dd className="text-base flex items-center gap-1">
                        {isAdmin ? (
                          <>
                            <Shield className="h-4 w-4 text-primary" />
                            <span>Administrador</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Usuário Comum</span>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}