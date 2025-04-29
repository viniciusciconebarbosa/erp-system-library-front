import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_URL } from './api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return 'https://placehold.co/80x120/e2e8f0/1e293b?text=Sem+Capa';
  
  // Se a URL já for completa (começa com http ou https), retorna ela mesma
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove a barra inicial se existir para evitar dupla barra
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Concatena a URL base com o caminho da imagem
  return `${API_URL}${cleanPath}`;
}
