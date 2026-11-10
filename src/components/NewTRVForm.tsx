import React, { useState, useEffect } from 'react';
import { RetentionYard, InfractionType, TowingCompany, TRV } from '../types/trv.ts';
import { SignatureCanvas } from './SignatureCanvas.tsx';
import {
  FileText,
  AlertTriangle,
  Car,
  User,
  MapPin,
  Building,
  Shield,
  Truck,
  Camera,
  Save,
  Printer,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  UploadCloud,
  Loader2,
} from 'lucide-react';

interface NewTRVFormProps {
  yards: RetentionYard[];
  infractions: InfractionType[];
  towingCompanies: TowingCompany[];
  onSaved: (savedTrv: TRV, shouldPrint: boolean) => void;
}

export const NewTRVForm: React.FC<NewTRVFormProps> = ({
  yards,
  infractions,
  towingCompanies,
  onSaved,
}) => {
  // Generate unique TRV Number (YYYYMMDDHHMMSS)
  const generateTrvNo = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  const getLocalDate = () => new Date().toISOString().split('T')[0];
  const getLocalTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const [trvNo, setTrvNo] = useState(generateTrvNo());
  const [dataHoraRegistro, setDataHoraRegistro] = useState(new Date().toISOString());

  // Form State
  const [aitNo, setAitNo] = useState('');
  const [codInfracao, setCodInfracao] = useState('');
  const [amparoLegal, setAmparoLegal] = useState('');

  const [veiculoPlaca, setVeiculoPlaca] = useState('');
  const [veiculoUf, setVeiculoUf] = useState('PA');
  const [veiculoRenavam, setVeiculoRenavam] = useState('');
  const [veiculoChassi, setVeiculoChassi] = useState('');
  const [veiculoMarca, setVeiculoMarca] = useState('');
  const [veiculoModelo, setVeiculoModelo] = useState('');
  const [veiculoCor, setVeiculoCor] = useState('');
  const [veiculoTipo, setVeiculoTipo] = useState('MOTOCICLETA');
  const [veiculoProprietario, setVeiculoProprietario] = useState('');

  const [condutorNome, setCondutorNome] = useState('');
  const [condutorCpf, setCondutorCpf] = useState('');
  const [condutorCnh, setCondutorCnh] = useState('');

  const [localLogradouro, setLocalLogradouro] = useState('');
  const [localBairro, setLocalBairro] = useState('CENTRO');

  const [parqueRetencao, setParqueRetencao] = useState(yards[0]?.nome || 'SEDE SEMUTRAN');
  const [parqueEndereco, setParqueEndereco] = useState(
    yards[0]?.endereco || 'RUA DO IPÊ, S/N - BAIRRO ALTO DO VALE, PARAGOMINAS - PA'
  );
  const [dataInfracao, setDataInfracao] = useState(getLocalDate());
  const [horaInfracao, setHoraInfracao] = useState(getLocalTime());
  const [remocaoObservacao, setRemocaoObservacao] = useState('');

  const [agenteNome, setAgenteNome] = useState('CARLOS EDUARDO LIMA');
  const [agenteMatricula, setAgenteMatricula] = useState('1042');
  const [sigAgente, setSigAgente] = useState<string | null>(
    localStorage.getItem('trv_sig_agente_saved') || null
  );

  const [guinchoEmpresa, setGuinchoEmpresa] = useState('GUINCHO MUNICIPAL SEMUTRAN');
  const [guinchoTelefone, setGuinchoTelefone] = useState('(91) 98455-1234');
  const [sigCondutor, setSigCondutor] = useState<string | null>(null);

  const [foto1, setFoto1] = useState<string | null>(null);
  const [foto2, setFoto2] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion active sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    geral: true,
    infracao: true,
    veiculo: true,
    condutor: true,
    local: true,
    remocao: true,
    agente: true,
    guincho: true,
    anexos: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (yards.length > 0 && (!parqueRetencao || parqueRetencao === 'SEDE SEMUTRAN')) {
      const match = yards.find((y) => y.nome === parqueRetencao) || yards[0];
      setParqueRetencao(match.nome);
      setParqueEndereco(match.endereco);
    }
  }, [yards]);

  // Handler for Infraction selection
  const handleInfractionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCodInfracao(code);
    const found = infractions.find((inf) => inf.codigo === code);
    if (found) {
      setAmparoLegal(`${found.amparoLegal} - ${found.descricao}`);
    }
  };

  // Handler for Retention Yard selection
  const handleYardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setParqueRetencao(name);
    const found = yards.find((y) => y.nome === name);
    if (found) {
      setParqueEndereco(found.endereco);
    }
  };

  // Formatter for CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCondutorCpf(val);
  };

  // Formatter for Phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = val.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/(\d{2})(\d+)/, '($1) $2');
    }
    setGuinchoTelefone(val);
  };

  // Image Upload Handler
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (confirm('Deseja realmente limpar todo o formulário?')) {
      setTrvNo(generateTrvNo());
      setDataHoraRegistro(new Date().toISOString());
      setAitNo('');
      setCodInfracao('');
      setAmparoLegal('');
      setVeiculoPlaca('');
      setVeiculoRenavam('');
      setVeiculoChassi('');
      setVeiculoMarca('');
      setVeiculoModelo('');
      setVeiculoCor('');
      setVeiculoProprietario('');
      setCondutorNome('');
      setCondutorCpf('');
      setCondutorCnh('');
      setLocalLogradouro('');
      setRemocaoObservacao('');
      setSigCondutor(null);
      setFoto1(null);
      setFoto2(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    setError(null);

    if (!veiculoPlaca.trim()) {
      setError('A placa do veículo é obrigatória.');
      return;
    }

    if (!agenteMatricula.trim()) {
      setError('A matrícula do agente autuador é obrigatória.');
      return;
    }

    // Persist agent signature for convenience in subsequent TRVs
    if (sigAgente) {
      localStorage.setItem('trv_sig_agente_saved', sigAgente);
    }

    setLoading(true);

    const payload = {
      trv_no: trvNo,
      data_hora_registro: dataHoraRegistro,
      ait_no: aitNo,
      cod_infracao: codInfracao,
      amparo_legal: amparoLegal,
      veiculo_placa: veiculoPlaca.toUpperCase().trim(),
      veiculo_uf: veiculoUf.toUpperCase(),
      veiculo_renavam: veiculoRenavam,
      veiculo_chassi: veiculoChassi,
      veiculo_marca: veiculoMarca,
      veiculo_modelo: veiculoModelo,
      veiculo_cor: veiculoCor,
      veiculo_tipo: veiculoTipo,
      veiculo_proprietario: veiculoProprietario,
      condutor_nome: condutorNome,
      condutor_cpf: condutorCpf,
      condutor_cnh: condutorCnh,
      local_logradouro: localLogradouro,
      local_bairro: localBairro,
      parque_retencao: parqueRetencao,
      parque_endereco: parqueEndereco,
      data_infracao: dataInfracao,
      hora_infracao: horaInfracao,
      remocao_observacao: remocaoObservacao,
      agente_nome: agenteNome,
      agente_matricula: agenteMatricula,
      sig_agente: sigAgente,
      guincho_empresa: guinchoEmpresa,
      guincho_telefone: guinchoTelefone,
      sig_condutor: sigCondutor,
      foto1,
      foto2,
    };

    try {
      const res = await fetch('/api/trvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao salvar TRV no banco de dados.');
      }

      const savedTrv = await res.json();
      onSaved(savedTrv, shouldPrint);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar TRV no banco de dados relacional.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Bras_o_de_Paragominas_-_PA.svg_d09b2f68.png"
            alt="Brasão de Paragominas"
            className="w-11 h-11 object-contain shrink-0"
          />
          <div>
            <span className="text-[10px] font-extrabold text-blue-900 tracking-wider uppercase">
              SEMUTRAN Paragominas
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Lavratura do TRV Digital
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Printer className="w-4 h-4 text-yellow-400" />
            Salvar e Imprimir
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-600/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando no Banco...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar TRV Digital
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* 1. VISÃO GERAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('geral')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700" />
            1. Visão Geral do Documento
          </span>
          {openSections.geral ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.geral && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Número do TRV
              </label>
              <input
                type="text"
                value={trvNo}
                onChange={(e) => setTrvNo(e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50 p-3 rounded-xl font-mono font-black text-sm text-blue-950 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Data / Hora do Registro
              </label>
              <input
                type="text"
                value={new Date(dataHoraRegistro).toLocaleString('pt-BR')}
                readOnly
                className="w-full border-2 border-slate-200 bg-slate-100 p-3 rounded-xl font-bold text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. INFRAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('infracao')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            2. Infração de Trânsito (CTB)
          </span>
          {openSections.infracao ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.infracao && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Número do AIT
              </label>
              <input
                type="text"
                value={aitNo}
                onChange={(e) => setAitNo(e.target.value.toUpperCase())}
                placeholder="Ex: AIT-992105"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Código da Infração (Catálogo CTB)
              </label>
              <select
                value={codInfracao}
                onChange={handleInfractionChange}
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="">Selecione ou digite a infração</option>
                {infractions.map((inf) => (
                  <option key={inf.id} value={inf.codigo}>
                    {inf.codigo} - {inf.descricao.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Amparo Legal do CTB
              </label>
              <textarea
                value={amparoLegal}
                onChange={(e) => setAmparoLegal(e.target.value)}
                placeholder="Ex: Art. 230, V do CTB - Conduzir o veículo registrado que não esteja devidamente licenciado"
                rows={2}
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-medium text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. VEÍCULO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('veiculo')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-700" />
            3. Dados do Veículo
          </span>
          {openSections.veiculo ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.veiculo && (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Placa *
              </label>
              <input
                type="text"
                value={veiculoPlaca}
                onChange={(e) => setVeiculoPlaca(e.target.value.toUpperCase())}
                placeholder="Ex: OBT-4521"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-mono font-black text-base focus:border-blue-600 focus:outline-none uppercase"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                UF
              </label>
              <input
                type="text"
                value={veiculoUf}
                onChange={(e) => setVeiculoUf(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="PA"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase text-center"
              />
            </div>

            <div className="col-span-2 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Tipo de Veículo
              </label>
              <select
                value={veiculoTipo}
                onChange={(e) => setVeiculoTipo(e.target.value)}
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase cursor-pointer"
              >
                <option value="MOTOCICLETA">MOTOCICLETA / MOTONETA</option>
                <option value="AUTOMÓVEL">AUTOMÓVEL</option>
                <option value="CAMINHONETE">CAMINHONETE / UTILITÁRIO</option>
                <option value="CAMINHÃO">CAMINHÃO / CARRETA</option>
                <option value="MICROÔNIBUS">MICRO-ÔNIBUS / ÔNIBUS</option>
                <option value="OUTRO">OUTRO VEÍCULO</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Marca / Modelo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={veiculoMarca}
                  onChange={(e) => setVeiculoMarca(e.target.value.toUpperCase())}
                  placeholder="Marca (HONDA)"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
                />
                <input
                  type="text"
                  value={veiculoModelo}
                  onChange={(e) => setVeiculoModelo(e.target.value.toUpperCase())}
                  placeholder="Modelo (CG 160)"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Cor
              </label>
              <input
                type="text"
                value={veiculoCor}
                onChange={(e) => setVeiculoCor(e.target.value.toUpperCase())}
                placeholder="Ex: PRETA"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div className="col-span-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                RENAVAM
              </label>
              <input
                type="text"
                value={veiculoRenavam}
                onChange={(e) => setVeiculoRenavam(e.target.value)}
                placeholder="00000000000"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-mono font-bold text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Chassi
              </label>
              <input
                type="text"
                value={veiculoChassi}
                onChange={(e) => setVeiculoChassi(e.target.value.toUpperCase())}
                placeholder="Número do Chassi"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-mono font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div className="col-span-2 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Proprietário do Veículo
              </label>
              <input
                type="text"
                value={veiculoProprietario}
                onChange={(e) => setVeiculoProprietario(e.target.value.toUpperCase())}
                placeholder="Nome do Proprietário Registrado"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. CONDUTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('condutor')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            4. Dados do Condutor no Momento da Abordagem
          </span>
          {openSections.condutor ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.condutor && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Nome do Condutor
              </label>
              <input
                type="text"
                value={condutorNome}
                onChange={(e) => setCondutorNome(e.target.value.toUpperCase())}
                placeholder="Nome Completo do Condutor"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                CPF
              </label>
              <input
                type="text"
                value={condutorCpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-mono font-bold text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                CNH / PPD
              </label>
              <input
                type="text"
                value={condutorCnh}
                onChange={(e) => setCondutorCnh(e.target.value.toUpperCase())}
                placeholder="Nº da CNH ou 'NÃO POSSUI'"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. LOCAL DA INFRAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('local')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            5. Local da Ocorrência
          </span>
          {openSections.local ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.local && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Logradouro (Rua, Av, Rodovia)
              </label>
              <input
                type="text"
                value={localLogradouro}
                onChange={(e) => setLocalLogradouro(e.target.value.toUpperCase())}
                placeholder="Ex: Av. Presidente Vargas, próx. ao nº 500"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Bairro / Município
              </label>
              <input
                type="text"
                value={localBairro}
                onChange={(e) => setLocalBairro(e.target.value.toUpperCase())}
                placeholder="Ex: CENTRO, PARAGOMINAS - PA"
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. DADOS DA REMOÇÃO E PÁTIO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('remocao')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" />
            6. Dados da Remoção e Parque de Retenção
          </span>
          {openSections.remocao ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.remocao && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Parque de Retenção Destino
                </label>
                <select
                  value={parqueRetencao}
                  onChange={handleYardChange}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none cursor-pointer"
                >
                  {yards.map((y) => (
                    <option key={y.id} value={y.nome}>
                      {y.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Endereço do Parque
                </label>
                <input
                  type="text"
                  value={parqueEndereco}
                  onChange={(e) => setParqueEndereco(e.target.value)}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-xs bg-slate-50 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Data da Remoção
                </label>
                <input
                  type="date"
                  value={dataInfracao}
                  onChange={(e) => setDataInfracao(e.target.value)}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Hora da Remoção
                </label>
                <input
                  type="time"
                  value={horaInfracao}
                  onChange={(e) => setHoraInfracao(e.target.value)}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Observações Gerais (Estado do veículo, pertences no interior, avarias prévias)
              </label>
              <textarea
                value={remocaoObservacao}
                onChange={(e) => setRemocaoObservacao(e.target.value)}
                placeholder="Ex: Veículo com para-lama dianteiro arranhado, retrovisor esquerdo avariado. Sem pertences visíveis."
                rows={3}
                className="w-full border-2 border-slate-200 p-3 rounded-xl font-medium text-xs focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. AGENTE AUTUADOR & ASSINATURA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('agente')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-900" />
            7. Agente Autuador da SEMUTRAN
          </span>
          {openSections.agente ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.agente && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Nome do Agente
                </label>
                <input
                  type="text"
                  value={agenteNome}
                  onChange={(e) => setAgenteNome(e.target.value.toUpperCase())}
                  placeholder="Nome do Agente Autuador"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Matrícula do Agente *
                </label>
                <input
                  type="text"
                  value={agenteMatricula}
                  onChange={(e) => setAgenteMatricula(e.target.value)}
                  placeholder="Ex: 1042"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <SignatureCanvas
                label="Assinatura Digital do Agente Autuador"
                initialValue={sigAgente}
                onChange={setSigAgente}
                height={130}
              />
            </div>
          </div>
        )}
      </div>

      {/* 8. GUINCHO & CONDUTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('guincho')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-700" />
            8. Transporte (Guincho) e Assinatura do Condutor
          </span>
          {openSections.guincho ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.guincho && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Empresa do Guincho
                </label>
                <input
                  type="text"
                  value={guinchoEmpresa}
                  onChange={(e) => setGuinchoEmpresa(e.target.value.toUpperCase())}
                  placeholder="GUINCHO MUNICIPAL SEMUTRAN"
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Telefone de Contato do Guincho
                </label>
                <input
                  type="text"
                  value={guinchoTelefone}
                  onChange={handlePhoneChange}
                  placeholder="(91) 98455-1234"
                  maxLength={15}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <SignatureCanvas
                label="Assinatura do Condutor (ou Recusa)"
                initialValue={sigCondutor}
                onChange={setSigCondutor}
                height={130}
              />
            </div>
          </div>
        )}
      </div>

      {/* 9. ANEXOS FOTOGRÁFICOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('anexos')}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-700" />
            9. Anexos Fotográficos do Veículo
          </span>
          {openSections.anexos ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.anexos && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Foto 1 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">
                Foto 1 (Frente / Placa)
              </span>
              {foto1 ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-100 h-48 flex items-center justify-center">
                  <img src={foto1} alt="Foto 1" className="h-full w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setFoto1(null)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition cursor-pointer"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition h-48 text-center">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Clique para anexar Foto 1</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG até 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setFoto1)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Foto 2 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">
                Foto 2 (Traseira / Lateral)
              </span>
              {foto2 ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-100 h-48 flex items-center justify-center">
                  <img src={foto2} alt="Foto 2" className="h-full w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setFoto2(null)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition cursor-pointer"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition h-48 text-center">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Clique para anexar Foto 2</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG até 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setFoto2)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
          className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4 text-yellow-400" />
          Salvar e Gerar Termo Oficial
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xl shadow-blue-600/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Persistindo no Cloud SQL...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirmar e Salvar TRV
            </>
          )}
        </button>
      </div>
    </form>
  );
};
