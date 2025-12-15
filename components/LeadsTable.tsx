import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, Calendar } from 'lucide-react';
import { Lead } from '../types';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and Sort Logic
  const processedLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.name || '').toLowerCase().includes(lowerSearch) ||
          (lead.number || '').includes(lowerSearch)
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

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to newest first for dates
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500">Carregando leads...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header with Search */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Tabela de Leads</h2>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar nome ou telefone..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                <div className="flex items-center space-x-1">
                  <span>Nome</span>
                  <ArrowUpDown size={14} className={sortField === 'name' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('number')}>
                 <div className="flex items-center space-x-1">
                  <span>Telefone</span>
                  <ArrowUpDown size={14} className={sortField === 'number' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('qualificacao')}>
                 <div className="flex items-center space-x-1">
                  <span>Qualificação</span>
                  <ArrowUpDown size={14} className={sortField === 'qualificacao' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                 <div className="flex items-center space-x-1">
                  <span>Data de Criação</span>
                  <ArrowUpDown size={14} className={sortField === 'created_at' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('etapa')}>
                 <div className="flex items-center space-x-1">
                  <span>Etapa</span>
                  <ArrowUpDown size={14} className={sortField === 'etapa' ? 'text-blue-600' : 'text-slate-400'} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                  <td className="p-4 font-medium">{lead.name || 'Sem nome'}</td>
                  <td className="p-4">{lead.number}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.qualificacao === 'Qualificado' ? 'bg-green-100 text-green-700' :
                      lead.qualificacao === 'Desqualificado' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.qualificacao || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400"/>
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                            {lead.etapa ?? '-'}
                        </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Nenhum lead encontrado com os filtros atuais.
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