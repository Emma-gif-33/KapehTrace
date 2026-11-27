import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

interface DemoProfile {
  initials: string;
  name: string;
  roleTitle: string;
  email: string;
  role: UserRole;
  organization: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    initials: 'JT',
    name: 'Jefe de Trazabilidad',
    roleTitle: 'Registro de lotes, mezclas y linaje',
    email: 'trazabilidad@kapehtrace.mx',
    role: 'JEFE_LOGISTICA',
    organization: 'Red de Beneficios Comunitarios Los Altos'
  },
  {
    initials: 'QG',
    name: 'Catador Q-Grader',
    roleTitle: 'Evaluación sensorial SCA y calidad',
    email: 'catador@kapehtrace.mx',
    role: 'Q_GRADER',
    organization: 'Laboratorio de Catación Chiapas'
  },
  {
    initials: 'AC',
    name: 'Administradora Comercial',
    roleTitle: 'Inventario, contratos y pasaporte',
    email: 'comercial@kapehtrace.mx',
    role: 'ADMIN_COMERCIAL',
    organization: 'Kapeh Chiapas Export S.A. de C.V.'
  },
  {
    initials: 'AU',
    name: 'Auditor de Calidad',
    roleTitle: 'Inocuidad, LMR y cuarentena en cascada',
    email: 'auditor@kapehtrace.mx',
    role: 'AUDITOR_CALIDAD',
    organization: 'SENASICA / Certificación Orgánica'
  }
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const currentProfile = DEMO_PROFILES[activeProfileIndex];

  const [email, setEmail] = useState(currentProfile.email);
  const [password, setPassword] = useState('kapeh2026');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSelectProfile = (index: number) => {
    setActiveProfileIndex(index);
    setEmail(DEMO_PROFILES[index].email);
    setPassword('kapeh2026');
    setShowProfileMenu(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const found = DEMO_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase()) || currentProfile;

      const user: User = {
        id: `usr-${found.role.toLowerCase()}`,
        name: found.name,
        email: found.email,
        role: found.role,
        roleTitle: found.roleTitle,
        organization: found.organization
      };

      onLoginSuccess(user);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-[#1c1511]">
      
      {/* Contenedor Principal */}
      <div className="w-full max-w-5xl rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 border border-stone-800/50 bg-[#FAF7F2]">
        
        {/* PANEL IZQUIERDO */}
        <div className="md:col-span-5 relative bg-gradient-to-b from-[#2e1d15] via-[#241710] to-[#1a100b] p-8 sm:p-10 flex flex-col justify-between overflow-hidden text-white border-b md:border-b-0 md:border-r border-stone-900/40">
          
          {/* Siluetas de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg 
              className="absolute -bottom-10 -right-20 w-[460px] h-[460px] opacity-25" 
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 380 C120 220, 240 180, 420 380 Z" fill="#000000" />
              <path d="M-50 400 C80 260, 200 240, 350 400 Z" fill="#0d0705" />
              <circle cx="200" cy="190" r="140" fill="url(#sun-glow)" opacity="0.15" />
              <defs>
                <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#C07850" />
                  <stop offset="100%" stopColor="#241710" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Logo Superior */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-[#D79270]">
              <svg width="22" height="26" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
                <ellipse cx="8" cy="14" rx="6" ry="11" stroke="#D79270" strokeWidth="2" fill="none" />
                <path d="M8 3 C7 9, 9 19, 8 25" stroke="#D79270" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="16" cy="14" rx="6" ry="11" stroke="#D79270" strokeWidth="2" fill="none" />
                <path d="M16 3 C15 9, 17 19, 16 25" stroke="#D79270" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="font-serif text-xl tracking-tight text-white font-medium">
              Kapeh<span className="text-[#D79270]">Trace</span>
            </div>
          </div>

          {/* Mensaje Central */}
          <div className="relative z-10 my-16 sm:my-20">
            <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#D79270] block mb-3">
              DEL ORIGEN AL DESTINO
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-white font-normal tracking-tight">
              Cada grano tiene una historia.
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-5 leading-relaxed font-sans max-w-sm">
              Trazabilidad, calidad y cadena de custodia para el café de especialidad de Chiapas.
            </p>
          </div>

          {/* Tecnologías en el Pie */}
          <div className="relative z-10 pt-4 border-t border-stone-800/40">
            <div className="flex items-center gap-6 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-stone-400">
              <span>POSTGRESQL</span>
              <span>MONGODB</span>
              <span>NEO4J</span>
            </div>
          </div>

        </div>

        {/* PANEL DERECHO */}
        <div className="md:col-span-7 bg-[#FAF7F2] p-8 sm:p-12 flex flex-col justify-between relative overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
          
          <div>
            {/* Encabezado */}
            <div className="mb-8">
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#C07850] block mb-1.5">
                ACCESO SEGURO
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#241710] font-normal tracking-tight">
                Bienvenido de vuelta
              </h2>
              <p className="text-xs sm:text-sm text-[#73655B] mt-1.5 font-sans">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-[#4B3D34] mb-1.5 font-sans">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="trazabilidad@kapehtrace.mx"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710] placeholder-stone-400 focus:outline-none focus:border-[#C07850] focus:ring-1 focus:ring-[#C07850] shadow-xs transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#4B3D34] font-sans">
                    Contraseña
                  </label>
                  <a 
                    href="#recuperar" 
                    onClick={(e) => { e.preventDefault(); alert('En esta versión demostrativa puedes usar la contraseña: kapeh2026'); }}
                    className="text-xs text-[#C07850] hover:underline font-sans"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710] placeholder-stone-400 focus:outline-none focus:border-[#C07850] focus:ring-1 focus:ring-[#C07850] shadow-xs transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-[#332017] hover:bg-[#23150e] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#332017]/15 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Accediendo...</span>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5DDD5]" />
              </div>
              <span className="relative bg-[#FAF7F2] px-3 text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.15em] uppercase text-[#9B8E85]">
                O USA UN PERFIL DE DEMOSTRACIÓN
              </span>
            </div>

            {/* Selector de Perfil Desplegable */}
            <div>
              
              {/* Tarjeta Superior seleccionada */}
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5DDD5] flex items-center justify-between hover:border-[#C07850] transition-colors cursor-pointer shadow-xs group select-none"
              >
                <div className="flex items-center gap-3">
                  {/* Ícono de dos nodos conectados idéntico al diseño */}
                  <div className="w-12 h-12 rounded-full bg-[#F2EDE4] flex items-center justify-center text-[#6F4E37] flex-shrink-0 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6F4E37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="6" r="3" />
                      <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#241710] leading-tight">
                      {currentProfile.name}
                    </h4>
                    <span className="text-xs text-[#73655B] font-sans">
                      {currentProfile.roleTitle}
                    </span>
                  </div>
                </div>

                <div className="text-[#523E33] group-hover:text-[#241710] pr-1">
                  <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Lista Desplegable inline con scroll interno */}
              {showProfileMenu && (
                <div className="mt-2 bg-white rounded-2xl border border-[#E5DDD5] shadow-lg p-2 max-h-52 overflow-y-auto">
                  <div className="space-y-1">
                    {DEMO_PROFILES.map((p, idx) => {
                      const isSelected = activeProfileIndex === idx;
                      return (
                        <div
                          key={p.role}
                          onClick={() => handleSelectProfile(idx)}
                          className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-[#F2EDE4]' 
                              : 'hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {/* Avatar oscuro con iniciales (LM, DL, EA, MR) */}
                          <div className="w-9 h-9 rounded-full bg-[#3B261C] text-white flex items-center justify-center text-xs font-bold font-sans flex-shrink-0">
                            {p.initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-[#241710] leading-tight truncate">
                              {p.name}
                            </h5>
                            <span className="text-xs text-[#73655B] font-sans truncate block">
                              {p.roleTitle}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Nota al Pie */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-[#A3968C] font-sans">
              Plataforma demostrativa · Los datos mostrados son ilustrativos
            </p>
          </div>

          {/* Botón flotante de ayuda en la esquina */}
          <button 
            type="button"
            onClick={() => alert('KapehTrace: Sistema de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad (UPChiapas).')}
            className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#241710] text-white flex items-center justify-center text-xs font-bold hover:bg-[#332017] transition-colors cursor-pointer shadow-sm"
            title="Ayuda del sistema"
          >
            ?
          </button>

        </div>

      </div>

    </div>
  );
};
