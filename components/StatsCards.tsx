import React from 'react';
import { Users, UserPlus, Briefcase } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Leads */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total de Leads</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.totalLeads}
          </h3>
        </div>
      </div>

      {/* Leads Hoje */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <UserPlus size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Leads Hoje</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.leadsToday}
          </h3>
        </div>
      </div>

      {/* Leads por Consultor (Total de registros na tabela leads_consultores) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Briefcase size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Consultoria</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.leadsPerConsultant}
          </h3>
        </div>
      </div>
    </div>
  );
};