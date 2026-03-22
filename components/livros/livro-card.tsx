'use client';

import { Book, generoLabels, classificacaoEtariaLabels, estadoConservacaoLabels } from '@/lib/types';
import Image from 'next/image';
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
  onLocacao?: (_livro: Book) => void;
  onDelete?: (_livro: Book) => void;
}

export function LivroCard({ livro, onLocacao, onDelete }: LivroCardProps) {
  const { isAdmin } = useAuth();

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col w-full max-w-[350px] mx-auto">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={livro.capaFoto || 'https://placehold.co/300x450/e2e8f0/1e293b?text=Sem+Capa'}
          alt={livro.titulo}
          fill
          className="object-fill transform !transition-all !duration-700 !ease-out group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10">
          <div className="flex flex-wrap gap-1">
            <Badge variant={livro.disponivelLocacao ? 'default' : 'destructive'}>
              {livro.disponivelLocacao ? 'Disponível' : 'Indisponível'}
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
      <CardContent className="p-4 flex-1">
        <h3 className="line-clamp-2 font-semibold tracking-tight">{livro.titulo}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{livro.autor}</p>
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">Estado: </span>
          <span className="text-xs font-medium">{estadoConservacaoLabels[livro.estadoConservacao]}</span>
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
            <TooltipContent>Ver detalhes</TooltipContent>
          </Tooltip>

          {isAdmin && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/livros/editar/${livro.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar livro</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete?.(livro)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir livro</TooltipContent>
              </Tooltip>
            </>
          )}

          {livro.disponivelLocacao && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onLocacao?.(livro)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Locar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Realizar locação</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}