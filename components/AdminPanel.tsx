import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AccessLog, CompanySettings } from '../types';
import { Shield, Users, MousePointer, Clock, Activity, Building2, ChevronRight, ToggleRight, ToggleLeft, BarChart2 } from 'lucide-react';

interface CompanyUser {
  username: string;
  lastAccess: string;
}

export const AdminPanel: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Estado real de permissões
  const [permissions, setPermissions] = useState<CompanySettings>({
      username: '',
      is_active: true,
      module_consultants: true,
      module_improvements: true
  });
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); 

      if (error) throw error;
      if (data) setLogs(data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extrair lista de usuários únicos (Empresas Ativas)
  const companies = useMemo(() => {
    const userMap = new Map<string, string>(); // user -> lastAccess
    
    logs.forEach(log => {
        if (log.username === 'Kairy') return; // Ignora o admin na lista de empresas
        if (!userMap.has(log.username)) {
            userMap.set(log.username, log.created_at);
        }
    });

    return Array.from(userMap.entries()).map(([username, lastAccess]) => ({
        username,
        lastAccess
    }));
  }, [logs]);

  // Estatísticas do Usuário Selecionado
  const userStats = useMemo(() => {
    if (!selectedUser) return null;

    const userLogs = logs.filter(l => l.username === selectedUser);
    const totalAccess = userLogs.length;
    const lastAccess = userLogs[0]?.created_at;

    // Área mais acessada
    const pageCounts: Record<string, number> = {};
    userLogs.filter(l => l.action === 'tab_change').forEach(log => {
        const page = log.details || 'unknown';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const mostVisitedPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0];

    return {
        totalAccess,
        lastAccess,
        mostVisitedPage: mostVisitedPage ? mostVisitedPage[0] : 'Nenhuma atividade',
        logs: userLogs
    };
  }, [logs, selectedUser]);

  // Buscar permissões quando seleciona usuário
  useEffect(() => {
    const fetchPermissions = async () => {
        if (!selectedUser) return;
        setLoadingPermissions(true);
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .eq('username', selectedUser)
                .single();
            
            if (data) {
                setPermissions(data);
            } else {
                // Se não existir, define o padrão
                setPermissions({
                    username: selectedUser,
                    is_active: true,
                    module_consultants: true,
                    module_improvements: true
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPermissions(false);
        }
    };

    fetchPermissions();
  }, [selectedUser]);

  const togglePermission = async (key: keyof CompanySettings) => {
      if (!selectedUser) return;
      
      const newValue = !permissions[key];
      
      // Update local state optimistic
      setPermissions(prev => ({
          ...prev,
          [key]: newValue
      }));

      // Update DB
      const newSettings = {
          ...permissions,
          username: selectedUser,
          [key]: newValue
      };

      try {
          const { error } = await supabase
            .from('company_settings')
            .upsert(newSettings);
          
          if (error) throw error;
      } catch (e) {
          console.error('Erro ao salvar permissão:', e);
          alert('Erro ao salvar alteração.');
          // Revert on error
          setPermissions(prev => ({ ...prev, [key]: !newValue }));
      }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
     return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-500">Carregando dados administrativos...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* COLUNA ESQUERDA: LISTA DE EMPRESAS */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-slate-500" />
                Empresas Ativas
            </h3>
            <p className="text-xs text-slate-500 mt-1">Selecione para ver detalhes</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {companies.length > 0 ? companies.map((comp) => (
                <button
                    key={comp.username}
                    onClick={() => setSelectedUser(comp.username)}
                    className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between group ${
                        selectedUser === comp.username 
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                >
                    <div>
                        <p className={`font-bold ${selectedUser === comp.username ? 'text-indigo-700' : 'text-slate-700'}`}>
                            {comp.username}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <Clock size={10} />
                            Último acesso: {formatDate(comp.lastAccess)}
                        </div>
                    </div>
                    <ChevronRight size={16} className={`text-slate-300 transition-transform ${selectedUser === comp.username ? 'text-indigo-500 translate-x-1' : 'group-hover:translate-x-1'}`} />
                </button>
            )) : (
                <div className="text-center p-8 text-slate-400">
                    Nenhuma empresa encontrada nos logs.
                </div>
            )}
        </div>
      </div>

      {/* COLUNA DIREITA: DETALHES DA EMPRESA */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {selectedUser && userStats ? (
            <div className="flex flex-col h-full">
                {/* Header do Usuário */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {selectedUser}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${permissions.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {permissions.is_active ? 'ATIVO' : 'BLOQUEADO'}
                            </span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Gerenciamento de conta e estatísticas</p>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Acessos</span>
                         <span className="text-xl font-bold text-indigo-600">{userStats.totalAccess}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-2">
                                <MousePointer size={18} />
                                Área Mais Acessada
                            </div>
                            <div className="text-lg font-bold text-slate-800 capitalize">
                                {userStats.mostVisitedPage === 'dashboard' ? 'Todos os Leads' :
                                 userStats.mostVisitedPage === 'consultants' ? 'Consultores' :
                                 userStats.mostVisitedPage === 'improvements' ? 'Melhorias' :
                                 userStats.mostVisitedPage}
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-800 font-semibold mb-2">
                                <Activity size={18} />
                                Status Atual
                            </div>
                            <div className="text-lg font-bold text-slate-800">
                                {permissions.is_active ? 'Regular' : 'Suspenso'}
                            </div>
                        </div>
                    </div>

                    {/* PERMISSIONS / TOGGLES */}
                    <div className="mb-8">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Shield size={18} className="text-slate-500" />
                            Controle de Funcionalidades
                        </h3>
                        {loadingPermissions ? (
                            <div className="text-center py-4 text-slate-500">Carregando permissões...</div>
                        ) : (
                            <div className="space-y-4">
                                {/* Toggle 1: Acesso Geral */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-800">Acesso ao Sistema</p>
                                        <p className="text-xs text-slate-500">Bloquear ou permitir login desta empresa</p>
                                    </div>
                                    <button 
                                        onClick={() => togglePermission('is_active')}
                                        className={`transition-colors ${permissions.is_active ? 'text-green-600' : 'text-slate-400'}`}
                                    >
                                        {permissions.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>

                                {/* Toggle 2: Módulo Consultores */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-800">Módulo de Consultores</p>
                                        <p className="text-xs text-slate-500">Acesso à aba de distribuição de leads</p>
                                    </div>
                                    <button 
                                        onClick={() => togglePermission('module_consultants')}
                                        className={`transition-colors ${permissions.module_consultants ? 'text-indigo-600' : 'text-slate-400'}`}
                                    >
                                        {permissions.module_consultants ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>

                                {/* Toggle 3: Módulo Melhorias */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-800">Solicitação de Melhorias</p>
                                        <p className="text-xs text-slate-500">Permissão para enviar feedbacks</p>
                                    </div>
                                    <button 
                                        onClick={() => togglePermission('module_improvements')}
                                        className={`transition-colors ${permissions.module_improvements ? 'text-indigo-600' : 'text-slate-400'}`}
                                    >
                                        {permissions.module_improvements ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACTIVITY LOG (Mini) */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <BarChart2 size={18} className="text-slate-500" />
                            Histórico Recente
                        </h3>
                        <div className="space-y-3">
                            {userStats.logs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${log.action === 'login' ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                        <span className="text-slate-700 font-medium capitalize">
                                            {log.action === 'tab_change' ? 'Navegou para' : log.action}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                             {log.details === 'dashboard' ? 'Todos os Leads' :
                                              log.details === 'consultants' ? 'Consultores' :
                                              log.details}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 text-xs">{formatDate(log.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Building2 size={64} className="mb-4 text-slate-200" />
                <p className="text-lg font-medium">Selecione uma empresa</p>
                <p className="text-sm">Escolha na lista à esquerda para ver estatísticas e gerenciar permissões.</p>
            </div>
        )}
      </div>
    </div>
  );
};