import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { LayoutDashboard, Lightbulb, LogOut, Filter, X, Users, AlertTriangle, Search, ShieldCheck, Lock, Zap } from 'lucide-react';
import { StatsCards } from './components/StatsCards';
import { LeadsTable } from './components/LeadsTable';
import { ConsultantStatsCards } from './components/ConsultantStatsCards';
import { ConsultantsTable } from './components/ConsultantsTable';
import { ImprovementsForm } from './components/ImprovementsForm';
import { AdminPanel } from './components/AdminPanel'; 
import { Login } from './components/Login';
import { Lead, DashboardStats, Tab, DateFilter, ConsultantLead, ConsultantStats } from './types';

function App() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>(''); 
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  // --- Route State ---
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);

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

  // --- CHECK ROUTE ---
  useEffect(() => {
    // Check if the current path is /adminatm
    const path = window.location.pathname;
    if (path === '/adminatm' || path === '/adminatm/') {
        setIsAdminRoute(true);
    } else {
        setIsAdminRoute(false);
    }
  }, []);

  // --- SECURITY: BLOCK DEV TOOLS ---
  useEffect(() => {
    const triggerSecurityWarning = () => {
      setShowSecurityAlert(true);
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

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerSecurityWarning();
        return;
      }

      // Ctrl+U
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
        console.warn('Could not log action:', e);
    }
  };

  // --- Inicialização e Auth ---
  useEffect(() => {
    const storedAuth = localStorage.getItem('dash_auth');
    const storedUser = localStorage.getItem('dash_user');

    if (storedAuth === 'true' && storedUser) {
      // Se for rota admin, só restaura sessão se for o Admin
      if (isAdminRoute) {
          if (storedUser === 'Kairy') {
              setIsAuthenticated(true);
              setCurrentUser(storedUser);
              setActiveTab(Tab.ADMIN); // Force admin tab on reload in admin route
          } else {
              // Se tiver logado como user normal mas acessou rota admin, logout
              localStorage.removeItem('dash_auth');
              localStorage.removeItem('dash_user');
          }
      } else {
          // Rota normal
          if (storedUser === 'Kairy') {
             // Admin não deve estar na rota normal (opcional, mas bom pra segregar)
             localStorage.removeItem('dash_auth');
             localStorage.removeItem('dash_user');
          } else {
              setIsAuthenticated(true);
              setCurrentUser(storedUser);
          }
      }
    }
    setCheckingAuth(false);
  }, [isAdminRoute]);

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
    
    // Se for admin logando, joga direto pra tab Admin
    if (username === 'Kairy') {
        setActiveTab(Tab.ADMIN);
    } else {
        setActiveTab(Tab.DASHBOARD);
    }
    
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
  // DATA FETCHING LOGIC (DASHBOARD & CONSULTANTS)
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

      const { count: consultantCount } = await supabase
        .from('leads_consultores')
        .select('id', { count: 'exact', head: false })
        .limit(1);

      setLeads(currentLeads);
      setDashboardStats({
        totalLeads: currentLeads.length,
        leadsToday: leadsTodayCount,
        leadsPerConsultant: consultantCount || 0
      });

    } catch (err: any) {
      console.error("Erro dashboard:", err);
      setConnectionError(`Erro ao carregar Dashboard: ${getErrorMessage(err)}`);
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated, dashboardDateFilter]);

  const processConsultantData = useCallback((data: any) => {
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) data = data.data;
        else data = [];
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

  const fetchAllConsultants = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingConsultants(true);
    setConnectionError(null);

    try {
      const response = await fetch('https://www.pulseenergy.shop/webhook/consultores', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Erro API Consultores: ${response.status}`);
      const data = await response.json();
      processConsultantData(data);

    } catch (err: any) {
      console.error("Erro Webhook Consultores:", err);
      setConnectionError(`Erro ao buscar dados: ${getErrorMessage(err)}`);
    } finally {
      setLoadingConsultants(false);
    }
  }, [isAuthenticated, processConsultantData]);

  const fetchFilteredConsultants = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!consultantDateFilter.start || !consultantDateFilter.end) {
        alert("Selecione as datas.");
        return;
    }
    setLoadingConsultants(true);
    setConnectionError(null);

    try {
      const response = await fetch('https://www.pulseenergy.shop/webhook/datas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ inicio: consultantDateFilter.start, fim: consultantDateFilter.end })
      });

      if (!response.ok) throw new Error(`Erro API Datas: ${response.status}`);
      const data = await response.json();
      processConsultantData(data);

    } catch (err: any) {
      console.error("Erro Webhook Datas:", err);
      setConnectionError(`Erro ao filtrar: ${getErrorMessage(err)}`);
    } finally {
      setLoadingConsultants(false);
    }
  }, [isAuthenticated, consultantDateFilter, processConsultantData]);

  // --- Effects ---
  useEffect(() => {
    if (activeTab === Tab.DASHBOARD && isAuthenticated) fetchDashboardData();
  }, [activeTab, fetchDashboardData, isAuthenticated]);

  useEffect(() => {
    if (activeTab === Tab.CONSULTANTS && isAuthenticated) fetchAllConsultants();
  }, [activeTab, fetchAllConsultants, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const channel = supabase.channel('global_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'novos_leads' }, () => {
         if(activeTab === Tab.DASHBOARD) fetchDashboardData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, activeTab, fetchDashboardData]);

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
                        <p className="bg-red-800 p-3 rounded-lg font-mono text-sm mt-4">IP REGISTRADO PARA AUDITORIA.</p>
                    </div>
                </div>
            )}
            <Login onLogin={handleLoginSuccess} isAdminRoute={isAdminRoute} />
        </>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Sidebar - Desktop */}
      <aside className={`w-64 ${isAdminRoute ? 'bg-indigo-950' : 'bg-slate-900'} text-white hidden md:flex flex-col fixed h-full z-10 transition-colors`}>
        <div className={`p-6 border-b ${isAdminRoute ? 'border-indigo-900' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`${isAdminRoute ? 'bg-indigo-600' : 'bg-blue-600'} p-1.5 rounded-lg shadow-lg`}>
                {isAdminRoute ? <ShieldCheck size={20} className="text-white" /> : <Zap size={20} className="text-white fill-current" />}
            </div>
            <h1 className="text-xl font-bold leading-none">
                Dash Automatize
            </h1>
          </div>
          <p className="text-xs opacity-60 mt-2 pl-1">Olá, {currentUser}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Se for Admin (Kairy), mostra APENAS o painel de admin ou tudo? 
              O prompt diz "só para ter controle". Vou deixar APENAS AdminPanel se for Kairy 
              para manter o foco do admin, ou permitir ele navegar? 
              Vou permitir apenas AdminPanel para Kairy conforme a solicitação de "controle" */}
          
          {currentUser === 'Kairy' ? (
              <button
                onClick={() => setActiveTab(Tab.ADMIN)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-600 text-white shadow-lg"
              >
                <ShieldCheck size={20} />
                <span className="font-medium">Admin Panel</span>
              </button>
          ) : (
            // Menu para Usuários Normais
            <>
                <button
                    onClick={() => setActiveTab(Tab.DASHBOARD)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === Tab.DASHBOARD ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Todos os Leads</span>
                </button>

                <button
                    onClick={() => setActiveTab(Tab.CONSULTANTS)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === Tab.CONSULTANTS ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <Users size={20} />
                    <span className="font-medium">Leads Consultores</span>
                </button>

                <button
                    onClick={() => setActiveTab(Tab.IMPROVEMENTS)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === Tab.IMPROVEMENTS ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <Lightbulb size={20} />
                    <span className="font-medium">Melhorias</span>
                </button>
            </>
          )}
        </nav>

        <div className={`p-4 border-t ${isAdminRoute ? 'border-indigo-900' : 'border-slate-800'}`}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Zap size={18} className="text-white fill-current" />
              </div>
              <div>
                  <h1 className="font-bold leading-tight">Dash</h1>
              </div>
           </div>
           <button onClick={handleLogout}><LogOut size={20} className="text-red-400"/></button>
        </div>

        {/* --- HEADER CONTENT (Conditional) --- */}
        {!isAdminRoute && activeTab !== Tab.IMPROVEMENTS && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === Tab.DASHBOARD ? 'Todos os Leads' : 'Leads por Consultor'}
                </h2>
                <p className="text-slate-500 text-sm">
                    {activeTab === Tab.DASHBOARD ? 'Visão geral da entrada de leads' : 'Acompanhamento de distribuição'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1 border-r border-slate-200">
                  <Filter size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Filtros:</span>
                </div>
                
                {activeTab === Tab.CONSULTANTS && (
                    <>
                        <select
                            value={selectedConsultant}
                            onChange={(e) => setSelectedConsultant(e.target.value)}
                            className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white outline-none"
                        >
                            <option value="">Todos Consultores</option>
                            {consultantOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="date" className="text-sm border border-slate-200 rounded px-2 py-1" value={consultantDateFilter.start} onChange={(e) => setConsultantDateFilter(p => ({...p, start: e.target.value}))} />
                        <span className="text-slate-400">-</span>
                        <input type="date" className="text-sm border border-slate-200 rounded px-2 py-1" value={consultantDateFilter.end} onChange={(e) => setConsultantDateFilter(p => ({...p, end: e.target.value}))} />
                        <button onClick={fetchFilteredConsultants} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md"><Search size={14}/></button>
                        {(consultantDateFilter.start || selectedConsultant) && <button onClick={handleClearConsultantFilter} className="text-red-500"><X size={14}/></button>}
                    </>
                )}

                {activeTab === Tab.DASHBOARD && (
                    <>
                        <input type="date" className="text-sm border border-slate-200 rounded px-2 py-1" value={dashboardDateFilter.start} onChange={(e) => setDashboardDateFilter(p => ({...p, start: e.target.value}))} />
                        <span className="text-slate-400">-</span>
                        <input type="date" className="text-sm border border-slate-200 rounded px-2 py-1" value={dashboardDateFilter.end} onChange={(e) => setDashboardDateFilter(p => ({...p, end: e.target.value}))} />
                        {(dashboardDateFilter.start) && <button onClick={() => setDashboardDateFilter({start: '', end: ''})} className="text-red-500 text-xs px-2"><X size={14} /> Limpar</button>}
                    </>
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
              </div>
            <ImprovementsForm />
          </div>
        )}

        {/* O painel Admin só carrega se for Kairy e estiver na rota correta */}
        {activeTab === Tab.ADMIN && currentUser === 'Kairy' && (
            <div className="animate-fade-in h-full">
                <AdminPanel />
            </div>
        )}
      </main>
    </div>
  );
}

export default App;