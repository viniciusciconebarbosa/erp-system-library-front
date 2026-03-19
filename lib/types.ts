// ===== Enums e Tipos Base =====

export type UserRole = 'ADMIN' | 'COMUM';
export type Genero = 'FICCAO' | 'NAO_FICCAO' | 'TERROR' | 'ROMANCE' | 'EDUCACAO' | 'TECNICO';
export type ClassificacaoEtaria = 'LIVRE' | 'DOZE_ANOS' | 'QUATORZE_ANOS' | 'DEZESSEIS_ANOS' | 'DEZOITO_ANOS';
export type EstadoConservacao = 'NOVO' | 'OTIMO' | 'BOM' | 'REGULAR' | 'RUIM';
export type StatusLocacao = 'ATIVA' | 'FINALIZADA' | 'ATRASADA' | 'CANCELADA';

// ===== Entidades =====

export type User = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  idade: number;
};

export type Book = {
  id: string;
  titulo: string;
  autor: string;
  genero: Genero;
  capaFoto: string;
  disponivelLocacao: boolean;
  classificacaoEtaria: ClassificacaoEtaria;
  estadoConservacao: EstadoConservacao;
  sinopse: string;
};

export type Loan = {
  id: string;
  livro: {
    id: string;
    titulo: string;
    autor: string;
    capaFoto: string;
    disponivelLocacao: boolean;
  };
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  dataLocacao: string;
  dataDevolucao: string | null;
  status: StatusLocacao;
};

// ===== DTOs =====

export interface LivroDTO {
  titulo: string;
  autor: string;
  genero: Genero;
  classificacaoEtaria: ClassificacaoEtaria;
  estadoConservacao: EstadoConservacao;
  sinopse?: string;
  doadorId?: string;
}

export interface UpdateUserDTO {
  nome?: string;
  email?: string;
  idade?: number;
  senha?: string;
}

// ===== Contexto de Autenticação =====

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (userData: { nome: string; email: string; senha: string; idade: number }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// ===== Respostas da API =====

export type PageResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
  };
};

export interface GeneroEstatistica {
  nome: string;
  quantidade: number;
}

// Re-exporta labels para manter compatibilidade com imports existentes
export {
  generoLabels,
  classificacaoEtariaLabels,
  estadoConservacaoLabels,
  statusLocacaoLabels,
} from './constants';