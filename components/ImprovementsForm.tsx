import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { ImprovementFormState } from '../types';

export const ImprovementsForm: React.FC = () => {
  const initialState: ImprovementFormState = {
    solicitante: '',
    tipo: 'Nova Funcionalidade',
    descricao: '',
    processos_manuais: '',
    prioridade: 'Média',
  };

  const [formData, setFormData] = useState<ImprovementFormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.descricao.length < 20) {
        setErrorMessage("A descrição deve ter pelo menos 20 caracteres.");
        setStatus('error');
        return;
    }
    
    setStatus('submitting');
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        data_solicitacao: new Date().toISOString(),
      };

      const response = await fetch('https://www.pulseenergy.shop/webhook/dash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar a solicitação. Tente novamente mais tarde.');
      }

      setStatus('success');
      setFormData(initialState);
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);

    } catch (error: any) {
      console.error('Webhook Error:', error);
      setErrorMessage(error.message || 'Erro ao conectar com o servidor.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div className="bg-blue-600 p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Send size={20} />
          Solicitar Melhoria
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Utilize este formulário para sugerir novas funcionalidades, reportar bugs ou solicitar automações.
        </p>
      </div>

      <div className="p-8">
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle size={20} />
            <div>
              <p className="font-bold">Sucesso!</p>
              <p className="text-sm">Sua solicitação foi enviada com sucesso para nossa equipe.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <div>
              <p className="font-bold">Erro ao enviar</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome do Solicitante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="solicitante"
                required
                value={formData.solicitante}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-900 font-medium"
              >
                <option value="Baixa" className="text-slate-900">Baixa</option>
                <option value="Média" className="text-slate-900">Média</option>
                <option value="Alta" className="text-slate-900">Alta</option>
                <option value="Urgente" className="text-slate-900">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Melhoria
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-900 font-medium"
            >
              <option value="Nova Funcionalidade" className="text-slate-900">Nova Funcionalidade</option>
              <option value="Correção de Bug" className="text-slate-900">Correção de Bug</option>
              <option value="Automação de Processo" className="text-slate-900">Automação de Processo</option>
              <option value="Outro" className="text-slate-900">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descrição Detalhada <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              required
              minLength={20}
              rows={4}
              value={formData.descricao}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-900"
              placeholder="Descreva detalhadamente o que você precisa..."
            ></textarea>
            <p className="text-xs text-slate-500 mt-1 text-right">{formData.descricao.length}/20 caracteres mínimos</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Processos Manuais a Automatizar
            </label>
            <textarea
              name="processos_manuais"
              rows={3}
              value={formData.processos_manuais}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-900"
              placeholder="Existe algum processo manual hoje que seria substituído? Descreva-o."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};