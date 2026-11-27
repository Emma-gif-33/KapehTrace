import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutGrid,
  Box,
  TrendingUp,
  AlertTriangle,
  Bell,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { User } from '../../types/auth';
import { HealthStatus, Lote } from '../../types/lotes';
import { checkHealth, fetchLotes } from '../../services/api';
import { DatabaseStatusBadge } from '../shared/DatabaseStatusBadge';
import { ComercialInventarioView } from './ComercialInventarioView';

export type ComercialSection = 'resumen' | 'inventario';

interface ComercialDashboardProps {
  user: User;
  onLogout: () => void;
}

const HEADER_TITLES: Record<ComercialSection, string> = {
  resumen: 'Inventario y compromisos, conciliados.',
  inventario: 'Inventario de lotes'
};

export const ComercialDashboard: React.FC<ComercialDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<ComercialSection>('resumen');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const loadData = useCallback(async () => {
    const [healthData, lotesData] = await Promise.all([checkHealth(), fetchLotes()]);
    setHealth(healthData);
    setLotes(lotesData.lotes);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navItems: { id: ComercialSection; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'inventario', label: 'Inventario y pasaporte', icon: <Box className="w-4 h-4" /> }
  ];

  const handleNavigate = (section: ComercialSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const disponibles = lotes.filter((l) => l.estado === 'DISPONIBLE');
  const sacosDisponibles = disponibles.reduce((acc, l) => acc + l.sacos_69kg, 0);
  const valorInventario = Math.round(
    disponibles.reduce((acc, l) => acc + l.peso_neto_kg * l.precio_base_kg_usd, 0) / 1000
  );
  const enCuarentena = lotes.filter((l) => l.estado === 'EN_CUARENTENA').length;
  const liquidados = lotes.filter((l) => l.estado === 'LIQUIDADO').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241710] flex flex-col lg:flex-row font-sans">
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-[#FCFBF9] border-r border-[#EAE2D8] flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="px-6 pt-6 pb-5 border-b border-[#F2EDE4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg
                width="22"
                height="26"
                viewBox="0 0 24 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform -rotate-12 flex-shrink-0"
              >
                <ellipse cx="8" cy="14" rx="5.5" ry="10.5" stroke="#8C583A" strokeWidth="2" fill="#8C583A" fillOpacity="0.85" />
                <path d="M8 4 C7 10, 9 18, 8 24" stroke="#FCFBF9" strokeWidth="1.4" strokeLinecap="round" />
                <ellipse cx="16.5" cy="14" rx="5.5" ry="10.5" stroke="#C07850" strokeWidth="2" fill="#C07850" fillOpacity="0.9" />
                <path d="M16.5 4 C15.5 10, 17.5 18, 16.5 24" stroke="#FCFBF9" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <div>
                <div className="font-serif text-[20px] leading-none tracking-tight text-[#241710] font-medium">
                  Kapeh<span className="text-[#9E6040]">Trace</span>
                </div>
                <span className="block text-[8px] font-semibold tracking-[0.22em] uppercase text-[#B57B59] mt-1">
                  ORIGEN QUE TRASCIENDE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#73655B] hover:bg-[#F2EDE4]"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 pt-6">
            <div className="px-2 mb-4">
              <span className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85]">
                ESPACIO DE TRABAJO
              </span>
              <span className="block text-xs text-[#73655B] mt-0.5">
                {user.name}
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#EFE9E0] text-[#241710] font-semibold'
                        : 'text-[#6D5F55] hover:bg-[#F5F0E8] hover:text-[#241710] font-medium'
                    }`}
                  >
                    <span className={isActive ? 'text-[#5A3E2E]' : 'text-[#8C7D72]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            className="w-full p-3 rounded-2xl bg-white border border-[#EAE2D8] hover:border-[#C07850] transition-colors flex items-center justify-between gap-2.5 text-left cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#332017] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                AC
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#241710] truncate">{user.name}</p>
                <p className="text-[11px] text-[#73655B] truncate">Cambiar de rol</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#73655B] group-hover:text-[#241710] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[74px] bg-[#FCFBF9] border-b border-[#EAE2D8] px-5 sm:px-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#EAE2D8] bg-white text-[#241710]"
              aria-label="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#9B8E85]">
                KAPEHTRACE
              </span>
              <p className="font-serif text-base sm:text-lg text-[#241710] leading-tight">
                {HEADER_TITLES[activeSection]}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-xl bg-white border border-[#EAE2D8] hover:border-[#C07850] flex items-center justify-center text-[#4B3D34] transition-colors cursor-pointer relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#C07850] absolute top-2.5 right-2.5" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#EAE2D8] rounded-2xl shadow-xl p-4 z-30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C07850]">
                    Resumen comercial
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#9B8E85] hover:text-[#241710]"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D8] text-xs space-y-1">
                  <p className="font-semibold text-[#241710]">{sacosDisponibles} sacos disponibles</p>
                  <p className="text-[#73655B]">
                    Consulta cada lote en Inventario para ver su contrato asociado en PostgreSQL.
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1320px] w-full mx-auto">
          {activeSection === 'resumen' && (
            <div className="space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
                    COSECHA 2024–2025
                  </span>
                  <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
                    Inventario y compromisos, conciliados.
                  </h1>
                  <p className="text-sm text-[#73655B] mt-2.5">
                    Stock disponible y contratos asociados consultados directamente en PostgreSQL.
                  </p>
                </div>

                <DatabaseStatusBadge health={health} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: 'Sacos disponibles',
                    value: String(sacosDisponibles),
                    icon: <Box className="w-4 h-4 text-[#6F4E37]" />
                  },
                  {
                    label: 'Valor disponible',
                    value: `$${valorInventario}K`,
                    icon: <TrendingUp className="w-4 h-4 text-[#6F4E37]" />
                  },
                  {
                    label: 'Lotes liquidados',
                    value: String(liquidados).padStart(2, '0'),
                    icon: <Box className="w-4 h-4 text-[#6F4E37]" />
                  },
                  {
                    label: 'En cuarentena',
                    value: String(enCuarentena).padStart(2, '0'),
                    icon: <AlertTriangle className="w-4 h-4 text-[#6F4E37]" />
                  }
                ].map((kpi) => (
                  <button
                    key={kpi.label}
                    type="button"
                    onClick={() => handleNavigate('inventario')}
                    className="bg-white border border-[#EAE2D8] hover:border-[#C07850]/70 rounded-2xl p-6 text-left transition-all cursor-pointer shadow-[0_1px_2px_rgba(36,23,16,0.03)]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] flex items-center justify-center mb-5">
                      {kpi.icon}
                    </div>
                    <p className="text-xs text-[#73655B] font-medium">{kpi.label}</p>
                    <p className="font-serif text-4xl text-[#241710] mt-1 tracking-tight">{kpi.value}</p>
                  </button>
                ))}
              </div>

              <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block mb-1.5">
                    PASAPORTE DIGITAL COMERCIAL
                  </span>
                  <h2 className="font-serif text-2xl text-[#241710] font-normal">
                    Consulta inventario, valor USD y contrato asociado por lote
                  </h2>
                  <p className="text-xs sm:text-sm text-[#73655B] mt-1.5">
                    Haz clic en cualquier lote dentro del inventario para ver su pasaporte completo en PostgreSQL, MongoDB y Neo4j.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate('inventario')}
                  className="px-5 py-2.5 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
                >
                  Abrir inventario →
                </button>
              </div>
            </div>
          )}

          {activeSection === 'inventario' && (
            <ComercialInventarioView lotes={lotes} health={health} />
          )}
        </main>
      </div>
    </div>
  );
};
