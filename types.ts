
export interface Lead {
  id: number;
  created_at: string;
  name: string;
  number: string;
  qualificacao: string | null;
  resumo_conversa: string | null;
  etapa: number | null;
  timeout: string | null;
}

export interface ConsultantLead {
  id: number;
  consultor: string | null;
  telefone_do_lead: string | null;
  data: string | null; // SQL Type: date (YYYY-MM-DD)
}

export interface DashboardStats {
  totalLeads: number;
  leadsToday: number;
  leadsPerConsultant: number;
}

export interface ConsultantStats {
  totalSent: number;
  sentToday: number;
  activeConsultants: number;
}

export interface DateFilter {
  start: string;
  end: string;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  CONSULTANTS = 'consultants',
  IMPROVEMENTS = 'improvements',
  ADMIN = 'admin'
}

export interface ImprovementFormState {
  solicitante: string;
  tipo: string;
  descricao: string;
  processos_manuais: string;
  prioridade: string;
}

export interface AccessLog {
  id: number;
  created_at: string;
  username: string;
  action: string; // 'login', 'tab_change', 'logout'
  details: string | null; // ex: 'dashboard', 'consultants'
}

export interface CompanySettings {
  username: string;
  is_active: boolean;
  module_consultants: boolean;
  module_improvements: boolean;
}
