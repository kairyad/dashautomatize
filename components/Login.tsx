import React, { useState } from 'react';
import { Lock, User, Zap, ArrowRight, Eye, EyeOff, ChevronRight, ShieldCheck, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para controlar se é a tela de Admin ou User
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Lógica separada por tipo de acesso
    if (isAdminMode) {
        // Validação estrita para Admin
        // Credencial atualizada conforme solicitado: Kairy / 88320115#
        if (username.trim() === 'Kairy' && password === '88320115#') {
            onLogin('Kairy');
        } else {
            setError('Acesso negado. Credenciais administrativas inválidas.');
        }
    } else {
        // Validação para Operacional
        const userCredentials = [
             { user: 'Pulseenergy', pass: 'Pulse@energy1' } 
        ];

        const foundUser = userCredentials.find(
            cred => cred.user.toLowerCase() === username.trim().toLowerCase() && cred.pass === password
        );

        // Bloqueia Kairy de logar na tela comum para forçar uso da tela de Admin
        if (username.trim() === 'Kairy') {
             setError('Por favor, utilize a área de "Acesso Administrativo".');
             return;
        }

        if (foundUser) {
            onLogin(foundUser.user);
        } else {
            setError('Credenciais inválidas. Tente novamente.');
        }
    }
  };

  const toggleMode = () => {
      setIsAdminMode(!isAdminMode);
      setUsername('');
      setPassword('');
      setError('');
      setShowPassword(false);
  };

  // Definições de estilo baseadas no modo
  const themeColor = isAdminMode ? 'indigo' : 'blue';
  const bgGradient = isAdminMode 
      ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900' 
      : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900';
  
  const iconColor = isAdminMode ? 'text-indigo-600' : 'text-blue-600';
  const buttonClass = isAdminMode
      ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/25'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/25';
  
  const ringClass = isAdminMode 
      ? 'focus:ring-indigo-500/20 focus:border-indigo-500' 
      : 'focus:ring-blue-500/20 focus:border-blue-500';

  return (
    <div className="flex min-h-screen w-full font-sans bg-slate-50 lg:bg-white overflow-hidden transition-colors duration-500">
      
      {/* --- PAINEL ESQUERDO (Visual/Institucional - Desktop) --- */}
      <div className={`hidden lg:flex w-1/2 relative ${bgGradient} text-white overflow-hidden flex-col justify-between p-12 z-10 transition-all duration-700`}>
        
        {/* Elementos de Fundo (Abstrato/Tecnológico) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${isAdminMode ? 'bg-indigo-600/30' : 'bg-blue-600/30'} rounded-full blur-[100px] transition-colors duration-700`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] ${isAdminMode ? 'bg-purple-600/30' : 'bg-indigo-600/30'} rounded-full blur-[120px] transition-colors duration-700`}></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            {isAdminMode ? <ShieldCheck size={20} className="text-indigo-300" /> : <Zap size={20} className="text-blue-300 fill-current" />}
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Dash Automatize</span>
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-10 max-w-lg mt-12 animate-fade-in">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            {isAdminMode ? (
                <>Painel <br/>Administrativo</>
            ) : (
                <>Olá, <br />seja bem-vindo!</>
            )}
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 opacity-90 font-light">
            {isAdminMode 
                ? 'Área restrita para gerenciamento global do sistema, logs de auditoria e configurações avançadas.'
                : 'Acesse sua central de controle. Gerencie leads, monitore a performance dos consultores e otimize suas automações.'
            }
          </p>
        </div>

        {/* Footer Esquerdo */}
        <div className="relative z-10 text-xs text-blue-200/60 font-medium tracking-wide">
          © 2025 AUTOMATIZE SYSTEM. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* --- PAINEL DIREITO (Login Form - Mobile & Desktop) --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col items-center mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${isAdminMode ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-blue-600 shadow-blue-500/30'} shadow-xl mb-4 transform hover:scale-105 transition-all`}>
                {isAdminMode ? <Shield size={28} className="text-white" /> : <Zap size={28} className="text-white fill-current" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dash Automatize</h1>
        </div>

        {/* Card Centralizado */}
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10 relative transition-all">
          
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                {isAdminMode && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-200">Admin</span>}
                <h2 className={`text-2xl font-bold ${isAdminMode ? 'text-indigo-950' : 'text-slate-900'}`}>
                    {isAdminMode ? 'Login Seguro' : 'Acesse sua conta'}
                </h2>
            </div>
            <p className="text-slate-500 text-sm">
                {isAdminMode ? 'Insira suas credenciais de administrador.' : 'Insira suas credenciais para continuar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Input Usuário */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className={`text-slate-400 group-focus-within:${iconColor} transition-colors`} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${ringClass} transition-all text-sm font-medium`}
                  placeholder={isAdminMode ? "Ex: Kairy" : "Ex: Pulseenergy"}
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-semibold text-slate-700">Senha</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className={`text-slate-400 group-focus-within:${iconColor} transition-colors`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${ringClass} transition-all text-sm font-medium`}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              className={`w-full mt-2 py-3.5 px-4 ${buttonClass} text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group`}
            >
              {isAdminMode ? 'Acessar Admin' : 'Entrar'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Toggle Admin/User */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
                onClick={toggleMode}
                className={`text-sm font-medium ${isAdminMode ? 'text-slate-500 hover:text-slate-800' : 'text-indigo-600 hover:text-indigo-800'} transition-colors flex items-center justify-center gap-2 w-full`}
            >
                {isAdminMode ? (
                    <>
                        <Zap size={16} />
                        Voltar para Acesso Operacional
                    </>
                ) : (
                    <>
                        <ShieldCheck size={16} />
                        Acesso Administrativo
                    </>
                )}
            </button>
          </div>

        </div>

        {/* Footer Mobile */}
        <div className="lg:hidden mt-8 text-slate-400 text-xs font-medium">
             © 2025 AUTOMATIZE SYSTEM
        </div>
      </div>
    </div>
  );
};