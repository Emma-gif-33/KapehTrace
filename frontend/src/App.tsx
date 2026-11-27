import { useState } from 'react';
import { Login } from './components/Login';
import { LuciaDashboard } from './components/lucia/LuciaDashboard';
import { DanielDashboard } from './components/daniel/DanielDashboard';
import { ElenaDashboard } from './components/elena/ElenaDashboard';
import { MarcoDashboard } from './components/marco/MarcoDashboard';
import { User, AuthState } from './types/auth';

export default function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  const handleLoginSuccess = (user: User) => {
    setAuth({
      isAuthenticated: true,
      user,
      token: 'jwt-kapeh-session'
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  // Si no está autenticado, muestra la pantalla de Login
  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Vista principal para Lucía Méndez (Jefa de Trazabilidad)
  if (auth.user.role === 'JEFE_LOGISTICA') {
    return <LuciaDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Daniel López (Catador Q-Grader)
  if (auth.user.role === 'Q_GRADER') {
    return <DanielDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Elena Aguilar (Administradora Comercial)
  if (auth.user.role === 'ADMIN_COMERCIAL') {
    return <ElenaDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Marco Ruiz (Auditor de Calidad)
  if (auth.user.role === 'AUDITOR_CALIDAD') {
    return <MarcoDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Placeholder para los demás roles hasta recibir sus bocetos
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#26170D] antialiased flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-3xl text-[#241710]">
          Bienvenido, {auth.user.name}
        </h1>
        <p className="text-sm text-[#73655B]">
          Rol: {auth.user.roleTitle} — {auth.user.organization}
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#332017] hover:bg-[#23150e] transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
