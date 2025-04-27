'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { livrosApi, locacoesApi } from '@/lib/api';
import { Book, generoLabels, classificacaoEtariaLabels, estadoConservacaoLabels } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Edit, 
  Trash, 
  BookOpen,
  Bookmark
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function LivroDetalhesPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const [livro, setLivro] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locacaoDialogOpen, setLocacaoDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    if (!livro) return;
    
    try {
      await livrosApi.delete(livro.id);
      toast({
        title: "Livro excluído",
        description: "O livro foi removido com sucesso.",
      });
      router.push('/livros');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir livro",
        description: "Não foi possível excluir o livro.",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleLocacao = async () => {
    if (!livro || !user) return;
    
    try {
      await locacoesApi.create(livro.id, user.id);
      setLivro({
        ...livro,
        disponivelLocacao: false
      });
      
      toast({
        title: "Locação realizada",
        description: "O livro foi reservado com sucesso.",
      });
    } catch (error) {
      console.error('Error reserving book:', error);
      toast({
        variant: "destructive",
        title: "Erro ao realizar locação",
        description: "Não foi possível realizar a locação do livro.",
      });
    } finally {
      setLocacaoDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Detalhes do Livro">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/livros">
              <ChevronLeft className="h-4 w-4" />
              Voltar para livros
            </Link>
          </Button>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardContent className="p-0">
                <Skeleton className="aspect-[2/3] h-full w-full" />
              </CardContent>
            </Card>
            
            <div className="space-y-6 md:col-span-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-40 w-full" />
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
    <DashboardLayout title="Detalhes do Livro">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/livros">
              <ChevronLeft className="h-4 w-4" />
              Voltar para livros
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden md:col-span-1">
            <div className="aspect-[2/3] w-full">
              <img
                src={livro.capaFoto || 'https://placehold.co/300x450/e2e8f0/1e293b?text=Sem+Capa'}
                alt={livro.titulo}
                className="h-full w-full object-cover"
              />
            </div>
            
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={livro.disponivelLocacao ? "default" : "destructive"}>
                  {livro.disponivelLocacao ? "Disponível" : "Indisponível"}
                </Badge>
                <Badge variant="outline">
                  {generoLabels[livro.genero]}
                </Badge>
                <Badge variant="secondary">
                  {classificacaoEtariaLabels[livro.classificacaoEtaria]}
                </Badge>
              </div>
              
              <div className="mt-4">
                <span className="text-sm font-medium">Estado de conservação:</span>
                <span className="ml-2 text-sm">
                  {estadoConservacaoLabels[livro.estadoConservacao]}
                </span>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between gap-2 p-4 pt-0">
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/livros/editar/${livro.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </>
              )}
              
              {livro.disponivelLocacao && (
                <Button 
                  className={isAdmin ? "mt-2 w-full" : ""}
                  onClick={() => setLocacaoDialogOpen(true)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Locar este livro
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <div className="space-y-6 md:col-span-2">
            <div>
              <h1 className="text-2xl font-bold">{livro.titulo}</h1>
              <p className="text-lg text-muted-foreground">por {livro.autor}</p>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="mb-2 text-xl font-semibold">Sinopse</h2>
              <p className="text-muted-foreground whitespace-pre-line">{livro.sinopse}</p>
            </div>
            
            <Separator />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  <span>Detalhes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Gênero</dt>
                    <dd>{generoLabels[livro.genero]}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Classificação</dt>
                    <dd>{classificacaoEtariaLabels[livro.classificacaoEtaria]}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                    <dd>{estadoConservacaoLabels[livro.estadoConservacao]}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd>{livro.disponivelLocacao ? "Disponível para locação" : "Indisponível"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O livro "{livro.titulo}" será removido permanentemente do sistema.
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

      {/* Locação Confirmation Dialog */}
      <Dialog open={locacaoDialogOpen} onOpenChange={setLocacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar locação</DialogTitle>
            <DialogDescription>
              Você está prestes a realizar a locação do livro "{livro.titulo}". Confirme para prosseguir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocacaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLocacao}>
              Confirmar locação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}