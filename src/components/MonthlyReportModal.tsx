import React, { useState, useEffect } from 'react';
import { TRV } from '../types/trv.ts';
import { Printer, X, FileText, Search, AlertCircle, Loader2 } from 'lucide-react';

interface MonthlyReportModalProps {
  onClose: () => void;
  defaultMatricula?: string;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  onClose,
  defaultMatricula = '1042',
}) => {
  const [matricula, setMatricula] = useState(defaultMatricula);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{
    matricula: string;
    periodo: string;
    totalRemocoes: number;
    records: TRV[];
  } | null>(null);

  const fetchReport = async () => {
    if (!matricula) {
      setError('Informe a matrícula do agente.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/monthly?matricula=${encodeURIComponent(matricula)}&month=${month}&year=${year}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao gerar relatório.');
      }
      const data = await res.json();
      setReportData(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Controls Bar - hidden in print */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm sm:text-base">Relatório Mensal de Remoções - SEMUTRAN</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Matrícula:</span>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 1042"
                className="w-20 bg-transparent text-xs font-bold text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Mês:</span>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="bg-slate-800 text-xs font-bold text-white outline-none cursor-pointer"
              >
                {monthNames.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Ano:</span>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="bg-slate-800 text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Consultar
            </button>

            {reportData && reportData.records.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {error && (
          <div className="p-4 m-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {reportData && (
          <div className="p-6 sm:p-10 text-slate-900 print:p-4 text-[10px] leading-tight font-sans">
            {/* Report Header */}
            <div className="text-center border-b-2 border-blue-900 pb-3 mb-4">
              <div className="flex justify-center mb-2">
                <img
                  src="/assets/aistudio/Bras_o_de_Paragominas_-_PA.svg_d09b2f68.png"
                  alt="Brasão do Município de Paragominas"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">
                Prefeitura Municipal de Paragominas
              </p>
              <p className="text-[11px] font-bold text-slate-600 uppercase">
                Secretaria Municipal de Trânsito e Cidadania - SEMUTRAN
              </p>
              <h1 className="text-base sm:text-xl font-black text-blue-950 uppercase mt-2">
                Relatório Mensal de Veículos Removidos
              </h1>
            </div>

            {/* Officer and Period Summary */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-xs font-medium">
              <div>
                <p>
                  <strong className="text-slate-700">AGENTE RESPONSÁVEL:</strong>{' '}
                  <span className="font-bold text-blue-950 uppercase">
                    {reportData.records[0]?.agenteNome || 'AGENTE SEMUTRAN'}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-700">MATRÍCULA:</strong>{' '}
                  <span className="font-bold text-slate-900">{reportData.matricula}</span>
                </p>
              </div>
              <div className="text-right">
                <p>
                  <strong className="text-slate-700">PERÍODO:</strong>{' '}
                  <span className="font-bold text-slate-900">{reportData.periodo}</span>
                </p>
                <p>
                  <strong className="text-slate-700">TOTAL DE REMOÇÕES:</strong>{' '}
                  <span className="font-black text-blue-900 text-sm">{reportData.totalRemocoes}</span>
                </p>
              </div>
            </div>

            {/* Table */}
            {reportData.records.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold border rounded-lg">
                Nenhum veículo removido registrado para esta matrícula neste período.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-blue-950 text-white uppercase text-left">
                      <th className="border border-slate-900 p-1.5 text-center w-16">Nº TRV</th>
                      <th className="border border-slate-900 p-1.5 text-center w-24">Data / Hora</th>
                      <th className="border border-slate-900 p-1.5 text-center w-20">Placa</th>
                      <th className="border border-slate-900 p-1.5 w-28">Modelo</th>
                      <th className="border border-slate-900 p-1.5 text-center w-20">AIT</th>
                      <th className="border border-slate-900 p-1.5 text-center w-16">Cód. Inf.</th>
                      <th className="border border-slate-900 p-1.5">Amparo Legal CTB</th>
                      <th className="border border-slate-900 p-1.5">Local da Ocorrência</th>
                      <th className="border border-slate-900 p-1.5 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map((r, i) => (
                      <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="border border-slate-400 p-1.5 text-center font-bold text-blue-900">{r.trvNo}</td>
                        <td className="border border-slate-400 p-1.5 text-center">
                          {new Date(r.dataHoraRegistro).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center font-black uppercase tracking-wide">
                          {r.veiculoPlaca}
                        </td>
                        <td className="border border-slate-400 p-1.5 uppercase font-medium">{r.veiculoModelo || '-'}</td>
                        <td className="border border-slate-400 p-1.5 text-center uppercase">{r.aitNo || '-'}</td>
                        <td className="border border-slate-400 p-1.5 text-center font-bold">{r.codInfracao || '-'}</td>
                        <td className="border border-slate-400 p-1.5 text-[8.5px]">{r.amparoLegal || '-'}</td>
                        <td className="border border-slate-400 p-1.5 text-[8.5px] uppercase">{r.localLogradouro || '-'}</td>
                        <td className="border border-slate-400 p-1.5 text-center font-bold text-[8px]">
                          <span className={r.status === 'RETIDO' ? 'text-amber-700' : 'text-emerald-700'}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signatures Area */}
            <div className="mt-12 pt-6 grid grid-cols-2 gap-12 text-center">
              <div>
                <div className="border-t border-slate-900 pt-1.5">
                  <p className="font-black text-xs uppercase text-slate-900">Assinatura do Agente Autuador</p>
                  <p className="text-[9px] text-slate-500">Matrícula: {reportData.matricula}</p>
                </div>
              </div>

              <div>
                <div className="border-t border-slate-900 pt-1.5">
                  <p className="font-black text-xs uppercase text-slate-900">Coordenação de Fiscalização</p>
                  <p className="text-[9px] text-slate-500">SEMUTRAN - Paragominas/PA</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[8px] text-slate-400">
              Relatório gerado em {new Date().toLocaleString('pt-BR')} via TRV DIGITAL • Sistema Relacional com Suporte a Consultas em Tempo Real
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
