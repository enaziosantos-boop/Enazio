import React, { useState, useEffect } from 'react';
import {
  TRV,
  RetentionYard,
  InfractionType,
  TowingCompany,
  ComplexAnalytics,
} from './types/trv.ts';
import { DashboardView } from './components/DashboardView.tsx';
import { NewTRVForm } from './components/NewTRVForm.tsx';
import { QueryWorkbench } from './components/QueryWorkbench.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { TRVPrintModal } from './components/TRVPrintModal.tsx';
import { LiberateModal } from './components/LiberateModal.tsx';
import { MonthlyReportModal } from './components/MonthlyReportModal.tsx';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  History,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Database,
  Radio,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'novo' | 'consultas' | 'historico'>('dashboard');

  // Application Data State
  const [trvs, setTrvs] = useState<TRV[]>([]);
  const [yards, setYards] = useState<RetentionYard[]>([]);
  const [infractions, setInfractions] = useState<InfractionType[]>([]);
  const [towingCompanies, setTowingCompanies] = useState<TowingCompany[]>([]);
  const [analytics, setAnalytics] = useState<ComplexAnalytics | null>(null);

  // Modals State
  const [selectedTrvForPrint, setSelectedTrvForPrint] = useState<TRV | null>(null);
  const [liberateTargetTrv, setLiberateTargetTrv] = useState<TRV | null>(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [liveToast, setLiveToast] = useState<{ message: string; type: 'create' | 'liberate' } | null>(null);

  // Fetch Auxiliary Tables
  const fetchAuxiliary = async () => {
    try {
      const res = await fetch('/api/auxiliary');
      if (res.ok) {
        const data = await res.json();
        setYards(data.yards || []);
        setInfractions(data.infractions || []);
        setTowingCompanies(data.companies || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados auxiliares:', err);
    }
  };

  // Fetch TRVs and Analytics
  const loadData = async () => {
    try {
      const [trvsRes, analyticsRes] = await Promise.all([
        fetch('/api/trvs?limit=100'),
        fetch('/api/analytics/realtime'),
      ]);

      if (trvsRes.ok) {
        const trvsData = await trvsRes.json();
        setTrvs(trvsData.data || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Erro ao sincronizar dados:', err);
    }
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Initial Load
  useEffect(() => {
    fetchAuxiliary();
    loadData();
  }, []);

  // Real-Time Server-Sent Events (SSE) Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.addEventListener('trv_created', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setLiveToast({
        message: `Novo TRV Nº ${data.trvNo} registrado (Placa: ${data.placa}) no pátio ${data.parque}`,
        type: 'create',
      });
      loadData();
      setTimeout(() => setLiveToast(null), 5000);
    });

    eventSource.addEventListener('trv_liberated', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setLiveToast({
        message: `Veículo placa ${data.placa} liberado do pátio (TRV ${data.trvNo})`,
        type: 'liberate',
      });
      loadData();
      setTimeout(() => setLiveToast(null), 5000);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Falha no login com Google:', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Falha no logout:', err);
    }
  };

  // Callback when a new TRV is saved
  const handleSavedTrv = (newTrv: TRV, shouldPrint: boolean) => {
    setTrvs((prev) => [newTrv, ...prev]);
    loadData();
    if (shouldPrint) {
      setSelectedTrvForPrint(newTrv);
    } else {
      setActiveTab('historico');
    }
  };

  // Callback when a vehicle is liberated
  const handleLiberatedSuccess = (updatedTrv: TRV) => {
    setTrvs((prev) => prev.map((t) => (t.trvNo === updatedTrv.trvNo ? updatedTrv : t)));
    setLiberateTargetTrv(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Real-Time Toast Notification */}
      {liveToast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
              liveToast.type === 'create'
                ? 'bg-blue-900 text-white border-blue-700 shadow-blue-900/30'
                : 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>{liveToast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Bras_o_de_Paragominas_-_PA.svg_d09b2f68.png"
                alt="Brasão de Paragominas"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400 uppercase">
                    SEMUTRAN PARAGOMINAS
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800/40">
                    <Database className="w-2.5 h-2.5 text-emerald-400" />
                    Cloud SQL
                  </span>
                </div>
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  TRV DIGITAL
                  <span className="text-slate-400 text-xs font-normal hidden md:inline">
                    • Sistema Relacional em Tempo Real
                  </span>
                </h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel Geral
              </button>

              <button
                onClick={() => setActiveTab('novo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'novo'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                Novo TRV
              </button>

              <button
                onClick={() => setActiveTab('consultas')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'consultas'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                Consultas Complexas
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'historico'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                Histórico & Pátio
              </button>
            </nav>

            {/* Right Actions: Report & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowMonthlyReport(true)}
                className="hidden sm:flex px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold items-center gap-1.5 border border-slate-800 transition cursor-pointer"
                title="Gerar Relatório Mensal"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                Relatório
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Usuário'}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                      {currentUser.displayName ? currentUser.displayName[0] : 'A'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <span className="text-[11px] font-bold text-white block leading-tight truncate max-w-[120px]">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-semibold block">Agente Conectado</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Entrar
                </button>
              )}
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Painel Geral
            </button>
            <button
              onClick={() => setActiveTab('novo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'novo' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Novo TRV
            </button>
            <button
              onClick={() => setActiveTab('consultas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'consultas' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Consultas Complexas
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'historico' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Histórico & Pátio
            </button>
            <button
              onClick={() => setShowMonthlyReport(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-amber-400"
            >
              Relatório
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            recentTrvs={trvs}
            onNavigateTab={setActiveTab}
            onSelectTrv={setSelectedTrvForPrint}
            onOpenReport={() => setShowMonthlyReport(true)}
          />
        )}

        {activeTab === 'novo' && (
          <NewTRVForm
            yards={yards}
            infractions={infractions}
            towingCompanies={towingCompanies}
            onSaved={handleSavedTrv}
          />
        )}

        {activeTab === 'consultas' && (
          <QueryWorkbench
            yards={yards}
            infractions={infractions}
            onSelectTrv={setSelectedTrvForPrint}
            onOpenLiberate={setLiberateTargetTrv}
          />
        )}

        {activeTab === 'historico' && (
          <HistoryView
            trvs={trvs}
            onSelectTrv={setSelectedTrvForPrint}
            onOpenLiberate={setLiberateTargetTrv}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SEMUTRAN Paragominas • TRV Digital v2.0 (PostgreSQL Cloud SQL)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Base Relacional Drizzle ORM</span>
            <span>•</span>
            <span>Art. 271 do Código de Trânsito Brasileiro</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedTrvForPrint && (
        <TRVPrintModal
          trv={selectedTrvForPrint}
          onClose={() => setSelectedTrvForPrint(null)}
        />
      )}

      {liberateTargetTrv && (
        <LiberateModal
          trv={liberateTargetTrv}
          onClose={() => setLiberateTargetTrv(null)}
          onSuccess={handleLiberatedSuccess}
        />
      )}

      {showMonthlyReport && (
        <MonthlyReportModal
          onClose={() => setShowMonthlyReport(false)}
        />
      )}
    </div>
  );
}
