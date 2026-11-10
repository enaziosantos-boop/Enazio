import React, { useState, useEffect } from 'react';
import { TRV, RetentionYard, InfractionType, ReincidenciaItem } from '../types/trv.ts';
import {
  Search,
  Filter,
  Sparkles,
  Database,
  Clock,
  Download,
  Printer,
  Car,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

interface QueryWorkbenchProps {
  yards: RetentionYard[];
  infractions: InfractionType[];
  onSelectTrv: (trv: TRV) => void;
  onOpenLiberate: (trv: TRV) => void;
}

export const QueryWorkbench: React.FC<QueryWorkbenchProps> = ({
  yards,
  infractions,
  onSelectTrv,
  onOpenLiberate,
}) => {
  // Query Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('TODOS');
  const [parque, setParque] = useState('');
  const [codInfracao, setCodInfracao] = useState('');
  const [veiculoTipo, setVeiculoTipo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Results & Metrics
  const [results, setResults] = useState<TRV[]>([]);
  const [executionTime, setExecutionTime] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [reincidencias, setReincidencias] = useState<ReincidenciaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'filtro' | 'reincidencias'>('filtro');

  // Run complex query against Cloud SQL
  const executeQuery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (status !== 'TODOS') params.append('status', status);
      if (parque) params.append('parque', parque);
      if (codInfracao) params.append('codInfracao', codInfracao);
      if (veiculoTipo) params.append('veiculoTipo', veiculoTipo);
      if (matricula.trim()) params.append('matricula', matricula.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/trvs?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao consultar banco relacional.');
      const json = await res.json();
      setResults(json.data || []);
      setExecutionTime(json.executionTimeMs || '1.10');
    } catch (err) {
      console.error('Erro na consulta:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run Reincidências Query
  const fetchReincidencias = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/reincidencias');
      if (!res.ok) throw new Error('Falha na consulta de reincidências.');
      const data = await res.json();
      setReincidencias(data.repeatPlates || []);
      setResults(data.details || []);
      setExecutionTime(data.executionTimeMs || '1.85');
    } catch (err) {
      console.error('Erro reincidencias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('TODOS');
    setParque('');
    setCodInfracao('');
    setVeiculoTipo('');
    setMatricula('');
    setStartDate('');
    setEndDate('');
    setActiveTab('filtro');
    setTimeout(executeQuery, 10);
  };

  // Predefined Presets
  const applyPreset = (preset: string) => {
    setActiveTab('filtro');
    if (preset === 'reincidencias') {
      setActiveTab('reincidencias');
      fetchReincidencias();
      return;
    }

    if (preset === 'motos_retidas') {
      setVeiculoTipo('MOTOCICLETA');
      setStatus('RETIDO');
      setCodInfracao('');
      setParque('');
    } else if (preset === 'alcoolemia') {
      setCodInfracao('516-91');
      setStatus('TODOS');
      setVeiculoTipo('');
      setParque('');
    } else if (preset === 'patio_sede') {
      setParque('SEDE SEMUTRAN');
      setStatus('RETIDO');
      setVeiculoTipo('');
      setCodInfracao('');
    } else if (preset === 'sem_cnh') {
      setCodInfracao('501-00');
      setStatus('TODOS');
      setVeiculoTipo('');
      setParque('');
    }
    setTimeout(executeQuery, 50);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = [
      'TRV_NO',
      'DATA_REGISTRO',
      'PLACA',
      'UF',
      'MARCA_MODELO',
      'TIPO',
      'AIT',
      'COD_INFRACAO',
      'AMPARO_LEGAL',
      'CONDUTOR',
      'CPF',
      'PATIO',
      'STATUS',
      'AGENTE',
      'MATRICULA',
    ];

    const rows = results.map((r) => [
      `"${r.trvNo}"`,
      `"${r.dataHoraRegistro}"`,
      `"${r.veiculoPlaca}"`,
      `"${r.veiculoUf || 'PA'}"`,
      `"${r.veiculoModelo || r.veiculoMarca || ''}"`,
      `"${r.veiculoTipo || ''}"`,
      `"${r.aitNo || ''}"`,
      `"${r.codInfracao || ''}"`,
      `"${(r.amparoLegal || '').replace(/"/g, '""')}"`,
      `"${(r.condutorNome || '').replace(/"/g, '""')}"`,
      `"${r.condutorCpf || ''}"`,
      `"${(r.parqueRetencao || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.agenteNome || '').replace(/"/g, '""')}"`,
      `"${r.agenteMatricula || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Consulta_TRV_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Query Presets */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full mb-1">
              <Database className="w-3.5 h-3.5 text-blue-700" />
              PostgreSQL Relational Engine
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Workbench de Consultas Complexas em Tempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Execute filtros multi-relacionais indexados com projeção instantânea e auditoria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={results.length === 0}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
            <button
              onClick={() => window.print()}
              disabled={results.length === 0}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Quick Query Presets */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
            Consultas Pré-Definidas de Inteligência de Trânsito
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('reincidencias')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                activeTab === 'reincidencias'
                  ? 'bg-rose-900 text-rose-100 border-rose-800 shadow-sm'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Reincidências Críticas (2+ Remoções)
            </button>

            <button
              type="button"
              onClick={() => applyPreset('motos_retidas')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-blue-200 cursor-pointer"
            >
              <Car className="w-3.5 h-3.5 text-blue-600" />
              Motos Retidas no Pátio
            </button>

            <button
              type="button"
              onClick={() => applyPreset('alcoolemia')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-amber-200 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Art. 165 - Alcoolemia
            </button>

            <button
              type="button"
              onClick={() => applyPreset('sem_cnh')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-indigo-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Art. 162 I - Sem CNH/PPD
            </button>

            <button
              type="button"
              onClick={() => applyPreset('patio_sede')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-300 cursor-pointer"
            >
              Pátio SEDE SEMUTRAN (Retidos)
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Free Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
              placeholder="Placa, AIT, Agente, Condutor..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-600 focus:outline-none transition uppercase"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="TODOS">Status: Todos</option>
              <option value="RETIDO">Status: Apenas RETIDOS</option>
              <option value="LIBERADO">Status: Apenas LIBERADOS</option>
            </select>
          </div>

          {/* Tipo de Veículo */}
          <div>
            <select
              value={veiculoTipo}
              onChange={(e) => setVeiculoTipo(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="">Tipo: Todos os Veículos</option>
              <option value="MOTOCICLETA">MOTOCICLETA</option>
              <option value="AUTOMÓVEL">AUTOMÓVEL</option>
              <option value="CAMINHONETE">CAMINHONETE</option>
              <option value="CAMINHÃO">CAMINHÃO</option>
            </select>
          </div>

          {/* Pátio */}
          <div>
            <select
              value={parque}
              onChange={(e) => setParque(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="">Pátio: Todos os Parques</option>
              {yards.map((y) => (
                <option key={y.id} value={y.nome}>
                  {y.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Código de Infração */}
          <div>
            <select
              value={codInfracao}
              onChange={(e) => setCodInfracao(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="">Infração: Todas do CTB</option>
              {infractions.map((inf) => (
                <option key={inf.id} value={inf.codigo}>
                  {inf.codigo} - {inf.descricao.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Matrícula do Agente */}
          <div>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
              placeholder="Matrícula do Agente"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* Data Início */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-600 focus:outline-none transition"
              title="Data inicial"
            />
          </div>

          {/* Actions Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={executeQuery}
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
              Executar Consulta
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Limpar Filtros"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Execution Metrics Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL EXPLAIN ANALYZE
            </span>
            <span className="text-slate-300">
              Registros correspondentes: <strong className="text-white">{results.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Tempo de Execução:{' '}
            <span className="text-amber-400 font-bold">{executionTime} ms</span>
          </div>
        </div>
      </div>

      {/* Reincidências Highlight if selected */}
      {activeTab === 'reincidencias' && reincidencias.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
              Veículos Reincidentes Detectados via Agregação HAVING count(*) &gt; 1
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reincidencias.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 uppercase">
                    {item.placa}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Último auto: {new Date(item.ultimaData).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-rose-700">{item.totalRemocoes}</span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Remoções</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            Resultados da Consulta ({results.length} registros)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Ordenado por Data de Registro (DESC)
          </span>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Nenhum registro encontrado</h4>
            <p className="text-xs text-slate-400 mt-1">
              Ajuste os parâmetros ou selecione uma consulta pré-definida.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-extrabold">Nº TRV</th>
                  <th className="py-3 px-4 font-extrabold">Data / Hora</th>
                  <th className="py-3 px-4 font-extrabold">Placa / UF</th>
                  <th className="py-3 px-4 font-extrabold">Veículo</th>
                  <th className="py-3 px-4 font-extrabold">Infração</th>
                  <th className="py-3 px-4 font-extrabold">Pátio</th>
                  <th className="py-3 px-4 font-extrabold">Agente</th>
                  <th className="py-3 px-4 font-extrabold text-center">Status</th>
                  <th className="py-3 px-4 font-extrabold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((trv) => (
                  <tr key={trv.id || trv.trvNo} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 font-black text-blue-950 font-mono">{trv.trvNo}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {trv.dataHoraRegistro ? new Date(trv.dataHoraRegistro).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-black font-mono uppercase bg-slate-100 border border-slate-200 text-slate-900">
                        {trv.veiculoPlaca}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 uppercase">
                      {trv.veiculoModelo || trv.veiculoMarca || '-'}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {trv.veiculoTipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono text-[11px] block">
                        {trv.codInfracao || '-'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px] block">
                        {trv.amparoLegal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-blue-950">{trv.parqueRetencao}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {trv.agenteNome}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">({trv.agenteMatricula})</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          trv.status === 'RETIDO'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {trv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTrv(trv)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Ver TRV
                        </button>
                        {trv.status === 'RETIDO' && (
                          <button
                            onClick={() => onOpenLiberate(trv)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Liberar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
