import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { addClient } from './src/services/realtime.ts';
import {
  listTrvs,
  getTrvByNo,
  createTrv,
  liberateTrv,
  getComplexAnalytics,
  getReincidencias,
  getMonthlyReport,
  getAuxiliaryData,
} from './src/db/trvService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for base64 signatures and attachments
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ═══════════════════════════════════════════════════════════════
// Real-Time Server-Sent Events (SSE) Stream
// ═══════════════════════════════════════════════════════════════
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date() })}\n\n`);

  addClient(res);
});

// ═══════════════════════════════════════════════════════════════
// API Endpoints - Banco de Dados Relacional & Consultas
// ═══════════════════════════════════════════════════════════════

// Tabelas auxiliares (Parques de retenção, infrações CTB, guinchos)
app.get('/api/auxiliary', async (_req: Request, res: Response) => {
  try {
    const data = await getAuxiliaryData();
    res.json(data);
  } catch (error: any) {
    console.error('Erro na rota /api/auxiliary:', error);
    res.status(500).json({ error: error.message || 'Erro ao carregar dados auxiliares.' });
  }
});

// Listagem com consultas complexas e filtros multi-dimensionais
app.get('/api/trvs', async (req: Request, res: Response) => {
  try {
    const {
      search,
      startDate,
      endDate,
      status,
      parque,
      codInfracao,
      veiculoTipo,
      matricula,
      limit,
      offset,
    } = req.query;

    const result = await listTrvs({
      search: typeof search === 'string' ? search : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      status: typeof status === 'string' ? status : undefined,
      parque: typeof parque === 'string' ? parque : undefined,
      codInfracao: typeof codInfracao === 'string' ? codInfracao : undefined,
      veiculoTipo: typeof veiculoTipo === 'string' ? veiculoTipo : undefined,
      matricula: typeof matricula === 'string' ? matricula : undefined,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Erro na consulta /api/trvs:', error);
    res.status(500).json({ error: error.message || 'Erro ao realizar consulta de TRVs.' });
  }
});

// Detalhes de um TRV específico por número com auditoria
app.get('/api/trvs/:trvNo', async (req: Request, res: Response) => {
  try {
    const trvNo = req.params.trvNo;
    const trv = await getTrvByNo(trvNo);
    if (!trv) {
      return res.status(404).json({ error: `TRV ${trvNo} não encontrado.` });
    }
    res.json(trv);
  } catch (error: any) {
    console.error(`Erro ao buscar TRV ${req.params.trvNo}:`, error);
    res.status(500).json({ error: error.message || 'Erro ao carregar TRV.' });
  }
});

// Criação / Salvamento de Novo TRV Digital
app.post('/api/trvs', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const actor = {
      nome: req.user?.name || req.body.agente_nome || 'AGENTE SEMUTRAN',
      matricula: req.body.agente_matricula || 'SEMUTRAN',
    };

    const saved = await createTrv(req.body, actor);
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Erro ao cadastrar TRV:', error);
    res.status(500).json({ error: error.message || 'Erro ao salvar TRV no banco de dados.' });
  }
});

// Liberação de Veículo Retido
app.post('/api/trvs/:trvNo/liberar', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { trvNo } = req.params;
    const { motivo, responsavel, dataLiberacao } = req.body;

    if (!motivo || !responsavel) {
      return res.status(400).json({ error: 'Motivo e responsável pela liberação são obrigatórios.' });
    }

    const liberated = await liberateTrv(trvNo, {
      motivo,
      responsavel,
      dataLiberacao,
    });

    res.json(liberated);
  } catch (error: any) {
    console.error(`Erro ao liberar TRV ${req.params.trvNo}:`, error);
    res.status(500).json({ error: error.message || 'Erro ao liberar veículo.' });
  }
});

// Estatísticas e Agregações Complexas em Tempo Real
app.get('/api/analytics/realtime', async (_req: Request, res: Response) => {
  try {
    const analytics = await getComplexAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error('Erro na rota /api/analytics/realtime:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar análise em tempo real.' });
  }
});

// Consulta Avançada de Reincidências (Veículos com múltiplos autos)
app.get('/api/analytics/reincidencias', async (_req: Request, res: Response) => {
  try {
    const reincidencias = await getReincidencias();
    res.json(reincidencias);
  } catch (error: any) {
    console.error('Erro na rota /api/analytics/reincidencias:', error);
    res.status(500).json({ error: error.message || 'Erro ao consultar reincidências.' });
  }
});

// Relatório Mensal Consolidado para Impressão e Auditoria
app.get('/api/reports/monthly', async (req: Request, res: Response) => {
  try {
    const matricula = req.query.matricula as string;
    const month = req.query.month ? parseInt(req.query.month as string, 10) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    if (!matricula) {
      return res.status(400).json({ error: 'A matrícula do agente é obrigatória para o relatório.' });
    }

    const report = await getMonthlyReport(matricula, month, year);
    res.json(report);
  } catch (error: any) {
    console.error('Erro na rota /api/reports/monthly:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar relatório mensal.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// Vite Frontend Middleware / Static Serve
// ═══════════════════════════════════════════════════════════════
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor TRV Digital em execução na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor Express:', err);
  process.exit(1);
});
