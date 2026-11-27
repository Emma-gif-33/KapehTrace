import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { HealthStatus, Lote, PasaporteDigital } from '../../types/lotes';
import { obtenerPasaporte } from '../../services/api';
import { DatabaseStatusBadge } from '../shared/DatabaseStatusBadge';

const FILTROS = ['Todos', 'DISPONIBLE', 'LIQUIDADO', 'EN_CUARENTENA'] as const;
type FiltroEstado = (typeof FILTROS)[number];

interface ComercialInventarioViewProps {
  lotes: Lote[];
  health: HealthStatus | null;
}

export const ComercialInventarioView: React.FC<ComercialInventarioViewProps> = ({ lotes, health }) => {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pasaporte, setPasaporte] = useState<PasaporteDigital | null>(null);
  const [loadingPasaporte, setLoadingPasaporte] = useState(false);

  const lotesFiltrados = lotes.filter((lote) => {
    const matchesFilter = filtroEstado === 'Todos' || lote.estado === filtroEstado;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lote.codigo_lote.toLowerCase().includes(q) ||
      lote.variedad.toLowerCase().includes(q) ||
      lote.bodega_ubicacion.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleToggleRow = async (lote: Lote) => {
    if (selectedId === lote.id) {
      setSelectedId(null);
      setPasaporte(null);
      return;
    }
    setSelectedId(lote.id);
    setLoadingPasaporte(true);
    try {
      const res = await obtenerPasaporte(lote.id);
      setPasaporte(res.pasaporte);
    } finally {
      setLoadingPasaporte(false);
    }
  };

  const getBadgeClasses = (estado: string) => {
    if (estado === 'DISPONIBLE') {
      return { pill: 'bg-[#EEF5F0] text-[#356847]', dot: 'bg-[#4B7A58]' };
    }
    if (estado === 'EN_CUARENTENA') {
      return { pill: 'bg-[#F9EAE6] text-[#A84A3A]', dot: 'bg-[#B85645]' };
    }
    return { pill: 'bg-[#F7EFE4] text-[#9A6B2F]', dot: 'bg-[#B5823F]' };
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            POSTGRESQL · GET /API/LOTES & /PASAPORTE
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Inventario de lotes
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Control físico, comercial y consulta de contrato asociado por lote
          </p>
        </div>

        <DatabaseStatusBadge health={health} />
      </div>

      <div className="bg-white border border-[#EAE2D8] rounded-2xl shadow-[0_1px_2px_rgba(36,23,16,0.03)] overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2EDE4]">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#9B8E85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lote, bodega o variedad..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs sm:text-sm text-[#241710] placeholder-[#9B8E85] focus:outline-none focus:border-[#C07850]"
            />
          </div>

          <div className="inline-flex flex-wrap items-center bg-[#F7F3ED] p-1 rounded-xl border border-[#EAE2D8] self-start md:self-auto">
            {FILTROS.map((f) => {
              const active = filtroEstado === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroEstado(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[#241710] font-semibold shadow-2xs'
                      : 'text-[#73655B] hover:text-[#241710] font-medium'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F2EDE4] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B8E85]">
                <th className="py-3.5 px-6">LOTE / BODEGA</th>
                <th className="py-3.5 px-4">VARIEDAD</th>
                <th className="py-3.5 px-4">SACOS</th>
                <th className="py-3.5 px-4">SCA</th>
                <th className="py-3.5 px-4">ESTADO</th>
                <th className="py-3.5 px-6 text-right" aria-label="Detalle" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {lotesFiltrados.map((lote) => {
                const badge = getBadgeClasses(lote.estado);
                const isSelected = selectedId === lote.id;
                return (
                  <React.Fragment key={lote.id}>
                    <tr
                      onClick={() => handleToggleRow(lote)}
                      className="hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <span className="w-1 h-10 rounded-full flex-shrink-0 bg-[#8C583A]" />
                          <div>
                            <p className="text-xs font-bold text-[#241710] tracking-tight">
                              {lote.codigo_lote}
                            </p>
                            <p className="text-xs text-[#4B3D34] mt-0.5">{lote.tipo_lote}</p>
                            <p className="text-[11px] text-[#9B8E85]">{lote.bodega_ubicacion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#4B3D34] font-medium">
                        {lote.variedad}
                      </td>
                      <td className="py-4 px-4 font-serif text-lg text-[#241710]">
                        {lote.sacos_69kg}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-serif text-lg text-[#241710]">
                          {lote.score_calidad_sca ?? '—'}
                        </span>
                        {lote.score_calidad_sca && (
                          <span className="text-[11px] text-[#9B8E85] ml-1">pts</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {lote.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-[#9B8E85]">
                        <ChevronRight className={`w-4 h-4 inline-block transition-transform ${isSelected ? 'rotate-90 text-[#241710]' : ''}`} />
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="bg-[#FAF7F2]">
                        <td colSpan={6} className="px-6 py-4 text-xs text-[#73655B]">
                          {loadingPasaporte ? (
                            <span>Cargando pasaporte comercial de las 3 bases de datos...</span>
                          ) : pasaporte ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="font-semibold text-[#241710]">Valor comercial (PostgreSQL)</p>
                                <p className="mt-1">
                                  {pasaporte.comercial.peso_neto_kg.toLocaleString()} kg · ${pasaporte.comercial.precio_base_kg_usd} USD/kg
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-[#241710]">Contrato asociado</p>
                                <p className="mt-1">
                                  {pasaporte.comercial.contrato_asociado
                                    ? `${pasaporte.comercial.contrato_asociado.numero_contrato} · ${pasaporte.comercial.contrato_asociado.cliente} (${pasaporte.comercial.contrato_asociado.pais_destino})`
                                    : 'Sin contrato asignado aún'}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-[#241710]">Calidad y origen (Mongo + Neo4j)</p>
                                <p className="mt-1">
                                  SCA: {pasaporte.calidad_sensorial?.score_total ?? 'Sin evaluar'} · Origenes: {pasaporte.linaje_custodia.length}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {lotesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#9B8E85]">
                    No se encontraron lotes con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
