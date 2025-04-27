'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { usuariosApi } from '@/lib/api';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash, Shield, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    fetchUsuarios();
  }, [page, pageSize, isAdmin, router]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosApi.getAll(page, pageSize);
      setUsuarios(response.content);
      setTotalElements(response.pageable.totalElements);
      setTotalPages(Math.ceil(response.pageable.totalElements / pageSize));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await usuariosApi.delete(userToDelete);
      setUsuarios(usuarios.filter(user => user.id !== userToDelete));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'idade',
      header: 'Idade',
    },
    {
      accessorKey: 'role',
      header: 'Perfil',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
            {role === 'ADMIN' ? (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                <span>Comum</span>
              </div>
            )}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const usuario = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/usuarios/${usuario.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver detalhes</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setUserToDelete(usuario.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Gerenciamento de Usuários</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todos os usuários da plataforma
            </p>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={usuarios}
          searchColumn="Nome"
          onSearch={handleSearch}
          pagination={{
            pageIndex: page,
            pageSize: pageSize,
            pageCount: totalPages,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}