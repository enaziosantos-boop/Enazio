import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Tabela de Usuários vinculada ao Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('agente').notNull(), // 'agente', 'coordenador', 'admin'
  matricula: text('matricula'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Parques de Retenção (Pátios de recolhimento)
export const retentionYards = pgTable('retention_yards', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(), // Ex: 'SEDE SEMUTRAN', 'GARAGEM SEMINFRA'
  endereco: text('endereco').notNull(),
  capacidade: integer('capacidade').default(150).notNull(),
  telefone: text('telefone'),
  ativo: boolean('ativo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tipos de Infração e Amparos Legais do CTB
export const infractionTypes = pgTable('infraction_types', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(), // Ex: '501-00', '659-92', '703-01'
  descricao: text('descricao').notNull(),
  amparoLegal: text('amparo_legal').notNull(), // Ex: 'Art. 162, I do CTB', 'Art. 230, V do CTB'
  gravidade: text('gravidade').default('Gravíssima').notNull(),
  medidaAdministrativa: text('medida_administrativa').default('Remoção do veículo').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Empresas de Guincho Credenciadas
export const towingCompanies = pgTable('towing_companies', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  telefone: text('telefone'),
  responsavel: text('responsavel'),
  ativo: boolean('ativo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Termos de Remoção Veicular (TRV Digital)
export const trvs = pgTable('trvs', {
  id: serial('id').primaryKey(),
  trvNo: text('trv_no').notNull().unique(), // Identificador Único do TRV (Ex: 20260210001)
  userId: integer('user_id').references(() => users.id),
  dataHoraRegistro: timestamp('data_hora_registro').defaultNow().notNull(),

  // Dados da Infração
  aitNo: text('ait_no'), // Número do Auto de Infração
  codInfracao: text('cod_infracao'), // Código da infração
  amparoLegal: text('amparo_legal'), // Amparo Legal do CTB

  // Dados do Veículo
  veiculoPlaca: text('veiculo_placa').notNull(),
  veiculoUf: text('veiculo_uf'),
  veiculoRenavam: text('veiculo_renavam'),
  veiculoChassi: text('veiculo_chassi'),
  veiculoMarca: text('veiculo_marca'),
  veiculoModelo: text('veiculo_modelo'),
  veiculoCor: text('veiculo_cor'),
  veiculoTipo: text('veiculo_tipo'), // Motocicleta, Automóvel, etc.
  veiculoProprietario: text('veiculo_proprietario'),

  // Dados do Condutor
  condutorNome: text('condutor_nome'),
  condutorCpf: text('condutor_cpf'),
  condutorCnh: text('condutor_cnh'),

  // Local da Ocorrência
  localLogradouro: text('local_logradouro'),
  localBairro: text('local_bairro'),

  // Remoção e Pátio
  parqueId: integer('parque_id').references(() => retentionYards.id),
  parqueRetencao: text('parque_retencao'),
  parqueEndereco: text('parque_endereco'),
  dataInfracao: text('data_infracao'), // YYYY-MM-DD
  horaInfracao: text('hora_infracao'), // HH:mm
  remocaoObservacao: text('remocao_observacao'),
  status: text('status').default('RETIDO').notNull(), // 'RETIDO', 'LIBERADO', 'LEILAO', 'TRANSFERIDO'

  // Agente Autuador
  agenteNome: text('agente_nome').notNull(),
  agenteMatricula: text('agente_matricula').notNull(),
  sigAgente: text('sig_agente'), // Base64 da assinatura

  // Guincho
  guinchoEmpresa: text('guincho_empresa'),
  guinchoTelefone: text('guincho_telefone'),
  sigCondutor: text('sig_condutor'), // Base64 da assinatura

  // Anexos Fotográficos
  foto1: text('foto1'),
  foto2: text('foto2'),

  // Liberação do Veículo
  dataLiberacao: timestamp('data_liberacao'),
  motivoLiberacao: text('motivo_liberacao'),
  responsavelLiberacao: text('responsavel_liberacao'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Eventos e Auditoria em Tempo Real do TRV
export const trvEvents = pgTable('trv_events', {
  id: serial('id').primaryKey(),
  trvId: integer('trv_id').references(() => trvs.id, { onDelete: 'cascade' }).notNull(),
  tipoEvento: text('tipo_evento').notNull(), // 'CRIADO', 'ATUALIZADO', 'LIBERADO', 'AUDITORIA_CONSULTA'
  descricao: text('descricao').notNull(),
  autorNome: text('autor_nome').notNull(),
  autorMatricula: text('autor_matricula'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relações do Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  trvs: many(trvs),
}));

export const retentionYardsRelations = relations(retentionYards, ({ many }) => ({
  trvs: many(trvs),
}));

export const trvsRelations = relations(trvs, ({ one, many }) => ({
  user: one(users, {
    fields: [trvs.userId],
    references: [users.id],
  }),
  parque: one(retentionYards, {
    fields: [trvs.parqueId],
    references: [retentionYards.id],
  }),
  events: many(trvEvents),
}));

export const trvEventsRelations = relations(trvEvents, ({ one }) => ({
  trv: one(trvs, {
    fields: [trvEvents.trvId],
    references: [trvs.id],
  }),
}));
