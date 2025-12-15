import React, { useState } from 'react';
import { Lock, User, Zap, ArrowRight, Eye, EyeOff, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mantendo a lógica de autenticação existente
    const credentials = [
      { user: 'Kairy', pass: '88320115' },         // Admin
      { user: 'Pulseenergy', pass: 'Pulse@energy1' } // Usuario normal
    ];

    const foundUser = credentials.find(
      cred => cred.user.toLowerCase() === username.trim().toLowerCase() && cred.pass === password
    );

    if (foundUser) {
      onLogin(foundUser.user);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white overflow-hidden">
      
      {/* --- PAINEL ESQUERDO (Visual/Institucional) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden flex-col justify-between p-12 z-10">
        
        {/* Elementos de Fundo (Abstrato/Tecnológico) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px]"></div>
            <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <Zap size={20} className="text-blue-300 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Dash Automatize</span>
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-10 max-w-lg mt-12">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Olá, <br />
            seja bem-vindo!
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 opacity-90 font-light">
            Acesse sua central de controle. Gerencie leads, monitore a performance dos consultores e otimize suas automações em um único lugar.
          </p>
          
          <button className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all duration-300 text-sm font-medium">
            Ver mais detalhes
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Esquerdo */}
        <div className="relative z-10 text-xs text-blue-200/60 font-medium tracking-wide">
          © 2025 AUTOMATIZE SYSTEM. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* --- PAINEL DIREITO (Login Form) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50/50 p-6 md:p-12">
        
        {/* Card Centralizado */}
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10 relative">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesse sua conta</h2>
            <p className="text-slate-500 text-sm">Insira suas credenciais para continuar.</p>
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
                  <User size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                  placeholder="Ex: Pulseenergy"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-semibold text-slate-700">Senha</label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
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
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              Entrar
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Rodapé do Card */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Ainda não tem acesso?{' '}
              <button className="text-blue-600 font-bold hover:underline transition-all">
                Fale com o suporte
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};