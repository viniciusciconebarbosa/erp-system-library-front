export type User = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'COMUM';
  idade: number;
};

export type Book = {
  id: string;
  titulo: string;
  autor: string;
  genero: 'FICCAO' | 'NAO_FICCAO' | 'TERROR' | 'ROMANCE' | 'EDUCACAO' | 'TECNICO';
  capaFoto: string;
  disponivelLocacao: boolean;
  classificacaoEtaria: 'LIVRE' | 'DOZE_ANOS' | 'QUATORZE_ANOS' | 'DEZESSEIS_ANOS' | 'DEZOITO_ANOS';
  estadoConservacao: 'OTIMO' | 'BOM' | 'REGULAR' | 'RUIM';
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
  status: 'ATIVA' | 'FINALIZADA' | 'ATRASADA' | 'CANCELADA';
};

export type PageResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
  };
};

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (user: { nome: string; email: string; senha: string; idade: number }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface BookFormData {
  titulo: string;
  autor: string;
  genero: Book['genero'];
  capaFoto?: File;
  classificacaoEtaria: Book['classificacaoEtaria'];
  estadoConservacao: Book['estadoConservacao'];
  sinopse: string;
}

export const classificacaoEtariaLabels = {
  LIVRE: 'Livre',
  DOZE_ANOS: '12 anos',
  QUATORZE_ANOS: '14 anos',
  DEZESSEIS_ANOS: '16 anos',
  DEZOITO_ANOS: '18 anos'
};

export const generoLabels = {
  FICCAO: 'Ficção',
  NAO_FICCAO: 'Não-Ficção',
  TERROR: 'Terror',
  ROMANCE: 'Romance',
  EDUCACAO: 'Educação',
  TECNICO: 'Técnico'
};

export const estadoConservacaoLabels = {
  OTIMO: 'Ótimo',
  BOM: 'Bom',
  REGULAR: 'Regular',
  RUIM: 'Ruim'
};

export const statusLocacaoLabels = {
  ATIVA: 'Ativa',
  FINALIZADA: 'Finalizada',
  ATRASADA: 'Atrasada',
  CANCELADA: 'Cancelada'
};

export type Genero = 'FICCAO' | 'NAO_FICCAO' | 'ROMANCE' | 'TECNICO' | 'INFANTIL';
export type ClassificacaoEtaria = 'LIVRE' | 'DEZ_ANOS' | 'DOZE_ANOS' | 'QUATORZE_ANOS' | 'DEZESSEIS_ANOS' | 'DEZOITO_ANOS';
export type EstadoConservacao = 'NOVO' | 'OTIMO' | 'BOM' | 'REGULAR' | 'RUIM';

export interface LivroDTO {
  titulo: string;
  autor: string;
  genero: Genero;
  classificacaoEtaria: ClassificacaoEtaria;
  estadoConservacao: EstadoConservacao;
  sinopse?: string;
  doadorId?: string;
}