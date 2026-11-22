import React, { useState } from 'react';
import { 
  Coffee, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Database, 
  FileText, 
  GitFork, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  Briefcase
} from 'lucide-react';
import { User, UserRole } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

interface DemoAccount {
  email: string;
  role: UserRole;
  title: string;
  name: string;
  organization: string;
  licenseNumber?: string;
  icon: React.ElementType;
  badgeColor: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@kapehtrace.com',
    role: 'ADMIN_COMERCIAL',
    title: 'Administrador Comercial / Finanzas',
    name: 'Lic. Rodrigo Castellanos',
    organization: 'Kapeh Chiapas Export S.A. de C.V.',
    icon: Briefcase,
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Gestión de contratos internacionales, inventario en bodega y control de pagos (PostgreSQL).'
  },
  {
    email: 'qgrader@kapehtrace.com',
    role: 'Q_GRADER',
    title: 'Catador Certificado Q-Grader',
    name: 'Ing. Elena Morales Ruiz',
    organization: 'Laboratorio de Catación San Cristóbal',
    licenseNumber: 'Q-94821 SCA Certified',
    icon: Award,
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Captura de protocolos sensoriales SCA de 10 atributos y perfiles de taza (MongoDB).'
  },
  {
    email: 'logistica@kapehtrace.com',
    role: 'JEFE_LOGISTICA',
    title: 'Jefe de Logística y Trazabilidad',
    name: 'Manuel Santiz Gómez',
    organization: 'Red de Beneficios Comunitarios Los Altos',
    icon: Truck,
    badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
    description: 'Control de cosechas, mezclas M:N y rastreo del linaje parcela-contenedor (Neo4j).'
  },
  {
    email: 'auditor@kapehtrace.com',
    role: 'AUDITOR_CALIDAD',
    title: 'Auditor de Certificaciones',
    name: 'Dra. Carmen Villafuerte',
    organization: 'MayaCert / USDA Organic Compliance',
    licenseNumber: 'AUD-2026-MX',
    icon: ShieldCheck,
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Expedientes de pesticidas, inocuidad y análisis de impacto inverso ante contingencias.'
  }
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('qgrader@kapehtrace.com');
  const [password, setPassword] = useState('kapeh2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemoAccount>(DEMO_ACCOUNTS[1]);

  const handleSelectDemo = (account: DemoAccount) => {
    setSelectedDemo(account);
    setEmail(account.email);
    setPassword('kapeh2026');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);

    // Simulación de autenticación conectada al contexto del backend KapehTrace
    setTimeout(() => {
      setIsLoading(false);
      
      const foundDemo = DEMO_ACCOUNTS.find(acc => acc.email.toLowerCase() === email.toLowerCase());
      
      const user: User = foundDemo ? {
        id: `usr-${foundDemo.role.toLowerCase()}-1`,
        name: foundDemo.name,
        email: foundDemo.email,
        role: foundDemo.role,
        roleTitle: foundDemo.title,
        licenseNumber: foundDemo.licenseNumber,
        organization: foundDemo.organization
      } : {
        id: 'usr-custom-1',
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: 'ADMIN_COMERCIAL',
        roleTitle: 'Operador de Sistema',
        organization: 'Kapeh Chiapas Trace'
      };

      onLoginSuccess(user);
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#0c100e]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-900/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-800/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-900/20 rounded-full blur-[100px]" />
        
        {/* Subtle decorative grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Branding, Context & Polyglot Architecture Badges */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#141d18]/90 via-[#101713]/90 to-[#0a0f0d]/90 border border-emerald-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/40 text-emerald-300 text-xs font-semibold tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Universidad Politécnica de Chiapas • UPChiapas
            </div>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-400/20">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Kapeh<span className="text-amber-400">Trace</span>
                </h1>
                <p className="text-xs text-stone-400 font-medium">
                  Tseltal <span className="italic text-emerald-400">"Kapeh"</span> (Café) + <span className="italic text-amber-400">Trace</span>
                </p>
              </div>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Plataforma integral de trazabilidad, evaluación sensorial y cadena de custodia para cafés de especialidad de las regiones cafetaleras de Chiapas.
            </p>

            {/* Polyglot Database Trio Pills */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-900/30">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-2">
                Persistencia Políglota Coordinada:
              </span>
              
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#17221c]/70 border border-emerald-800/30 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-blue-300 block">PostgreSQL 16 (Relacional)</span>
                  <span className="text-stone-400 text-[11px]">Inventario en sacos (69 kg), clientes y contratos</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#17221c]/70 border border-emerald-800/30 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-emerald-300 block">MongoDB 7 (Documental)</span>
                  <span className="text-stone-400 text-[11px]">Fichas SCA (10 atributos) y laboratorios microbiológicos</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#17221c]/70 border border-emerald-800/30 text-xs">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <GitFork className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-purple-300 block">Neo4j 5 (Grafos)</span>
                  <span className="text-stone-400 text-[11px]">Red de linaje de mezclas y cuarentena en cascada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-emerald-950 flex items-center justify-between text-[11px] text-stone-400">
            <span>Branch: <code className="text-emerald-400 font-mono">feature/frontend</code></span>
            <span>API: <code className="text-amber-400 font-mono">:8000/docs</code></span>
          </div>
        </div>

        {/* Right Column: Interactive Login Form + Role Quick Switcher */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#141b17]/95 border border-emerald-800/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Acceso a la Plataforma</h2>
              <p className="text-sm text-stone-400 mt-1">
                Selecciona un rol de demostración o ingresa tus credenciales autorizadas.
              </p>
            </div>

            {/* Quick Demo Role Selector */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
                Perfiles de Demostración (Acceso Rápido)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = selectedDemo.role === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950' 
                          : 'bg-[#18231e]/50 border-emerald-900/40 hover:bg-[#18231e] hover:border-emerald-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />
                          <span className="text-xs font-bold text-stone-200 truncate max-w-[140px]">{acc.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <span className="text-[11px] text-stone-400 truncate block">{acc.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="email">
                  Correo Electrónico Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@kapehtrace.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1411] border border-emerald-900/50 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-300" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('En el entorno de evaluación use las credenciales demo: kapeh2026'); }} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0e1411] border border-emerald-900/50 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-900 bg-[#0e1411] text-emerald-600 focus:ring-emerald-500/30 focus:ring-offset-0"
                  />
                  <span>Mantener sesión activa en esta estación</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 hover:from-emerald-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Autenticando usuario...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema KapehTrace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Selected Role Context Banner */}
          <div className="mt-6 p-3.5 rounded-2xl bg-[#0e1511] border border-emerald-900/30 flex items-start gap-3">
            <div className={`p-2 rounded-xl ${selectedDemo.badgeColor} flex-shrink-0 mt-0.5`}>
              <selectedDemo.icon className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-stone-200 block">{selectedDemo.title}</span>
              <p className="text-stone-400 mt-0.5 text-[11px] leading-relaxed">
                {selectedDemo.description}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

