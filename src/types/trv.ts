export interface TRV {
  id: number;
  trvNo: string;
  userId?: number | null;
  dataHoraRegistro: string;
  aitNo?: string | null;
  codInfracao?: string | null;
  amparoLegal?: string | null;
  veiculoPlaca: string;
  veiculoUf?: string | null;
  veiculoRenavam?: string | null;
  veiculoChassi?: string | null;
  veiculoMarca?: string | null;
  veiculoModelo?: string | null;
  veiculoCor?: string | null;
  veiculoTipo?: string | null;
  veiculoProprietario?: string | null;
  condutorNome?: string | null;
  condutorCpf?: string | null;
  condutorCnh?: string | null;
  localLogradouro?: string | null;
  localBairro?: string | null;
  parqueId?: number | null;
  parqueRetencao?: string | null;
  parqueEndereco?: string | null;
  dataInfracao?: string | null;
  horaInfracao?: string | null;
  remocaoObservacao?: string | null;
  status: 'RETIDO' | 'LIBERADO' | 'LEILAO' | 'TRANSFERIDO';
  agenteNome: string;
  agenteMatricula: string;
  sigAgente?: string | null;
  guinchoEmpresa?: string | null;
  guinchoTelefone?: string | null;
  sigCondutor?: string | null;
  foto1?: string | null;
  foto2?: string | null;
  dataLiberacao?: string | null;
  motivoLiberacao?: string | null;
  responsavelLiberacao?: string | null;
  createdAt: string;
  updatedAt: string;
  events?: TRVEvent[];
}

export interface TRVEvent {
  id: number;
  trvId: number;
  tipoEvento: string;
  descricao: string;
  autorNome: string;
  autorMatricula?: string | null;
  createdAt: string;
}

export interface RetentionYard {
  id: number;
  nome: string;
  endereco: string;
  capacidade: number;
  telefone?: string | null;
  ativo: boolean;
}

export interface InfractionType {
  id: number;
  codigo: string;
  descricao: string;
  amparoLegal: string;
  gravidade: string;
  medidaAdministrativa: string;
}

export interface TowingCompany {
  id: number;
  nome: string;
  telefone?: string | null;
  responsavel?: string | null;
}

export interface ComplexAnalytics {
  summary: {
    totalTrvs: number;
    retidos: number;
    liberados: number;
  };
  topInfracoes: {
    codInfracao: string;
    amparoLegal: string;
    total: number;
  }[];
  yardsDistribution: {
    parqueRetencao: string;
    totalVeiculos: number;
    veiculosRetidos: number;
  }[];
  typesDistribution: {
    tipo: string;
    total: number;
  }[];
  agentsPerformance: {
    agenteNome: string;
    agenteMatricula: string;
    totalAutuacoes: number;
  }[];
  executionTimeMs: string;
  queriedAt: string;
}

export interface ReincidenciaItem {
  placa: string;
  totalRemocoes: number;
  ultimaData: string;
}
