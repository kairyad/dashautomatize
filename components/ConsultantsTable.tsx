import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, Calendar, User } from 'lucide-react';
import { ConsultantLead } from '../types';

interface ConsultantsTableProps {
  leads: ConsultantLead[];
  loading: boolean;
}

export const ConsultantsTable: React.FC<ConsultantsTableProps> = ({ leads, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ConsultantLead>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and Sort Logic
  const processedLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.consultor || '').toLowerCase().includes(lowerSearch) ||
          (lead.telefone_do_lead || '').includes(lowerSearch)
      );
    }

    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === null) return 1;
      if (valB === null) return -1;

      if (valA === valB) return 0;

      const compareResult = valA! > valB! ? 1 : -1;
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(processedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = processedLeads.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof ConsultantLead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to newest first
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      if (dateString.includes('T')) {
          return new Date(dateString).toLocaleDateString('pt-BR');
      }
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500">Carregando dados dos consultores...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header with Search */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Tabela de Envios</h2>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar consultor ou telefone..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('consultor')}>
                <div className="flex items-center space-x-1">
                  <span>Consultor</span>
                  <ArrowUpDown size={14} className={sortField === 'consultor' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('telefone_do_lead')}>
                 <div className="flex items-center space-x-1">
                  <span>Telefone do Lead</span>
                  <ArrowUpDown size={14} className={sortField === 'telefone_do_lead' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('data')}>
                 <div className="flex items-center space-x-1">
                  <span>Data de Envio</span>
                  <ArrowUpDown size={14} className={sortField === 'data' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                  <td className="p-4 font-medium flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    {lead.consultor || <span className="text-slate-400 italic">Não informado</span>}
                  </td>
                  <td className="p-4">
                    {lead.telefone_do_lead ? lead.telefone_do_lead : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400"/>
                    {formatDate(lead.data)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  Nenhum registro encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
        <span className="text-sm text-slate-500">
          Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, processedLeads.length)} de {processedLeads.length} registros
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-sm font-medium"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          
          <span className="text-sm font-medium text-slate-700 px-2">
            Página {currentPage} de {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-sm font-medium"
          >
            <span>Próximo</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};