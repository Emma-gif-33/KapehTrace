import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutGrid,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Bell,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { User } from '../../types/auth';
import { HealthStatus, Lote } from '../../types/lotes';
import { checkHealth, fetchLotes } from '../../services/api';
import { DatabaseStatusBadge } from '../shared/DatabaseStatusBadge';
import {
  CalidadCatacionView,
  PasaporteSensorialView
} from './DanielModules';

export type DanielSection =
  | 'resumen'
  | 'calidad'
  | 'dictamenes';

interface DanielDashboardProps {
  user: User;
  onLogout: () => void;
}

export const DanielDashboard: React.FC<DanielDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<DanielSection>('resumen');
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

  const navItems: { id: DanielSection; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'calidad', label: 'Calidad y catación', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'dictamenes', label: 'Dictámenes y pasaporte', icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  const handleNavigate = (section: DanielSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const evaluados = lotes.filter((l) => l.score_calidad_sca !== null);
  const pendientes = lotes.length - evaluados.length;
  const promedioSca =
    evaluados.length > 0
      ? (evaluados.reduce((acc, l) => acc + (l.score_calidad_sca || 0), 0) / evaluados.length).toFixed(1)
      : '0.0';
  const especialidadPct =
    evaluados.length > 0
      ? Math.round((evaluados.filter((l) => (l.score_calidad_sca || 0) >= 85).length / evaluados.length) * 100)
      : 0;

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
                QG
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
                La calidad de cada taza, documentada.
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
                    Alertas de catación
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
                  <p className="font-semibold text-[#241710]">
                    {evaluados.length} lotes con evaluación SCA
                  </p>
                  <p className="text-[#73655B]">
                    {pendientes} lotes pendientes de ficha en MongoDB.
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
                    La calidad de cada taza, documentada.
                  </h1>
                  <p className="text-sm text-[#73655B] mt-2.5">
                    Evaluaciones SCA en MongoDB y replicación de puntaje en PostgreSQL.
                  </p>
                </div>

                <DatabaseStatusBadge health={health} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: 'Sin evaluar',
                    value: String(pendientes).padStart(2, '0'),
                    icon: <FlaskConical className="w-4 h-4 text-[#6F4E37]" />,
                    target: 'calidad' as DanielSection
                  },
                  {
                    label: 'Lotes evaluados',
                    value: String(evaluados.length).padStart(2, '0'),
                    icon: <LayoutGrid className="w-4 h-4 text-[#6F4E37]" />,
                    target: 'dictamenes' as DanielSection
                  },
                  {
                    label: 'Promedio SCA',
                    value: promedioSca,
                    icon: <TrendingUp className="w-4 h-4 text-[#6F4E37]" />,
                    target: 'dictamenes' as DanielSection
                  },
                  {
                    label: 'Especialidad (≥85)',
                    value: `${especialidadPct}%`,
                    icon: <Leaf className="w-4 h-4 text-[#6F4E37]" />,
                    target: 'dictamenes' as DanielSection
                  }
                ].map((kpi) => (
                  <button
                    key={kpi.label}
                    type="button"
                    onClick={() => handleNavigate(kpi.target)}
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-8 bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block mb-1.5">
                        ACTIVIDAD DE TU ROL
                      </span>
                      <h2 className="font-serif text-2xl text-[#241710] font-normal">
                        Flujo principal
                      </h2>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37] flex-shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {[
                      {
                        title: 'Fichas SCA',
                        stat: `${evaluados.length} registradas`,
                        target: 'calidad' as DanielSection
                      },
                      {
                        title: 'Catación',
                        stat: '10 atributos SCA',
                        target: 'calidad' as DanielSection
                      },
                      {
                        title: 'Pasaporte',
                        stat: 'Consulta MongoDB',
                        target: 'dictamenes' as DanielSection
                      }
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 flex flex-col justify-between min-h-[112px]"
                      >
                        <div>
                          <p className="text-xs text-[#73655B]">{card.title}</p>
                          <p className="text-sm font-bold text-[#241710] mt-1">{card.stat}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavigate(card.target)}
                          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#9E6040] hover:text-[#241710] transition-colors cursor-pointer w-fit"
                        >
                          <span>Abrir módulo</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37] mb-5">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block mb-1.5">
                      SIGUIENTE ACCIÓN
                    </span>
                    <h2 className="font-serif text-2xl text-[#241710] font-normal leading-snug">
                      Mesa de catación lista
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#73655B] mt-3 leading-relaxed">
                      Captura los diez atributos sensoriales de cualquier lote y replícalos en PostgreSQL.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('calidad')}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#241710] hover:text-[#9E6040] transition-colors cursor-pointer w-fit"
                  >
                    <span>Comenzar evaluación SCA</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calidad' && (
            <CalidadCatacionView lotes={lotes} onRefresh={loadData} />
          )}
          {activeSection === 'dictamenes' && <PasaporteSensorialView lotes={lotes} />}
        </main>
      </div>
    </div>
  );
};
