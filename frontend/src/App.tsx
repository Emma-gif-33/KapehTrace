import { useState } from 'react';
import { Login } from './components/Login';
import { TrazabilidadDashboard } from './components/trazabilidad/TrazabilidadDashboard';
import { CatadorDashboard } from './components/catador/CatadorDashboard';
import { ComercialDashboard } from './components/comercial/ComercialDashboard';
import { AuditorDashboard } from './components/auditor/AuditorDashboard';
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

  // Vista principal para Jefe de Trazabilidad
  if (auth.user.role === 'JEFE_LOGISTICA') {
    return <TrazabilidadDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Catador Q-Grader
  if (auth.user.role === 'Q_GRADER') {
    return <CatadorDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Administradora Comercial
  if (auth.user.role === 'ADMIN_COMERCIAL') {
    return <ComercialDashboard user={auth.user} onLogout={handleLogout} />;
  }

  // Vista principal para Auditor de Calidad
  if (auth.user.role === 'AUDITOR_CALIDAD') {
    return <AuditorDashboard user={auth.user} onLogout={handleLogout} />;
  }

  return null;
}
