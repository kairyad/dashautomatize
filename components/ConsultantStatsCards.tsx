import React, { useState } from 'react';
import { Send, CalendarCheck, Users, Edit2, Check, X } from 'lucide-react';
import { ConsultantStats } from '../types';

interface ConsultantStatsCardsProps {
  stats: ConsultantStats;
  loading: boolean;
  onManualUpdate?: (value: number) => void;
}

export const ConsultantStatsCards: React.FC<ConsultantStatsCardsProps> = ({ stats, loading, onManualUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(stats.activeConsultants.toString());

  const handleSave = () => {
    const numValue = parseInt(tempValue);
    if (!isNaN(numValue) && onManualUpdate) {
      onManualUpdate(numValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(stats.activeConsultants.toString());
    setIsEditing(false);
  };

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

      {/* Consultores Ativos - EDITÁVEL */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow relative group">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <Users size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">Consultores Ativos</p>
          
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-20 px-2 py-1 text-xl font-bold border-2 border-purple-300 rounded outline-none focus:border-purple-500"
                autoFocus
              />
              <button onClick={handleSave} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                <Check size={18} />
              </button>
              <button onClick={handleCancel} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : stats.activeConsultants}
              </h3>
              {!loading && (
                <button 
                  onClick={() => {
                    setTempValue(stats.activeConsultants.toString());
                    setIsEditing(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Editar manualmente"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};