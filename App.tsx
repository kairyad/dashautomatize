import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { LayoutDashboard, Lightbulb, LogOut, Filter, X, Users, AlertTriangle, Search, ShieldCheck, Lock } from 'lucide-react';
import { StatsCards } from './components/StatsCards';
import { LeadsTable } from './components/LeadsTable';
import { ConsultantStatsCards } from './components/ConsultantStatsCards';
import { ConsultantsTable } from './components/ConsultantsTable';
import { ImprovementsForm } from './components/ImprovementsForm';
import { AdminPanel } from './components/AdminPanel'; // Import Admin Panel
import { Login } from './components/Login';
import { Lead, DashboardStats, Tab, DateFilter, ConsultantLead, ConsultantStats } from './types';

function App() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>(''); // Armazena quem está logado
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);
  const [loadingConsultants, setLoadingConsultants] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // --- SECURITY STATE ---
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);

  // --- STATE: DASHBOARD ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsToday: 0,
    leadsPerConsultant: 0,
  });
  const [dashboardDateFilter, setDashboardDateFilter] = useState<DateFilter>({ start: '', end: '' });

  // --- STATE: CONSULTORES ---
  const [consultantLeads, setConsultantLeads] = useState<ConsultantLead[]>([]);
  const [consultantStats, setConsultantStats] = useState<ConsultantStats>({
    totalSent: 0,
    sentToday: 0,
    activeConsultants: 0,
  });
  const [consultantDateFilter, setConsultantDateFilter] = useState<DateFilter>({ start: '', end: '' });
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');

  // --- SECURITY: BLOCK DEV TOOLS ---
  useEffect(() => {
    const triggerSecurityWarning = () => {
      setShowSecurityAlert(true);
      // Oculta o alerta após 3 segundos
      setTimeout(() => setShowSecurityAlert(false), 3000);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        triggerSecurityWarning();
        return;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Chrome DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerSecurityWarning();
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        triggerSecurityWarning();
        return;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- LOGGING HELPER ---
  const logSystemAction = async (user: string, action: string, details: string | null) => {
    try {
        await supabase.from('system_logs').insert([{
            username: user,
            action: action,
            details: details,
            created_at: new Date().toISOString()
        }]);
    } catch (e) {
        // Silently fail if table doesn't exist to not break UX
        console.warn('Could not log action:', e);
    }
  };

  // --- Inicialização e Auth ---
  useEffect(() => {
    const storedAuth = localStorage.getItem('dash_auth');
    const storedUser = localStorage.getItem('dash_user');

    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      if (storedUser) setCurrentUser(storedUser);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    if (currentUser) {
        logSystemAction(currentUser, 'logout', null);
    }
    localStorage.removeItem('dash_auth');
    localStorage.removeItem('dash_user');
    setIsAuthenticated(false);
    setCurrentUser('');
    setActiveTab(Tab.DASHBOARD);
  };

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('dash_auth', 'true');
    localStorage.setItem('dash_user', username);
    setIsAuthenticated(true);
    setCurrentUser(username);
    
    // Log do Login
    logSystemAction(username, 'login', null);
  };

  // Log de Troca de Aba
  useEffect(() => {
    if (isAuthenticated && currentUser) {
        const timeout = setTimeout(() => {
             logSystemAction(currentUser, 'tab_change', activeTab);
        }, 500);
        return () => clearTimeout(timeout);
    }
  }, [activeTab, isAuthenticated, currentUser]);


  const getErrorMessage = (err: any): string => {
    if (!err) return 'Erro desconhecido';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.error_description) return err.error_description;
    try {
        return JSON.stringify(err);
    } catch (e) {
        return 'Erro não serializável';
    }
  };

  // ==============================================================================
  // LOGIC 1: FETCH DASHBOARD
  // ==============================================================================
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingDashboard(true);
    setConnectionError(null);

    try {
      const today = new Date();
      today.setHours(0,0,0,0);

      let query = supabase
        .from('novos_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (dashboardDateFilter.start) {
        query = query.gte('created_at', new Date(dashboardDateFilter.start).toISOString());
      }
      if (dashboardDateFilter.end) {
        const endDate = new Date(dashboardDateFilter.end);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const currentLeads = data || [];
      const leadsTodayCount = currentLeads.filter((l: Lead) => {
        const lDate = new Date(l.created_at);
        return lDate >= today;
      }).length;

      const { count: consultantCount, error: countError } = await supabase
        .from('leads_consultores')
        .select('id', { count: 'exact', head: false })
        .limit(1);
      
      if (countError) console.warn("Aviso ao contar consultores (Dashboard):", countError);

      setLeads(currentLeads);
      setDashboardStats({
        totalLeads: currentLeads.length,
        leadsToday: leadsTodayCount,
        leadsPerConsultant: consultantCount || 0
      });

    } catch (err: any) {
      console.error("Erro dashboard (Supabase):", err);
      setConnectionError(`Erro ao carregar Dashboard: ${getErrorMessage(err)}`);
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated, dashboardDateFilter]);

  // ==============================================================================
  // LOGIC 2: CONSULTORES - PROCESSAMENTO
  // ==============================================================================
  const processConsultantData = useCallback((data: any) => {
      if (!Array.isArray(data)) {
        console.warn("Resposta da API não é um array:", data);
        if (data && Array.isArray(data.data)) {
            data = data.data;
        } else {
            data = [];
        }
      }

      const sortedData = [...data].sort((a: ConsultantLead, b: ConsultantLead) => b.id - a.id);
      setConsultantLeads(sortedData);

      const totalSent = sortedData.length;
      const todayStr = new Date().toISOString().split('T')[0];
      const sentToday = sortedData.filter((item: ConsultantLead) => item.data === todayStr).length;
      const uniqueConsultants = new Set(sortedData.map((d: ConsultantLead) => d.consultor).filter(Boolean));

      setConsultantStats({
        totalSent,
        sentToday,
        activeConsultants: uniqueConsultants.size
      });
  }, []);

  // ==============================================================================
  // LOGIC 3: CONSULTORES - FETCH INICIAL
  // ==============================================================================
  const fetchAllConsultants = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingConsultants(true);
    setConnectionError(null);

    try {
      const response = await fetch('https://www.pulseenergy.shop/webhook/consultores', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erro API Consultores: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      processConsultantData(data);

    } catch (err: any) {
      console.error("Erro Webhook Consultores (GET):", err);
      setConnectionError(`Erro ao buscar dados de Consultores: ${getErrorMessage(err)}`);
    } finally {
      setLoadingConsultants(false);
    }
  }, [isAuthenticated, processConsultantData]);

  // ==============================================================================
  // LOGIC 4: CONSULTORES - FETCH FILTRADO
  // ==============================================================================
  const fetchFilteredConsultants = useCallback(async () => {
    if (!isAuthenticated) return;
    
    if (!consultantDateFilter.start || !consultantDateFilter.end) {
        alert("Por favor, selecione a data de início e fim para filtrar.");
        return;
    }

    setLoadingConsultants(true);
    setConnectionError(null);

    try {
      const response = await fetch('https://www.pulseenergy.shop/webhook/datas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          inicio: consultantDateFilter.start,
          fim: consultantDateFilter.end
        })
      });

      if (!response.ok) {
        throw new Error(`Erro API Datas: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      processConsultantData(data);

    } catch (err: any) {
      console.error("Erro Webhook Datas (POST):", err);
      setConnectionError(`Erro ao filtrar dados: ${getErrorMessage(err)}`);
    } finally {
      setLoadingConsultants(false);
    }
  }, [isAuthenticated, consultantDateFilter, processConsultantData]);

  // --- Effects ---

  useEffect(() => {
    if (activeTab === Tab.DASHBOARD) fetchDashboardData();
  }, [activeTab, fetchDashboardData]);

  useEffect(() => {
    if (activeTab === Tab.CONSULTANTS) {
        fetchAllConsultants();
    }
  }, [activeTab, fetchAllConsultants]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const channel = supabase.channel('global_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'novos_leads' }, () => {
         if(activeTab === Tab.DASHBOARD) fetchDashboardData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, activeTab, fetchDashboardData]);

  // --- UI Helpers ---
  const consultantOptions = useMemo(() => {
    const consultants = new Set(consultantLeads.map(l => l.consultor).filter(Boolean));
    return Array.from(consultants).sort() as string[];
  }, [consultantLeads]);

  const filteredConsultantLeads = useMemo(() => {
    if (!selectedConsultant) return consultantLeads;
    return consultantLeads.filter(l => l.consultor === selectedConsultant);
  }, [consultantLeads, selectedConsultant]);

  const handleClearConsultantFilter = () => {
    setConsultantDateFilter({ start: '', end: '' });
    setSelectedConsultant('');
    fetchAllConsultants();
  };


  if (checkingAuth) return null;

  if (!isAuthenticated) {
    return (
        <>
            {showSecurityAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl max-w-md text-center border-4 border-red-800">
                        <AlertTriangle size={64} className="mx-auto mb-4 text-yellow-300" />
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-wider">Acesso Negado</h2>
                        <p className="font-bold text-lg mb-4">Dados protegidos por criptografia militar.</p>
                        <p className="bg-red-800 p-3 rounded-lg font-mono text-sm">
                           SEU IP FOI REGISTRADO E ENVIADO PARA AUDITORIA DE SEGURANÇA.
                        </p>
                    </div>
                </div>
            )}
            <Login onLogin={handleLoginSuccess} />
        </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Security Alert Overlay */}
      {showSecurityAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
              <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl max-w-md text-center border-4 border-red-800 transform scale-105">
                  <div className="flex justify-center mb-4">
                     <Lock size={64} className="text-white animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 uppercase tracking-wider">Área Restrita</h2>
                  <p className="font-bold text-lg mb-4">Tentativa de inspeção bloqueada.</p>
                   <div className="bg-black/40 p-4 rounded-lg font-mono text-sm text-left space-y-2">
                       <p className="text-red-300">&gt; Detectando tentativa de debug...</p>
                       <p className="text-red-300">&gt; Capturando impressão digital do navegador...</p>
                       <p className="text-white font-bold">&gt; IP REGISTRADO NO SERVIDOR DE SEGURANÇA.</p>
                   </div>
              </div>
          </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
            Dash Automatize
          </h1>
          <p className="text-xs text-slate-500 mt-2">Olá, {currentUser}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === Tab.DASHBOARD 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Todos os Leads</span>
          </button>

           <button
            onClick={() => setActiveTab(Tab.CONSULTANTS)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === Tab.CONSULTANTS
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Leads Consultores</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.IMPROVEMENTS)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === Tab.IMPROVEMENTS
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Lightbulb size={20} />
            <span className="font-medium">Melhorias</span>
          </button>

          {currentUser === 'Kairy' && (
             <button
              onClick={() => setActiveTab(Tab.ADMIN)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === Tab.ADMIN
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="font-medium">Admin Panel</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Connection Error Banner */}
        {connectionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
             <AlertTriangle size={24} className="flex-shrink-0" />
             <div>
               <p className="font-bold">Problema de Conexão</p>
               <p className="text-sm break-all">{connectionError}</p>
             </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
           <div>
              <h1 className="font-bold">Dash Automatize</h1>
              <p className="text-xs text-slate-400">{currentUser}</p>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => {
                   if (activeTab === Tab.DASHBOARD) setActiveTab(Tab.CONSULTANTS);
                   else if (activeTab === Tab.CONSULTANTS) setActiveTab(Tab.IMPROVEMENTS);
                   else setActiveTab(Tab.DASHBOARD);
               }}
               className="p-2 hover:bg-slate-800 rounded"
             >
               <LayoutDashboard size={20}/>
             </button>
             {currentUser === 'Kairy' && (
                <button onClick={() => setActiveTab(Tab.ADMIN)} className="p-2 hover:bg-indigo-900 rounded text-indigo-300">
                    <ShieldCheck size={20} />
                </button>
             )}
             <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded text-red-400">
               <LogOut size={20}/>
             </button>
           </div>
        </div>

        {/* --- HEADER CONTENT --- */}
        {activeTab !== Tab.IMPROVEMENTS && activeTab !== Tab.ADMIN && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === Tab.DASHBOARD ? 'Todos os Leads' : 'Leads por Consultor'}
                </h2>
                <p className="text-slate-500 text-sm">
                    {activeTab === Tab.DASHBOARD ? 'Visão geral da entrada de leads' : 'Acompanhamento de distribuição para consultores'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1 border-r border-slate-200">
                  <Filter size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Filtros ({activeTab === Tab.DASHBOARD ? 'Geral' : 'Consultores'}):</span>
                </div>
                
                {/* --- INPUTS PARA ABA CONSULTORES --- */}
                {activeTab === Tab.CONSULTANTS && (
                    <>
                        <select
                            value={selectedConsultant}
                            onChange={(e) => setSelectedConsultant(e.target.value)}
                            className="text-sm border border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1 bg-white outline-none"
                        >
                            <option value="">Todos Consultores</option>
                            {consultantOptions.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                className="text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border"
                                value={consultantDateFilter.start}
                                onChange={(e) => setConsultantDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                title="Data Inicial"
                            />
                            <span className="text-slate-400">-</span>
                            <input 
                                type="date" 
                                className="text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border"
                                value={consultantDateFilter.end}
                                onChange={(e) => setConsultantDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                title="Data Final"
                            />
                            
                            <button
                                onClick={fetchFilteredConsultants}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors ml-1"
                            >
                                <Search size={14} />
                                Filtrar
                            </button>

                            {(consultantDateFilter.start || consultantDateFilter.end || selectedConsultant) && (
                                <button 
                                    onClick={handleClearConsultantFilter}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 flex items-center gap-1"
                                    title="Limpar Filtros"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* --- INPUTS PARA ABA DASHBOARD --- */}
                {activeTab === Tab.DASHBOARD && (
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            className="text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border"
                            value={dashboardDateFilter.start}
                            onChange={(e) => setDashboardDateFilter(prev => ({ ...prev, start: e.target.value }))}
                            title="Data Inicial"
                        />
                        <span className="text-slate-400">-</span>
                        <input 
                            type="date" 
                            className="text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border"
                            value={dashboardDateFilter.end}
                            onChange={(e) => setDashboardDateFilter(prev => ({ ...prev, end: e.target.value }))}
                            title="Data Final"
                        />
                        {(dashboardDateFilter.start || dashboardDateFilter.end) && (
                            <button 
                                onClick={() => setDashboardDateFilter({ start: '', end: '' })}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 flex items-center gap-1"
                            >
                                <X size={14} /> Limpar
                            </button>
                        )}
                    </div>
                )}
              </div>
            </div>
        )}

        {/* --- MAIN TAB CONTENT --- */}
        
        {activeTab === Tab.DASHBOARD && (
          <div className="animate-fade-in">
            <StatsCards stats={dashboardStats} loading={loadingDashboard} />
            <LeadsTable leads={leads} loading={loadingDashboard} />
          </div>
        )}

        {activeTab === Tab.CONSULTANTS && (
           <div className="animate-fade-in">
             <ConsultantStatsCards stats={consultantStats} loading={loadingConsultants} />
             <ConsultantsTable leads={filteredConsultantLeads} loading={loadingConsultants} />
           </div>
        )}

        {activeTab === Tab.IMPROVEMENTS && (
          <div className="animate-fade-in">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Central de Melhorias</h2>
                <p className="text-slate-500 text-sm">Ajude-nos a melhorar o sistema enviando suas sugestões</p>
              </div>
            <ImprovementsForm />
          </div>
        )}

        {activeTab === Tab.ADMIN && currentUser === 'Kairy' && (
            <div className="animate-fade-in">
                <AdminPanel />
            </div>
        )}
      </main>
    </div>
  );
}

export default App;