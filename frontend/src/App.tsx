import { useState } from 'react';
import { 
  Coffee, 
  LogOut, 
  Database, 
  Layers, 
  GitFork, 
  ShieldAlert, 
  FileSpreadsheet, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Login } from './components/Login';
import { User, AuthState } from './types/auth';

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('kapehtrace_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { isAuthenticated: false, user: null, token: null };
      }
    }
    return { isAuthenticated: false, user: null, token: null };
  });

  const handleLoginSuccess = (user: User) => {
    const newAuth: AuthState = {
      isAuthenticated: true,
      user,
      token: 'jwt-kapeh-demo-session-token'
    };
    setAuth(newAuth);
    localStorage.setItem('kapehtrace_auth', JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    const cleared: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
    setAuth(cleared);
    localStorage.removeItem('kapehtrace_auth');
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const { user } = auth;

  return (
    <div className="min-h-screen bg-[#0e1411] text-stone-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#121a15]/90 border-b border-emerald-900/40 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 via-amber-600 to-emerald-600 flex items-center justify-center shadow-md shadow-amber-900/30 border border-amber-400/20">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Kapeh<span className="text-amber-400">Trace</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                v1.0 • Chiapas
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Cadena de Custodia & Persistencia Políglota
            </p>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">{user.name}</span>
            <span className="text-[11px] text-emerald-400 font-medium block">{user.roleTitle}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center font-bold text-emerald-300 text-xs">
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-stone-900/70 border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-900/60 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#14231b]/90 to-[#1e1e18]/80 border border-emerald-800/40 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sesión iniciada con éxito
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido, {user.name}
            </h1>
            <p className="text-stone-300 text-sm mt-2 leading-relaxed">
              Estás conectado como <strong className="text-emerald-300">{user.roleTitle}</strong> en <strong className="text-amber-300">{user.organization}</strong>. El backend FastAPI orquesta en tiempo real las 3 bases de datos del sistema.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-[#0e1713] border border-emerald-900/50 text-stone-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Branch: <code className="text-emerald-400 font-mono">feature/frontend</code>
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#0e1713] border border-emerald-900/50 text-stone-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Backend OpenAPI: <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">localhost:8000/docs <ExternalLink className="w-2.5 h-2.5" /></a>
              </span>
            </div>
          </div>
        </section>

        {/* Modular Workspace Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Módulos de la Plataforma KapehTrace</h2>
              <p className="text-xs text-stone-400 mt-0.5">Vistas conectadas a cada motor de persistencia especializada.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Lotes e Inventario */}
            <div className="rounded-2xl bg-[#131b17] border border-emerald-900/40 p-5 flex flex-col justify-between hover:border-emerald-600/50 transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded">PostgreSQL</span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  Catálogo de Lotes & Inventario
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  Control transaccional de sacos (69 kg), asignación a contratos, clientes internacionales y estados comerciales.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Próximo módulo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Pasaporte Sensorial SCA */}
            <div className="rounded-2xl bg-[#131b17] border border-emerald-900/40 p-5 flex flex-col justify-between hover:border-emerald-600/50 transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">MongoDB</span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  Fichas SCA & Calidad 360°
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  Evaluación Q-Grader (10 atributos), gráficos de radar organoléptico y análisis de micotoxinas/laboratorio.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Próximo módulo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Linaje y Grafo de Mezclas */}
            <div className="rounded-2xl bg-[#131b17] border border-emerald-900/40 p-5 flex flex-col justify-between hover:border-emerald-600/50 transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                  <GitFork className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">Neo4j Cypher</span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  Árbol Genealógico de Mezclas
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  Recorrido interactivo de grafos: desde micro-parcelas y cereza, pasando por beneficios y mezclas hasta el contenedor.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Próximo módulo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Cuarentena en Cascada */}
            <div className="rounded-2xl bg-[#131b17] border border-emerald-900/40 p-5 flex flex-col justify-between hover:border-red-900/50 transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded">Integración Crítica</span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors">
                  Cuarentena en Cascada
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  Simulación de impacto inverso: detección de lote contaminado y congelamiento preventivo automático en las 3 bases.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs font-semibold text-red-400">
                <span>Próximo módulo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>

        {/* Polyglot Info Box */}
        <section className="rounded-2xl bg-[#101713] border border-emerald-900/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Estado de la interfaz Frontend</h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Módulo de autenticación completado. Listo para continuar con el catálogo de lotes y el pasaporte digital.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 bg-stone-900 border border-stone-800 hover:bg-stone-800 transition-colors"
          >
            Regresar a Pantalla de Login
          </button>
        </section>

      </main>
    </div>
  );
}

