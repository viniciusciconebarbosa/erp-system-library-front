// This file is kept as a re-export barrel for backward compatibility.
// The API has been split into individual modules under lib/api/
// New code should import from '@/lib/api' which resolves to lib/api/index.ts

export { authApi } from './api/auth';
export { livrosApi } from './api/livros';
export { locacoesApi } from './api/locacoes';
export { usuariosApi } from './api/usuarios';
export { default } from './api/client';
