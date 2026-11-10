import React from 'react';
import { ComplexAnalytics, TRV } from '../types/trv.ts';
import {
  Car,
  ShieldAlert,
  CheckCircle,
  Database,
  ArrowUpRight,
  PlusCircle,
  Search,
  FileSpreadsheet,
  Clock,
  Layers,
  Activity,
  AlertOctagon,
} from 'lucide-react';

interface DashboardViewProps {
  analytics: ComplexAnalytics | null;
  recentTrvs: TRV[];
  onNavigateTab: (tab: 'dashboard' | 'novo' | 'consultas' | 'historico') => void;
  onSelectTrv: (trv: TRV) => void;
  onOpenReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  recentTrvs,
  onNavigateTab,
  onSelectTrv,
  onOpenReport,
}) => {
  const summary = analytics?.summary || { totalTrvs: 0, retidos: 0, liberados: 0 };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL Cloud SQL • Consultas em Tempo Real
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Painel de Operações e Remoções Veiculares
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Sistema oficial SEMUTRAN Paragominas para lavratura de TRV Digital, controle de pátios de retenção,
              análise relacional de reincidências e emissão de termos regulamentares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('novo')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Novo TRV Digital
            </button>
            <button
              onClick={() => onNavigateTab('consultas')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition hover:-translate-y-0.5 cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Consultas Complexas
            </button>
            <button
              onClick={onOpenReport}
              className="px-4 py-3 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-indigo-800/40 transition hover:-translate-y-0.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              Relatório Mensal
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total TRVs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total de TRVs
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{summary.totalTrvs}</span>
              <span className="text-xs text-slate-400 font-medium">registros</span>
            </div>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
              <Activity className="w-3 h-3" />
              Histórico sincronizado
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Veículos Retidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Veículos Retidos
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">{summary.retidos}</span>
              <span className="text-xs text-slate-400 font-medium">no pátio</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3 h-3" />
              Aguardando regularização
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Veículos Liberados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Veículos Liberados
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{summary.liberados}</span>
              <span className="text-xs text-slate-400 font-medium">saídas</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" />
              Regularizados e liberados
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Performance SQL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Performance do Banco
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">
                {analytics?.executionTimeMs || '1.2'}
                <span className="text-lg font-bold">ms</span>
              </span>
            </div>
            <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1 mt-1">
              <Database className="w-3 h-3" />
              Pool PostgreSQL Ativo
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Yards Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                Ocupação dos Pátios de Retenção
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Tempo Real</span>
            </div>

            <div className="mt-5 space-y-5">
              {analytics?.yardsDistribution && analytics.yardsDistribution.length > 0 ? (
                analytics.yardsDistribution.map((y, idx) => {
                  const maxCap = y.parqueRetencao.includes('SEDE') ? 200 : 120;
                  const percent = Math.min(100, Math.round((y.veiculosRetidos / maxCap) * 100));
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{y.parqueRetencao}</span>
                        <span className="font-extrabold text-blue-900">
                          {y.veiculosRetidos} retidos{' '}
                          <span className="text-slate-400 font-normal">/ {maxCap} cap</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent > 80
                              ? 'bg-rose-500'
                              : percent > 50
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Total histórico: {y.totalVeiculos}</span>
                        <span>{percent}% de ocupação</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Carregando dados de ocupação dos pátios...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-800" />
            Capacidades regulamentadas conforme convênio SEMUTRAN
          </div>
        </div>

        {/* Top Infractions Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Top Infrações CTB com Remoção
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Mais autuadas</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {analytics?.topInfracoes && analytics.topInfracoes.length > 0 ? (
                analytics.topInfracoes.map((inf, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-blue-950 font-mono">
                          {inf.codInfracao}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[190px]">
                          {inf.amparoLegal || 'Código de Trânsito Brasileiro'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-black shrink-0">
                      {inf.total} {inf.total === 1 ? 'auto' : 'autos'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhuma infração registrada no momento.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('consultas')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center justify-between transition cursor-pointer"
          >
            Filtrar por código de infração
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Veículos por Categoria & Agentes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-700" />
                Distribuição por Categoria
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Tipos</span>
            </div>

            <div className="mt-4 space-y-3">
              {analytics?.typesDistribution && analytics.typesDistribution.length > 0 ? (
                analytics.typesDistribution.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase">{t.tipo || 'OUTROS'}</span>
                    <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {t.total}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Carregando tipos de veículos...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
              Autuadores em Destaque
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analytics?.agentsPerformance?.map((ag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold"
                >
                  Matr. {ag.agenteMatricula} ({ag.totalAutuacoes})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent TRVs Feed in Real-Time */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              Últimas Remoções em Tempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Sincronização contínua com a base relacional PostgreSQL via SSE
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('historico')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition cursor-pointer"
          >
            Ver Histórico Completo
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 font-extrabold">Nº TRV</th>
                <th className="py-3 px-3 font-extrabold">Data / Hora</th>
                <th className="py-3 px-3 font-extrabold">Placa / UF</th>
                <th className="py-3 px-3 font-extrabold">Veículo</th>
                <th className="py-3 px-3 font-extrabold">Infração</th>
                <th className="py-3 px-3 font-extrabold">Pátio</th>
                <th className="py-3 px-3 font-extrabold">Agente</th>
                <th className="py-3 px-3 font-extrabold text-center">Status</th>
                <th className="py-3 px-3 font-extrabold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTrvs.slice(0, 6).map((trv) => (
                <tr key={trv.id || trv.trvNo} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-3 font-black text-blue-950 font-mono">{trv.trvNo}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {trv.dataHoraRegistro ? new Date(trv.dataHoraRegistro).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-black font-mono uppercase bg-slate-100 border border-slate-200 text-slate-900">
                      {trv.veiculoPlaca}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 uppercase">
                    {trv.veiculoModelo || trv.veiculoMarca || '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {trv.codInfracao || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] font-bold text-blue-900">{trv.parqueRetencao}</td>
                  <td className="py-3 px-3 text-slate-700 uppercase font-medium">
                    {trv.agenteNome}{' '}
                    <span className="text-[10px] text-slate-400">({trv.agenteMatricula})</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        trv.status === 'RETIDO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {trv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectTrv(trv)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Abrir TRV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
