import React, { useRef } from 'react';
import { TRV } from '../types/trv.ts';
import { Printer, X, Download, ShieldCheck, Car, Calendar, UserCheck } from 'lucide-react';

interface TRVPrintModalProps {
  trv: TRV;
  onClose: () => void;
}

export const TRVPrintModal: React.FC<TRVPrintModalProps> = ({ trv, onClose }) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDataRegistro = trv.dataHoraRegistro
    ? new Date(trv.dataHoraRegistro).toLocaleString('pt-BR')
    : '-';

  const formattedDataInfracao = trv.dataInfracao
    ? (trv.dataInfracao.includes('-')
        ? trv.dataInfracao.split('-').reverse().join('/')
        : trv.dataInfracao)
    : '-';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Action Header - hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">TRV Nº {trv.trvNo}</h2>
              <p className="text-xs text-slate-400">
                Placa: <span className="font-bold text-white uppercase">{trv.veiculoPlaca}</span> • Status:{' '}
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    trv.status === 'RETIDO'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {trv.status}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Document Container */}
        <div
          ref={printRef}
          className="p-6 sm:p-8 bg-white text-slate-900 print:p-4 text-[11px] leading-snug font-sans selection:bg-none"
          style={{ minHeight: '297mm' }}
        >
          {/* Header SEMUTRAN Paragominas */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <div className="flex justify-center mb-2">
              <img
                src="/assets/aistudio/Bras_o_de_Paragominas_-_PA.svg_d09b2f68.png"
                alt="Brasão do Município de Paragominas"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Prefeitura Municipal de Paragominas
            </p>
            <p className="text-[12px] font-black text-blue-950 uppercase tracking-wide">
              Secretaria Municipal de Trânsito e Cidadania - SEMUTRAN
            </p>
            <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase mt-1 tracking-wider border-t border-slate-200 pt-1">
              Termo de Remoção Veicular - TRV Digital
            </h1>
          </div>

          {/* 01. Visão Geral */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              01. Visão Geral
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Número do TRV</span>
                <span className="font-black text-blue-950 text-sm tracking-wider">{trv.trvNo}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Data/Hora de Registro</span>
                <span className="font-bold text-slate-800">{formattedDataRegistro}</span>
              </div>
            </div>
          </div>

          {/* 02. Infração */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              02. Infração
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Nº do AIT</span>
                <span className="font-bold text-slate-900 uppercase">{trv.aitNo || 'NÃO INFORMADO'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Cód. Infração</span>
                <span className="font-bold text-slate-900 uppercase">{trv.codInfracao || 'NÃO INFORMADO'}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Amparo Legal CTB</span>
                <span className="font-bold text-slate-900">{trv.amparoLegal || 'Art. 271 do CTB'}</span>
              </div>
            </div>
          </div>

          {/* 03. Veículo */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              03. Identificação do Veículo
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div className="p-1.5 bg-blue-50/60 rounded border border-blue-200">
                <span className="text-[9px] font-bold text-blue-900 uppercase block">Placa / UF</span>
                <span className="font-black text-blue-950 text-sm uppercase">
                  {trv.veiculoPlaca} - {trv.veiculoUf || 'PA'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Marca / Modelo</span>
                <span className="font-bold text-slate-900 uppercase">
                  {trv.veiculoMarca || ''} {trv.veiculoModelo || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Cor / Tipo</span>
                <span className="font-bold text-slate-900 uppercase">
                  {trv.veiculoCor || 'N/A'} • {trv.veiculoTipo || 'AUTOMÓVEL'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">RENAVAM</span>
                <span className="font-bold text-slate-900 uppercase">{trv.veiculoRenavam || '-'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Chassi</span>
                <span className="font-bold text-slate-900 uppercase">{trv.veiculoChassi || '-'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Proprietário</span>
                <span className="font-bold text-slate-900 uppercase">{trv.veiculoProprietario || '-'}</span>
              </div>
            </div>
          </div>

          {/* 04. Condutor */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              04. Dados do Condutor
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Nome Completo</span>
                <span className="font-bold text-slate-900 uppercase">{trv.condutorNome || 'NÃO APRESENTADO'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">CPF</span>
                <span className="font-bold text-slate-900">{trv.condutorCpf || 'NÃO INFORMADO'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">CNH</span>
                <span className="font-bold text-slate-900 uppercase">{trv.condutorCnh || 'NÃO INFORMADA'}</span>
              </div>
            </div>
          </div>

          {/* 05. Local da Ocorrência */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              05. Local da Infração
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Logradouro</span>
                <span className="font-bold text-slate-900 uppercase">{trv.localLogradouro || '-'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Bairro</span>
                <span className="font-bold text-slate-900 uppercase">{trv.localBairro || 'PARAGOMINAS - PA'}</span>
              </div>
            </div>
          </div>

          {/* 06. Remoção e Pátio */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              06. Dados da Remoção e Pátio
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Parque de Retenção</span>
                <span className="font-bold text-blue-950 uppercase">{trv.parqueRetencao || 'SEDE SEMUTRAN'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Endereço do Parque</span>
                <span className="font-bold text-slate-900 text-[10px] uppercase">
                  {trv.parqueEndereco || 'RUA DO IPÊ, S/N - BAIRRO ALTO DO VALE, PARAGOMINAS - PA'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Data/Hora da Remoção</span>
                <span className="font-bold text-slate-900">
                  {formattedDataInfracao} às {trv.horaInfracao || '--:--'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Estado do Veículo / Avarias</span>
                <span className="font-medium text-slate-800 text-[10px]">
                  {trv.remocaoObservacao || 'Sem avarias aparentes registradas no momento do recolhimento.'}
                </span>
              </div>
            </div>
          </div>

          {/* 07. Agente e Guincho */}
          <div className="mb-3">
            <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
              07. Agente Autuador e Transporte
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Agente Autuador</span>
                <span className="font-bold text-slate-900 uppercase">{trv.agenteNome}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Matrícula</span>
                <span className="font-bold text-slate-900">{trv.agenteMatricula}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Empresa do Guincho</span>
                <span className="font-bold text-slate-900 uppercase">
                  {trv.guinchoEmpresa || 'GUINCHO MUNICIPAL SEMUTRAN'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Telefone Guincho</span>
                <span className="font-bold text-slate-900">{trv.guinchoTelefone || '(91) 98455-1234'}</span>
              </div>
            </div>
          </div>

          {/* 08. Anexos Fotográficos */}
          {(trv.foto1 || trv.foto2) && (
            <div className="mb-3">
              <div className="bg-slate-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-sm tracking-wide">
                08. Anexos Fotográficos
              </div>
              <div className="grid grid-cols-2 gap-3 p-2 border border-slate-800 border-t-0 bg-slate-50/50">
                <div className="h-32 border border-slate-300 rounded bg-white flex items-center justify-center overflow-hidden">
                  {trv.foto1 ? (
                    <img src={trv.foto1} alt="Foto 1 do veículo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Foto 1 não anexada</span>
                  )}
                </div>
                <div className="h-32 border border-slate-300 rounded bg-white flex items-center justify-center overflow-hidden">
                  {trv.foto2 ? (
                    <img src={trv.foto2} alt="Foto 2 do veículo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Foto 2 não anexada</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 09. Assinaturas e Amparo Legal */}
          <div className="mt-4 pt-2">
            <div className="p-2 border-2 border-slate-900 bg-slate-100 rounded mb-4">
              <p className="text-[10px] text-justify leading-tight font-bold text-slate-800">
                Veículo removido para depósito fixado pela autoridade competente nos termos do Art. 271 do Código de
                Trânsito Brasileiro (Lei Federal nº 9.503/1997) e resoluções vigentes do CONTRAN.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 px-6 mt-6">
              <div className="text-center">
                <div className="h-14 flex items-end justify-center mb-1">
                  {trv.sigAgente ? (
                    <img src={trv.sigAgente} alt="Assinatura Agente" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">Assinatura Digital Registrada</span>
                  )}
                </div>
                <div className="border-t-2 border-slate-900 pt-1">
                  <p className="text-[10px] font-black uppercase text-slate-900">{trv.agenteNome}</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase">Agente Autuador - Matrícula {trv.agenteMatricula}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="h-14 flex items-end justify-center mb-1">
                  {trv.sigCondutor ? (
                    <img src={trv.sigCondutor} alt="Assinatura Condutor" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">Condutor Recusou / Ausente</span>
                  )}
                </div>
                <div className="border-t-2 border-slate-900 pt-1">
                  <p className="text-[10px] font-black uppercase text-slate-900">
                    {trv.condutorNome || 'Condutor do Veículo'}
                  </p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase">Condutor / Infrator</p>
                </div>
              </div>
            </div>

            {/* Document Verification Footer */}
            <div className="mt-6 pt-3 border-t border-slate-300 text-center text-[9px] text-slate-500 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                Registro Relacional Oficial SEMUTRAN ID #{trv.id}
              </span>
              <span>
                Documento Eletrônico emitido em {new Date().toLocaleString('pt-BR')} via TRV DIGITAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
