'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { usuariosApi } from '@/lib/api';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, User as UserIcon, Shield, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from  '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const userSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  idade: z.coerce.number().min(10, 'A idade mínima é 10 anos').max(120, 'Idade inválida'),
  role: z.enum(['ADMIN', 'COMUM']),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsuarioDetalhesPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      idade: undefined,
      role: 'COMUM',
    },
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const userData = await usuariosApi.getById(id as string);
        setUsuario(userData);
        
        // Set form values
        form.reset({
          nome: userData.nome,
          email: userData.email,
          idade: userData.idade,
          role: userData.role,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuário",
          description: "Não foi possível carregar os detalhes do usuário.",
        });
        router.push('/usuarios');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUsuario();
    }
  }, [id, router, toast, isAdmin, form]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSaving(true);
      await usuariosApi.update(id as string, data);
      
      setUsuario({
        ...usuario,
        ...data,
      } as User);
      
      setIsEditing(false);
      
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar as informações do usuário.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Detalhes do Usuário">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/usuarios">
              <ChevronLeft className="h-4 w-4" />
              Voltar para usuários
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <DashboardLayout title="Detalhes do Usuário">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/usuarios">
              <ChevronLeft className="h-4 w-4" />
              Voltar para usuários
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              <div className="flex items-center gap-2">
                {usuario.role === 'ADMIN' ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <span>{usuario.nome}</span>
              </div>
            </CardTitle>
            
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perfil</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um perfil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                              <SelectItem value="COMUM">Usuário Comum</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            O perfil determina as permissões do usuário no sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
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
                      <dd className="text-base">{usuario.nome}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-base">{usuario.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Idade</dt>
                      <dd className="text-base">{usuario.idade} anos</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Perfil</dt>
                      <dd className="text-base flex items-center gap-1">
                        {usuario.role === 'ADMIN' ? (
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