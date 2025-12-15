import React from 'react';
import { Send, CalendarCheck, Users } from 'lucide-react';
import { ConsultantStats } from '../types';

interface ConsultantStatsCardsProps {
  stats: ConsultantStats;
  loading: boolean;
}

export const ConsultantStatsCards: React.FC<ConsultantStatsCardsProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Leads Enviados */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Send size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Leads Enviados</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.totalSent}
          </h3>
        </div>
      </div>

      {/* Leads Enviados Hoje */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <CalendarCheck size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Enviados Hoje</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.sentToday}
          </h3>
        </div>
      </div>

      {/* Consultores Ativos */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Consultores Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.activeConsultants}
          </h3>
        </div>
      </div>
    </div>
  );
};