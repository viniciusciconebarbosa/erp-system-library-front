'use client';

import { Book, generoLabels, classificacaoEtariaLabels, estadoConservacaoLabels } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Eye, Edit, Trash, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LivroCardProps {
  livro: Book;
  onLocacao?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function LivroCard({ livro, onLocacao, onDelete }: LivroCardProps) {
  const { isAdmin } = useAuth();

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={livro.capaFoto || 'https://placehold.co/300x450/e2e8f0/1e293b?text=Sem+Capa'}
          alt={livro.titulo}
          className="h-full w-full object-cover transform !transition-all !duration-700 !ease-out group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex flex-wrap gap-1">
            <Badge variant={livro.disponivelLocacao ? "default" : "destructive"}>
              {livro.disponivelLocacao ? "Disponível" : "Indisponível"}
            </Badge>
            <Badge variant="outline" className="bg-background/80">
              {generoLabels[livro.genero]}
            </Badge>
            <Badge variant="secondary" className="bg-background/80">
              {classificacaoEtariaLabels[livro.classificacaoEtaria]}
            </Badge>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-semibold tracking-tight">{livro.titulo}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{livro.autor}</p>
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">Estado: </span>
          <span className="text-xs font-medium">
            {estadoConservacaoLabels[livro.estadoConservacao]}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 p-4 pt-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/livros/${livro.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isAdmin && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/livros/editar/${livro.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar livro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onDelete && onDelete(livro.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excluir livro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {livro.disponivelLocacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  className="ml-auto"
                  onClick={() => onLocacao && onLocacao(livro.id)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Locar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Realizar locação</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
}