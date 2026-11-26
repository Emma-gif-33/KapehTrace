import React, { useState } from 'react';
import {
  Leaf,
  Box,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

interface RecepcionItem {
  id: string;
  productor: string;
  region: string;
  variedad: string;
  kilos: number;
  humedad: string;
  hora: string;
  estado: 'Validada' | 'En báscula';
}

const INITIAL_RECEPCIONES: RecepcionItem[] = [
  { id: 'REC-2401', productor: 'Finca Santa Elena', region: 'Jaltenango, Chiapas', variedad: 'Bourbón', kilos: 640, humedad: '11.4%', hora: '08:15', estado: 'Validada' },
  { id: 'REC-2402', productor: 'Coop. Triunfo Verde', region: 'Ángel Albino Corzo', variedad: 'Typica', kilos: 920, humedad: '11.8%', hora: '09:02', estado: 'Validada' },
  { id: 'REC-2403', productor: 'Parcela San Pedro', region: 'San Cristóbal', variedad: 'Caturra', kilos: 480, humedad: '12.1%', hora: '09:40', estado: 'Validada' },
  { id: 'REC-2404', productor: 'Familia Gómez', region: 'Pantelhó, Los Altos', variedad: 'Mundo Novo', kilos: 515, humedad: '11.6%', hora: '10:18', estado: 'Validada' },
  { id: 'REC-2405', productor: 'Beneficio El Ciprés', region: 'Motozintla', variedad: 'Garnica', kilos: 780, humedad: '11.9%', hora: '11:05', estado: 'Validada' },
  { id: 'REC-2406', productor: 'Rancho La Cumbre', region: 'Siltepec, Chiapas', variedad: 'Catuai', kilos: 390, humedad: '12.0%', hora: '11:42', estado: 'En báscula' },
];

export const RecepcionCosechasView: React.FC = () => {
  const [recepciones, setRecepciones] = useState<RecepcionItem[]>(INITIAL_RECEPCIONES);
  const [showForm, setShowForm] = useState(false);
  const [productor, setProductor] = useState('');
  const [region, setRegion] = useState('Los Altos, Chiapas');
  const [variedad, setVariedad] = useState('Bourbón');
  const [kilos, setKilos] = useState('450');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productor.trim()) return;
    const nuevo: RecepcionItem = {
      id: `REC-240${recepciones.length + 1}`,
      productor: productor.trim(),
      region,
      variedad,
      kilos: Number(kilos) || 400,
      humedad: '11.5%',
      hora: 'Ahora',
      estado: 'Validada'
    };
    setRecepciones([nuevo, ...recepciones]);
    setProductor('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
            ENTRADAS EN BENEFICIO
          </span>
          <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
            Recepción de cosechas
          </h2>
          <p className="text-sm text-[#73655B] mt-1">
            Registro de entregas diarias por productor, región y control de humedad.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#332017] text-white text-xs font-semibold hover:bg-[#23150e] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar recepción</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-[#EAE2D8] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Productor / Finca</label>
            <input
              type="text"
              value={productor}
              onChange={(e) => setProductor(e.target.value)}
              placeholder="Ej. Finca El Porvenir"
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Región</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Variedad</label>
            <input
              type="text"
              value={variedad}
              onChange={(e) => setVariedad(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Peso (kg)</label>
              <input
                type="number"
                value={kilos}
                onChange={(e) => setKilos(e.target.value)}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#C07850] text-white text-xs font-semibold hover:bg-[#a86440] transition-colors cursor-pointer h-[38px]"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#EAE2D8] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE2D8] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#73655B]">
                <th className="py-3.5 px-5 font-semibold">Folio</th>
                <th className="py-3.5 px-5 font-semibold">Productor</th>
                <th className="py-3.5 px-5 font-semibold">Región</th>
                <th className="py-3.5 px-5 font-semibold">Variedad</th>
                <th className="py-3.5 px-5 font-semibold">Peso</th>
                <th className="py-3.5 px-5 font-semibold">Humedad</th>
                <th className="py-3.5 px-5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4] text-sm">
              {recepciones.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#241710]">{r.id}</td>
                  <td className="py-3.5 px-5 text-[#241710]">{r.productor}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{r.region}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{r.variedad}</td>
                  <td className="py-3.5 px-5 font-medium text-[#241710]">{r.kilos} kg</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{r.humedad}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.estado === 'Validada'
                        ? 'bg-[#EEF5F0] text-[#356847]'
                        : 'bg-[#F7EFE6] text-[#9A5B32]'
                    }`}>
                      {r.estado === 'Validada' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ProcesosMezclasView: React.FC = () => {
  const [mx024Closed, setMx024Closed] = useState(false);

  const lotesEnProceso = [
    { codigo: 'LOT-CH-108', proceso: 'Lavado fermentación 36h', avance: '75%', peso: '1,120 kg', responsable: 'Beneficio Los Altos' },
    { codigo: 'LOT-CH-112', proceso: 'Secado en patios', avance: '50%', peso: '890 kg', responsable: 'Beneficio El Ciprés' },
    { codigo: 'LOT-CH-115', proceso: 'Honey dorado en cama', avance: '90%', peso: '640 kg', responsable: 'San Cristóbal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          TRANSFORMACIONES Y ENSAMBLES
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Procesos y mezclas
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Control de beneficios activos y confirmación de proporciones en mezclas de exportación.
        </p>
      </div>

      {/* Tarjeta destacada MX-024 */}
      <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EDE4] pb-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C07850]">
              {mx024Closed ? 'MEZCLA CONFIRMADA' : 'PENDIENTE DE CIERRE'}
            </span>
            <h3 className="font-serif text-2xl text-[#241710] mt-1">
              Mezcla MX-024 · Perfil Altura Chiapas
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setMx024Closed(true)}
            disabled={mx024Closed}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              mx024Closed
                ? 'bg-[#EEF5F0] text-[#356847] cursor-default'
                : 'bg-[#332017] text-white hover:bg-[#23150e]'
            }`}
          >
            {mx024Closed ? 'Proporciones confirmadas ✓' : 'Confirmar proporción y cerrar'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { lote: 'LOT-CH-091', origen: 'Jaltenango · Bourbón', porcentaje: '45%', kilos: '1,350 kg' },
            { lote: 'LOT-CH-094', origen: 'Ángel Albino Corzo · Typica', porcentaje: '35%', kilos: '1,050 kg' },
            { lote: 'LOT-CH-098', origen: 'Los Altos · Caturra', porcentaje: '20%', kilos: '600 kg' },
          ].map((item) => (
            <div key={item.lote} className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#241710]">{item.lote}</span>
                <span className="font-serif text-xl text-[#C07850]">{item.porcentaje}</span>
              </div>
              <p className="text-xs text-[#73655B] mt-1">{item.origen}</p>
              <p className="text-xs font-medium text-[#241710] mt-2">{item.kilos}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lotes en transformación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lotesEnProceso.map((l) => (
          <div key={l.codigo} className="bg-white border border-[#EAE2D8] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37]">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#C07850]">{l.avance}</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#241710]">{l.codigo}</h4>
              <p className="text-xs text-[#73655B] mt-0.5">{l.proceso}</p>
            </div>
            <div className="pt-2 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#73655B]">
              <span>{l.responsable}</span>
              <span className="font-semibold text-[#241710]">{l.peso}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrazabilidadView: React.FC = () => {
  const [query, setQuery] = useState('MX-024');

  const cadena = [
    { etapa: 'Origen en finca', codigo: 'REC-2401 / REC-2402', detalle: 'Finca Santa Elena y Coop. Triunfo Verde · Cosecha 2024–2025', fecha: '14 Nov' },
    { etapa: 'Beneficio húmedo y secado', codigo: 'LOT-CH-091 / 094 / 098', detalle: 'Fermentación controlada 36h · Humedad final 11.4%', fecha: '18 Nov' },
    { etapa: 'Ensamble de mezcla', codigo: 'MX-024', detalle: 'Proporción 45% / 35% / 20% · Total 3,000 kg', fecha: '22 Nov' },
    { etapa: 'Asignación a contenedor', codigo: 'CONT-EXP-02', detalle: 'Estiba programada · Puerto de salida Veracruz', fecha: 'Pendiente' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
            CADENA DE CUSTODIA
          </span>
          <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
            Trazabilidad
          </h2>
          <p className="text-sm text-[#73655B] mt-1">
            Consulta el linaje completo desde la recepción en campo hasta el embarque.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9B8E85] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lote o mezcla..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710] focus:outline-none focus:border-[#C07850]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs text-[#73655B]">Mostrando ruta de custodia para</span>
            <h3 className="font-serif text-2xl text-[#241710]">{query || 'MX-024'}</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#356847] bg-[#EEF5F0] px-3 py-1 rounded-full">
            <Leaf className="w-3.5 h-3.5" />
            Sin rupturas registradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cadena.map((paso, idx) => (
            <div key={paso.etapa} className="relative bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#C07850] uppercase tracking-wider mb-2">
                  <span>Paso 0{idx + 1}</span>
                  <span className="text-[#9B8E85]">{paso.fecha}</span>
                </div>
                <h4 className="font-semibold text-sm text-[#241710]">{paso.etapa}</h4>
                <p className="text-xs font-mono text-[#6F4E37] mt-1">{paso.codigo}</p>
                <p className="text-xs text-[#73655B] mt-2 leading-relaxed">{paso.detalle}</p>
              </div>
              {idx < cadena.length - 1 && (
                <div className="hidden md:flex items-center justify-end mt-3 text-[#C07850]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContenedoresView: React.FC = () => {
  const contenedores = [
    {
      id: 'CONT-EXP-01',
      destino: 'Hamburgo, Alemania',
      mezcla: 'MX-021 · Soconusco Lavado',
      sacos: '275 sacos (19,250 kg)',
      estiba: 'Estiba confirmada',
      estado: 'Listo para despacho'
    },
    {
      id: 'CONT-EXP-02',
      destino: 'Tokio, Japón',
      mezcla: 'MX-024 · Altura Chiapas (parcial)',
      sacos: '180 sacos programados',
      estiba: '1 estiba asignada',
      estado: 'Esperando cierre de mezcla'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          LOGÍSTICA DE EMBARQUE
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Contenedores
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Asignación de estibas, capacidad y documentación de salida para exportación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contenedores.map((c) => (
          <div key={c.id} className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#241710]">{c.id}</h3>
                  <p className="text-xs text-[#73655B]">{c.destino}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF7F2] border border-[#E5DDD5] text-[#4B3D34]">
                <PackageCheck className="w-3.5 h-3.5 text-[#C07850]" />
                {c.estiba}
              </span>
            </div>

            <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#73655B]">Mezcla asignada:</span>
                <span className="font-semibold text-[#241710]">{c.mezcla}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73655B]">Carga:</span>
                <span className="font-semibold text-[#241710]">{c.sacos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#73655B]">Estatus:</span>
                <span className="font-semibold text-[#C07850]">{c.estado}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
