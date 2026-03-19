import type { Genero, ClassificacaoEtaria, EstadoConservacao, StatusLocacao } from './types';

// ===== Labels para exibição em UI =====

export const generoLabels: Record<Genero, string> = {
  FICCAO: 'Ficção',
  NAO_FICCAO: 'Não-Ficção',
  TERROR: 'Terror',
  ROMANCE: 'Romance',
  EDUCACAO: 'Educação',
  TECNICO: 'Técnico',
};

export const classificacaoEtariaLabels: Record<ClassificacaoEtaria, string> = {
  LIVRE: 'Livre',
  DOZE_ANOS: '12 anos',
  QUATORZE_ANOS: '14 anos',
  DEZESSEIS_ANOS: '16 anos',
  DEZOITO_ANOS: '18 anos',
};

export const estadoConservacaoLabels: Record<EstadoConservacao, string> = {
  NOVO: 'Novo',
  OTIMO: 'Ótimo',
  BOM: 'Bom',
  REGULAR: 'Regular',
  RUIM: 'Ruim',
};

export const statusLocacaoLabels: Record<StatusLocacao, string> = {
  ATIVA: 'Ativa',
  FINALIZADA: 'Finalizada',
  ATRASADA: 'Atrasada',
  CANCELADA: 'Cancelada',
};
