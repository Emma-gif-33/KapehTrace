import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

type EstadoLote = 'Disponible' | 'En proceso' | 'Cuarentena';

interface LoteInventario {
  codigo: string;
  finca: string;
  ubicacion: string;
  variedad: string;
  sacos: number;
  sca: string;
  estado: EstadoLote;
  accentColor: string;
}

const LOTES_INVENTARIO: LoteInventario[] = [
  {
    codigo: 'CHS-24-0847',
    finca: 'Finca La Esperanza',
    ubicacion: 'Tenejapa · 1,680 msnm',
    variedad: 'Geisha',
    sacos: 48,
    sca: '88.5',
    estado: 'Disponible',
    accentColor: 'bg-[#8C583A]'
  },
  {
    codigo: 'CHS-24-0812',
    finca: 'Coop. Tseltal Kapeh',
    ubicacion: 'Chilón · 1,520 msnm',
    variedad: 'Bourbon',
    sacos: 72,
    sca: '86.75',
    estado: 'En proceso',
    accentColor: 'bg-[#5E8268]'
  },
  {
    codigo: 'CHS-24-0794',
    finca: 'Finca Santa Elena',
    ubicacion: 'Unión Juárez · 1,340 msnm',
    variedad: 'Caturra',
    sacos: 36,
    sca: '87.25',
    estado: 'Disponible',
    accentColor: 'bg-[#A8794C]'
  },
  {
    codigo: 'CHS-24-0761',
    finca: 'Productores Yaxalum',
    ubicacion: 'Oxchuc · 1,710 msnm',
    variedad: 'Typica',
    sacos: 24,
    sca: '84.5',
    estado: 'Cuarentena',
    accentColor: 'bg-[#4B3629]'
  }
];

const FILTROS: ('Todos' | EstadoLote)[] = ['Todos', 'Disponible', 'En proceso', 'Cuarentena'];

export const ElenaInventarioView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | EstadoLote>('Todos');
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);

  const lotesFiltrados = LOTES_INVENTARIO.filter((lote) => {
    const matchesFilter = filtroEstado === 'Todos' || lote.estado === filtroEstado;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lote.codigo.toLowerCase().includes(q) ||
      lote.finca.toLowerCase().includes(q) ||
      lote.variedad.toLowerCase().includes(q) ||
      lote.ubicacion.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const getBadgeClasses = (estado: EstadoLote) => {
    switch (estado) {
      case 'Disponible':
        return { pill: 'bg-[#EEF5F0] text-[#356847]', dot: 'bg-[#4B7A58]' };
      case 'En proceso':
        return { pill: 'bg-[#F7EFE4] text-[#9A6B2F]', dot: 'bg-[#B5823F]' };
      case 'Cuarentena':
        return { pill: 'bg-[#F9EAE6] text-[#A84A3A]', dot: 'bg-[#B85645]' };
    }
  };

  return (
    <div className="space-y-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            COSECHA 2024–2025
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Inventario de lotes
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Control físico y comercial de bodega
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Tarjeta de tabla */}
      <div className="bg-white border border-[#EAE2D8] rounded-2xl shadow-[0_1px_2px_rgba(36,23,16,0.03)] overflow-hidden">
        {/* Barra de búsqueda y filtros */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2EDE4]">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#9B8E85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lote, finca o variedad..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs sm:text-sm text-[#241710] placeholder-[#9B8E85] focus:outline-none focus:border-[#C07850]"
            />
          </div>

          <div className="inline-flex items-center bg-[#F7F3ED] p-1 rounded-xl border border-[#EAE2D8] self-start md:self-auto">
            {FILTROS.map((f) => {
              const active = filtroEstado === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroEstado(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
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

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F2EDE4] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B8E85]">
                <th className="py-3.5 px-6">LOTE / ORIGEN</th>
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
                const isSelected = selectedCodigo === lote.codigo;
                return (
                  <React.Fragment key={lote.codigo}>
                    <tr
                      onClick={() => setSelectedCodigo(isSelected ? null : lote.codigo)}
                      className="hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <span className={`w-1 h-10 rounded-full flex-shrink-0 ${lote.accentColor}`} />
                          <div>
                            <p className="text-xs font-bold text-[#241710] tracking-tight">
                              {lote.codigo}
                            </p>
                            <p className="text-xs text-[#4B3D34] mt-0.5">{lote.finca}</p>
                            <p className="text-[11px] text-[#9B8E85]">{lote.ubicacion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#4B3D34] font-medium">
                        {lote.variedad}
                      </td>
                      <td className="py-4 px-4 font-serif text-lg text-[#241710]">
                        {lote.sacos}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-serif text-lg text-[#241710]">{lote.sca}</span>
                        <span className="text-[11px] text-[#9B8E85] ml-1">pts</span>
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
                        <td colSpan={6} className="px-6 py-3.5 text-xs text-[#73655B]">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span>
                              Lote <strong className="text-[#241710]">{lote.codigo}</strong> · {lote.finca} ({lote.ubicacion}) · {lote.sacos} sacos de 69 kg listos para asignación comercial.
                            </span>
                            <span className="font-semibold text-[#C07850]">
                              Puntaje SCA certificado: {lote.sca} pts
                            </span>
                          </div>
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
