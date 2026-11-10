import React, { useState } from 'react';
import { TRV } from '../types/trv.ts';
import {
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Search,
  Share2,
  Car,
  ShieldCheck,
  Building,
  User,
  History,
} from 'lucide-react';

interface HistoryViewProps {
  trvs: TRV[];
  onSelectTrv: (trv: TRV) => void;
  onOpenLiberate: (trv: TRV) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  trvs,
  onSelectTrv,
  onOpenLiberate,
}) => {
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'RETIDO' | 'LIBERADO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = trvs.filter((t) => {
    if (filterStatus !== 'TODOS' && t.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.trvNo.toLowerCase().includes(q) ||
        t.veiculoPlaca.toLowerCase().includes(q) ||
        (t.veiculoModelo || '').toLowerCase().includes(q) ||
        (t.condutorNome || '').toLowerCase().includes(q) ||
        (t.agenteNome || '').toLowerCase().includes(q) ||
        (t.agenteMatricula || '').includes(q)
      );
    }
    return true;
  });

  const handleShare = async (trv: TRV) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TRV Digital Nº ${trv.trvNo}`,
          text: `Termo de Remoção Veicular Nº ${trv.trvNo} - Veículo Placa ${trv.veiculoPlaca} recolhido para ${trv.parqueRetencao}.`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(
        `TRV Nº ${trv.trvNo} - Placa ${trv.veiculoPlaca} (${trv.veiculoModelo || 'Veículo'}) recolhido para ${trv.parqueRetencao}.`
      );
      alert('Informações do TRV copiadas para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            Histórico Oficial de TRVs e Gestão de Pátio
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o ciclo de vida dos veículos removidos na base relacional do Cloud SQL.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'TODOS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({trvs.length})
          </button>
          <button
            onClick={() => setFilterStatus('RETIDO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'RETIDO'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retidos ({trvs.filter((t) => t.status === 'RETIDO').length})
          </button>
          <button
            onClick={() => setFilterStatus('LIBERADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'LIBERADO'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Liberados ({trvs.filter((t) => t.status === 'LIBERADO').length})
          </button>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por Placa, Número do TRV, Modelo, Condutor, Agente ou Matrícula..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:border-blue-600 focus:outline-none transition shadow-xs uppercase"
        />
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Nenhum TRV localizado</h3>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar o termo da busca ou o filtro de status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trv) => (
            <div
              key={trv.id || trv.trvNo}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-black font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 tracking-wider">
                      Nº {trv.trvNo}
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1.5 uppercase tracking-tight">
                      {trv.veiculoPlaca}
                      <span className="text-xs text-slate-400 font-bold ml-1.5 font-normal">
                        ({trv.veiculoUf || 'PA'})
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-700 uppercase">
                      {trv.veiculoModelo || trv.veiculoMarca || 'MODELO NÃO ESPECIFICADO'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      trv.status === 'RETIDO'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {trv.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {trv.dataHoraRegistro ? new Date(trv.dataHoraRegistro).toLocaleString('pt-BR') : '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-blue-950 truncate">{trv.parqueRetencao}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Agente: <strong className="uppercase">{trv.agenteNome}</strong> (Matr. {trv.agenteMatricula})
                    </span>
                  </div>

                  {trv.codInfracao && (
                    <div className="text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono text-slate-700 mt-2">
                      <strong className="text-blue-900">Infração:</strong> {trv.codInfracao} • {trv.amparoLegal}
                    </div>
                  )}

                  {trv.status === 'LIBERADO' && trv.motivoLiberacao && (
                    <div className="text-[10px] bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 mt-2">
                      <strong>Liberação:</strong> {trv.motivoLiberacao}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShare(trv)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Compartilhar dados do TRV"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectTrv(trv)}
                    className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                    title="Imprimir Termo Oficial"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {trv.status === 'RETIDO' && (
                    <button
                      onClick={() => onOpenLiberate(trv)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Liberar
                    </button>
                  )}
                  <button
                    onClick={() => onSelectTrv(trv)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Abrir TRV
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
