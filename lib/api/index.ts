// Re-exporta todos os módulos de API para imports simplificados:
// import { livrosApi, locacoesApi } from '@/lib/api'

export { authApi } from './auth';
export { livrosApi } from './livros';
export { locacoesApi } from './locacoes';
export { usuariosApi } from './usuarios';
export { default as api } from './client';
