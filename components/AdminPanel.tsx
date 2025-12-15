import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AccessLog } from '../types';
import { Shield, Users, MousePointer, Clock, Activity } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Tenta buscar da tabela system_logs. 
      // OBS: Se a tabela não existir no Supabase, isso retornará erro.
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      if (data) setLogs(data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      // Mock data para demonstração caso a tabela não exista ainda
      // setLogs([]); 
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalAccess = logs.length;
    
    // Usuário mais ativo
    const userCounts: Record<string, number> = {};
    logs.forEach(log => {
      userCounts[log.username] = (userCounts[log.username] || 0) + 1;
    });
    const mostActiveUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];

    // Área mais acessada (baseada em 'tab_change')
    const pageCounts: Record<string, number> = {};
    logs.filter(l => l.action === 'tab_change').forEach(log => {
        const page = log.details || 'unknown';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const mostVisitedPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0];

    // Acessos Hoje
    const today = new Date().toISOString().split('T')[0];
    const accessesToday = logs.filter(l => l.created_at.startsWith(today)).length;

    return {
      totalAccess,
      mostActiveUser: mostActiveUser ? mostActiveUser[0] : '-',
      mostActiveUserCount: mostActiveUser ? mostActiveUser[1] : 0,
      mostVisitedPage: mostVisitedPage ? mostVisitedPage[0] : '-',
      accessesToday
    };
  }, [logs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
     return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500">Carregando logs do sistema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
            <Shield className="text-blue-400" size={32} />
            <div>
                <h2 className="text-xl font-bold">Painel Administrativo</h2>
                <p className="text-slate-400 text-sm">Monitoramento de acesso e uso do sistema</p>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity size={20} />
                </div>
                <span className="text-slate-500 text-sm font-medium">Total de Ações</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalAccess}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Users size={20} />
                </div>
                <span className="text-slate-500 text-sm font-medium">Usuário + Ativo</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.mostActiveUser}</p>
            <p className="text-xs text-slate-400">{stats.mostActiveUserCount} registros</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <MousePointer size={20} />
                </div>
                <span className="text-slate-500 text-sm font-medium">Área + Acessada</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 capitalize">
                {stats.mostVisitedPage === '-' ? '-' : 
                 stats.mostVisitedPage === 'dashboard' ? 'Todos os Leads' :
                 stats.mostVisitedPage === 'consultants' ? 'Consultores' : 
                 stats.mostVisitedPage}
            </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Clock size={20} />
                </div>
                <span className="text-slate-500 text-sm font-medium">Acessos Hoje</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.accessesToday}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Histórico de Atividades Recentes</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Data/Hora</th>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Ação</th>
                        <th className="p-4">Detalhes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length > 0 ? logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-500">{formatDate(log.created_at)}</td>
                            <td className="p-4 font-medium text-slate-800">
                                <span className={`px-2 py-1 rounded-md text-xs ${
                                    log.username === 'Kairy' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {log.username}
                                </span>
                            </td>
                            <td className="p-4">
                                {log.action === 'login' && <span className="text-green-600 font-medium">Login</span>}
                                {log.action === 'logout' && <span className="text-red-500">Logout</span>}
                                {log.action === 'tab_change' && <span className="text-blue-500">Navegação</span>}
                            </td>
                            <td className="p-4 text-slate-600 capitalize">
                                {log.details === 'dashboard' ? 'Todos os Leads' :
                                 log.details === 'consultants' ? 'Leads Consultores' :
                                 log.details === 'improvements' ? 'Melhorias' :
                                 log.details}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                Nenhum log registrado ou tabela 'system_logs' não encontrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};