import { db } from './index.ts';
import {
  trvs,
  retentionYards,
  infractionTypes,
  towingCompanies,
  trvEvents,
  users,
} from './schema.ts';
import { eq, desc, sql, and, gte, lte, ilike, or, inArray } from 'drizzle-orm';
import { broadcastEvent } from '../services/realtime.ts';

export interface TrvFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  parque?: string;
  codInfracao?: string;
  veiculoTipo?: string;
  matricula?: string;
  limit?: number;
  offset?: number;
}

// Obter lista filtrada com suporte a queries relacionais complexas
export async function listTrvs(filters: TrvFilters = {}) {
  try {
    const conditions = [];

    if (filters.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(trvs.trvNo, q),
          ilike(trvs.veiculoPlaca, q),
          ilike(trvs.aitNo, q),
          ilike(trvs.agenteNome, q),
          ilike(trvs.agenteMatricula, q),
          ilike(trvs.condutorNome, q),
          ilike(trvs.condutorCpf, q),
          ilike(trvs.veiculoModelo, q),
          ilike(trvs.veiculoChassi, q)
        )
      );
    }

    if (filters.status && filters.status !== 'TODOS') {
      conditions.push(eq(trvs.status, filters.status));
    }

    if (filters.parque) {
      conditions.push(ilike(trvs.parqueRetencao, `%${filters.parque}%`));
    }

    if (filters.codInfracao) {
      conditions.push(ilike(trvs.codInfracao, `%${filters.codInfracao}%`));
    }

    if (filters.veiculoTipo) {
      conditions.push(eq(trvs.veiculoTipo, filters.veiculoTipo));
    }

    if (filters.matricula) {
      conditions.push(eq(trvs.agenteMatricula, filters.matricula));
    }

    if (filters.startDate) {
      conditions.push(gte(trvs.dataInfracao, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(trvs.dataInfracao, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const startTime = performance.now();
    const rows = await db
      .select()
      .from(trvs)
      .where(whereClause)
      .orderBy(desc(trvs.dataHoraRegistro))
      .limit(limit)
      .offset(offset);

    const executionTimeMs = (performance.now() - startTime).toFixed(2);

    return {
      data: rows,
      totalCount: rows.length,
      executionTimeMs,
    };
  } catch (error) {
    console.error('Erro ao listar TRVs:', error);
    throw new Error('Falha ao consultar banco de dados de TRVs.', { cause: error });
  }
}

// Obter um TRV específico por número com seus eventos de auditoria
export async function getTrvByNo(trvNo: string) {
  try {
    const records = await db
      .select()
      .from(trvs)
      .where(eq(trvs.trvNo, trvNo))
      .limit(1);

    if (records.length === 0) return null;

    const trv = records[0];
    const events = await db
      .select()
      .from(trvEvents)
      .where(eq(trvEvents.trvId, trv.id))
      .orderBy(desc(trvEvents.createdAt));

    return {
      ...trv,
      events,
    };
  } catch (error) {
    console.error(`Erro ao buscar TRV ${trvNo}:`, error);
    throw new Error(`Falha ao carregar TRV ${trvNo}.`, { cause: error });
  }
}

// Salvar / Criar novo TRV Digital
export async function createTrv(data: any, actor = { nome: 'Agente em Campo', matricula: 'SEMUTRAN' }) {
  try {
    // Normalizar placa para maiúsculo
    const placa = (data.veiculo_placa || data.veiculoPlaca || '').toUpperCase().trim();
    const trvNo = data.trv_no || data.trvNo;

    // Buscar ID do parque se existir
    let parqueId: number | null = null;
    const parqueNome = data.parque_retencao || data.parqueRetencao;
    if (parqueNome) {
      const pRecord = await db
        .select({ id: retentionYards.id })
        .from(retentionYards)
        .where(eq(retentionYards.nome, parqueNome))
        .limit(1);
      if (pRecord.length > 0) {
        parqueId = pRecord[0].id;
      }
    }

    const newRecord = {
      trvNo,
      aitNo: data.ait_no || data.aitNo || null,
      codInfracao: data.cod_infracao || data.codInfracao || null,
      amparoLegal: data.amparo_legal || data.amparoLegal || null,
      veiculoPlaca: placa,
      veiculoUf: (data.veiculo_uf || data.veiculoUf || 'PA').toUpperCase(),
      veiculoRenavam: data.veiculo_renavam || data.veiculoRenavam || null,
      veiculoChassi: data.veiculo_chassi || data.veiculoChassi || null,
      veiculoMarca: (data.veiculo_marca || data.veiculoMarca || '').toUpperCase(),
      veiculoModelo: (data.veiculo_modelo || data.veiculoModelo || '').toUpperCase(),
      veiculoCor: (data.veiculo_cor || data.veiculoCor || '').toUpperCase(),
      veiculoTipo: (data.veiculo_tipo || data.veiculoTipo || 'AUTOMÓVEL').toUpperCase(),
      veiculoProprietario: (data.veiculo_proprietario || data.veiculoProprietario || '').toUpperCase(),
      condutorNome: (data.condutor_nome || data.condutorNome || '').toUpperCase(),
      condutorCpf: data.condutor_cpf || data.condutorCpf || null,
      condutorCnh: data.condutor_cnh || data.condutorCnh || null,
      localLogradouro: (data.local_logradouro || data.localLogradouro || '').toUpperCase(),
      localBairro: (data.local_bairro || data.localBairro || '').toUpperCase(),
      parqueId,
      parqueRetencao: parqueNome,
      parqueEndereco: data.parque_endereco || data.parqueEndereco || null,
      dataInfracao: data.data_infracao || data.dataInfracao || null,
      horaInfracao: data.hora_infracao || data.horaInfracao || null,
      remocaoObservacao: data.remocao_observacao || data.remocaoObservacao || null,
      status: 'RETIDO',
      agenteNome: (data.agente_nome || data.agenteNome || actor.nome).toUpperCase(),
      agenteMatricula: data.agente_matricula || data.agenteMatricula || actor.matricula,
      sigAgente: data.sig_agente || data.sigAgente || null,
      guinchoEmpresa: (data.guincho_empresa || data.guinchoEmpresa || '').toUpperCase(),
      guinchoTelefone: data.guincho_telefone || data.guinchoTelefone || null,
      sigCondutor: data.sig_condutor || data.sigCondutor || null,
      foto1: data.foto1 || null,
      foto2: data.foto2 || null,
    };

    const inserted = await db
      .insert(trvs)
      .values(newRecord)
      .onConflictDoUpdate({
        target: trvs.trvNo,
        set: {
          ...newRecord,
          updatedAt: new Date(),
        },
      })
      .returning();

    const createdTrv = inserted[0];

    // Registrar evento de auditoria
    await db.insert(trvEvents).values({
      trvId: createdTrv.id,
      tipoEvento: 'REGISTRADO',
      descricao: `TRV ${trvNo} registrado pelo agente ${newRecord.agenteNome} (${newRecord.agenteMatricula})`,
      autorNome: newRecord.agenteNome,
      autorMatricula: newRecord.agenteMatricula,
    });

    // Notificar clientes em tempo real via SSE
    broadcastEvent('trv_created', {
      trvNo: createdTrv.trvNo,
      placa: createdTrv.veiculoPlaca,
      modelo: createdTrv.veiculoModelo,
      parque: createdTrv.parqueRetencao,
      agente: createdTrv.agenteNome,
      timestamp: new Date().toISOString(),
    });

    return createdTrv;
  } catch (error) {
    console.error('Erro ao salvar TRV no banco de dados:', error);
    throw new Error('Falha ao persistir TRV no banco de dados relacional.', { cause: error });
  }
}

// Liberar veículo retido
export async function liberateTrv(
  trvNo: string,
  liberationData: { motivo: string; responsavel: string; dataLiberacao?: string }
) {
  try {
    const updated = await db
      .update(trvs)
      .set({
        status: 'LIBERADO',
        dataLiberacao: liberationData.dataLiberacao ? new Date(liberationData.dataLiberacao) : new Date(),
        motivoLiberacao: liberationData.motivo,
        responsavelLiberacao: liberationData.responsavel,
        updatedAt: new Date(),
      })
      .where(eq(trvs.trvNo, trvNo))
      .returning();

    if (updated.length === 0) {
      throw new Error(`TRV ${trvNo} não encontrado.`);
    }

    const trv = updated[0];

    // Registrar evento de auditoria
    await db.insert(trvEvents).values({
      trvId: trv.id,
      tipoEvento: 'LIBERADO',
      descricao: `Veículo placa ${trv.veiculoPlaca} liberado do pátio. Motivo: ${liberationData.motivo}`,
      autorNome: liberationData.responsavel,
    });

    // Broadcast SSE
    broadcastEvent('trv_liberated', {
      trvNo: trv.trvNo,
      placa: trv.veiculoPlaca,
      responsavel: liberationData.responsavel,
      timestamp: new Date().toISOString(),
    });

    return trv;
  } catch (error) {
    console.error(`Erro ao liberar TRV ${trvNo}:`, error);
    throw new Error('Falha ao processar liberação no banco de dados.', { cause: error });
  }
}

// Executar consulta complexa analítica em tempo real com agregações SQL
export async function getComplexAnalytics() {
  try {
    const startTime = performance.now();

    // 1. Contagens gerais (Total, Retidos, Liberados)
    const counts = await db
      .select({
        status: trvs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(trvs)
      .groupBy(trvs.status);

    let totalTrvs = 0;
    let retidos = 0;
    let liberados = 0;
    for (const c of counts) {
      totalTrvs += c.count;
      if (c.status === 'RETIDO') retidos += c.count;
      if (c.status === 'LIBERADO') liberados += c.count;
    }

    // 2. Ranking de Infrações (Top infrações com amparo legal)
    const topInfracoes = await db
      .select({
        codInfracao: trvs.codInfracao,
        amparoLegal: trvs.amparoLegal,
        total: sql<number>`count(*)::int`,
      })
      .from(trvs)
      .where(sql`${trvs.codInfracao} IS NOT NULL AND ${trvs.codInfracao} != ''`)
      .groupBy(trvs.codInfracao, trvs.amparoLegal)
      .orderBy(sql`count(*) DESC`)
      .limit(6);

    // 3. Ocupação e Volume por Pátio de Retenção (Join relacional)
    const yardsDistribution = await db
      .select({
        parqueRetencao: trvs.parqueRetencao,
        totalVeiculos: sql<number>`count(*)::int`,
        veiculosRetidos: sql<number>`count(CASE WHEN ${trvs.status} = 'RETIDO' THEN 1 END)::int`,
      })
      .from(trvs)
      .where(sql`${trvs.parqueRetencao} IS NOT NULL`)
      .groupBy(trvs.parqueRetencao);

    // 4. Distribuição por Tipo de Veículo
    const typesDistribution = await db
      .select({
        tipo: trvs.veiculoTipo,
        total: sql<number>`count(*)::int`,
      })
      .from(trvs)
      .where(sql`${trvs.veiculoTipo} IS NOT NULL`)
      .groupBy(trvs.veiculoTipo)
      .orderBy(sql`count(*) DESC`);

    // 5. Atividade dos Agentes (Total de autuações por agente)
    const agentsPerformance = await db
      .select({
        agenteNome: trvs.agenteNome,
        agenteMatricula: trvs.agenteMatricula,
        totalAutuacoes: sql<number>`count(*)::int`,
      })
      .from(trvs)
      .groupBy(trvs.agenteNome, trvs.agenteMatricula)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    const executionTimeMs = (performance.now() - startTime).toFixed(2);

    return {
      summary: {
        totalTrvs,
        retidos,
        liberados,
      },
      topInfracoes,
      yardsDistribution,
      typesDistribution,
      agentsPerformance,
      executionTimeMs,
      queriedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erro ao calcular analytics:', error);
    throw new Error('Falha ao processar estatísticas complexas em tempo real.', { cause: error });
  }
}

// Consulta de Reincidências (Veículos com múltiplos TRVs registrados)
export async function getReincidencias() {
  try {
    const startTime = performance.now();

    // Identificar placas com 2 ou mais registros
    const repeatPlates = await db
      .select({
        placa: trvs.veiculoPlaca,
        totalRemocoes: sql<number>`count(*)::int`,
        ultimaData: sql<string>`max(${trvs.dataHoraRegistro})::text`,
      })
      .from(trvs)
      .groupBy(trvs.veiculoPlaca)
      .having(sql`count(*) > 1`)
      .orderBy(sql`count(*) DESC`);

    const placasList = repeatPlates.map((p) => p.placa);
    let details: any[] = [];

    if (placasList.length > 0) {
      details = await db
        .select()
        .from(trvs)
        .where(inArray(trvs.veiculoPlaca, placasList))
        .orderBy(desc(trvs.dataHoraRegistro));
    }

    const executionTimeMs = (performance.now() - startTime).toFixed(2);

    return {
      repeatPlates,
      details,
      countReincidentes: repeatPlates.length,
      executionTimeMs,
    };
  } catch (error) {
    console.error('Erro ao buscar reincidências:', error);
    throw new Error('Falha ao identificar veículos reincidentes.', { cause: error });
  }
}

// Dados para Relatório Mensal do Agente
export async function getMonthlyReport(matricula: string, month: number, year: number) {
  try {
    // mês 1 a 12
    const targetMonthStr = String(month).padStart(2, '0');
    const startPattern = `${year}-${targetMonthStr}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endPattern = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const records = await db
      .select()
      .from(trvs)
      .where(
        and(
          eq(trvs.agenteMatricula, matricula),
          sql`${trvs.dataHoraRegistro} >= ${startPattern}::timestamp`,
          sql`${trvs.dataHoraRegistro} < ${endPattern}::timestamp`
        )
      )
      .orderBy(trvs.dataHoraRegistro);

    return {
      matricula,
      periodo: `${targetMonthStr}/${year}`,
      totalRemocoes: records.length,
      records,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    throw new Error('Falha ao extrair dados para o relatório mensal.', { cause: error });
  }
}

// Buscar dados auxiliares (Parques de Retenção, Tipos de Infração e Empresas de Guincho)
export async function getAuxiliaryData() {
  try {
    const [yards, infractions, companies] = await Promise.all([
      db.select().from(retentionYards).where(eq(retentionYards.ativo, true)),
      db.select().from(infractionTypes).orderBy(infractionTypes.codigo),
      db.select().from(towingCompanies).where(eq(towingCompanies.ativo, true)),
    ]);

    return {
      yards,
      infractions,
      companies,
    };
  } catch (error) {
    console.error('Erro ao obter dados auxiliares:', error);
    throw new Error('Falha ao carregar tabelas auxiliares do banco.', { cause: error });
  }
}
