import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.n8nvinicius.dev/';

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return 'https://placehold.co/80x120/e2e8f0/1e293b?text=Sem+Capa';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE}${cleanPath}`;
}
