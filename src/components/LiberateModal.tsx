import React, { useState } from 'react';
import { TRV } from '../types/trv.ts';
import { CheckCircle2, X, AlertTriangle, Loader2 } from 'lucide-react';

interface LiberateModalProps {
  trv: TRV;
  onClose: () => void;
  onSuccess: (updatedTrv: TRV) => void;
}

export const LiberateModal: React.FC<LiberateModalProps> = ({ trv, onClose, onSuccess }) => {
  const [motivo, setMotivo] = useState(
    'Taxas de pátio e guincho quitadas e pendências de trânsito regularizadas.'
  );
  const [responsavel, setResponsavel] = useState('COORDENADOR DE PÁTIO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || !responsavel.trim()) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trvs/${trv.trvNo}/liberar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo,
          responsavel,
          dataLiberacao: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao liberar veículo.');
      }

      const updated = await res.json();
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar liberação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">Liberar Veículo do Pátio</h3>
              <p className="text-xs text-slate-400">TRV Nº {trv.trvNo} • Placa {trv.veiculoPlaca}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Esta ação registrará no banco de dados relacional a saída oficial do veículo{' '}
              <strong className="uppercase">{trv.veiculoModelo || trv.veiculoPlaca}</strong> do parque de retenção{' '}
              <strong>{trv.parqueRetencao}</strong> com registro de auditoria imutável.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Motivo da Liberação
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-medium focus:border-blue-600 focus:outline-none transition"
              placeholder="Descreva o motivo da liberação (comprovante de quitação, autorização da autoridade de trânsito, etc.)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Responsável pela Liberação
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-bold focus:border-blue-600 focus:outline-none transition uppercase"
              placeholder="Nome ou Matrícula do Coordenador"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Liberação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
