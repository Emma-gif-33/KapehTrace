import React, { useState } from 'react';
import {
  FlaskConical,
  Box,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

interface MuestraPendiente {
  id: string;
  lote: string;
  origen: string;
  variedad: string;
  proceso: string;
  tueste: string;
  estado: 'Pendiente' | 'Evaluada';
  puntaje?: number;
}

const INITIAL_MUESTRAS: MuestraPendiente[] = [
  { id: 'M-101', lote: 'LOT-CH-091', origen: 'Jaltenango', variedad: 'Bourbón', proceso: 'Lavado', tueste: 'Medio-claro (Agtron 62)', estado: 'Pendiente' },
  { id: 'M-102', lote: 'LOT-CH-094', origen: 'Ángel Albino Corzo', variedad: 'Typica', proceso: 'Lavado', tueste: 'Medio-claro (Agtron 64)', estado: 'Pendiente' },
  { id: 'M-103', lote: 'LOT-CH-098', origen: 'Los Altos', variedad: 'Caturra', proceso: 'Honey', tueste: 'Medio (Agtron 58)', estado: 'Pendiente' },
  { id: 'M-104', lote: 'LOT-CH-102', origen: 'Motozintla', variedad: 'Garnica', proceso: 'Natural', tueste: 'Medio-claro (Agtron 63)', estado: 'Pendiente' },
  { id: 'M-105', lote: 'LOT-CH-105', origen: 'San Cristóbal', variedad: 'Mundo Novo', proceso: 'Lavado', tueste: 'Medio-claro (Agtron 61)', estado: 'Pendiente' },
  { id: 'M-106', lote: 'LOT-CH-108', origen: 'Siltepec', variedad: 'Catuai', proceso: 'Lavado', tueste: 'Medio (Agtron 59)', estado: 'Pendiente' },
  { id: 'M-107', lote: 'LOT-CH-110', origen: 'Pantelhó', variedad: 'Bourbón', proceso: 'Honey', tueste: 'Medio-claro (Agtron 62)', estado: 'Pendiente' },
  { id: 'M-108', lote: 'LOT-CH-112', origen: 'El Ciprés', variedad: 'Typica', proceso: 'Lavado', tueste: 'Medio-claro (Agtron 63)', estado: 'Pendiente' },
];

const SCA_ATTRIBUTES = [
  'Fragancia / Aroma',
  'Sabor',
  'Retrogusto',
  'Acidez',
  'Cuerpo',
  'Balance',
  'Uniformidad',
  'Taza limpia',
  'Dulzor',
  'Apreciación general'
] as const;

export const CalidadCatacionView: React.FC = () => {
  const [muestras, setMuestras] = useState<MuestraPendiente[]>(INITIAL_MUESTRAS);
  const [selectedId, setSelectedId] = useState<string>('M-101');
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(SCA_ATTRIBUTES.map((attr) => [attr, attr === 'Uniformidad' || attr === 'Taza limpia' || attr === 'Dulzor' ? 10 : 8.25]))
  );
  const [descriptores, setDescriptores] = useState('Chocolate amargo, mandarina, panela, acidez cítrica brillante');

  const selectedMuestra = muestras.find((m) => m.id === selectedId) || muestras[0];
  const totalSCA = Object.values(scores).reduce((acc, v) => acc + v, 0);

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setMuestras((prev) =>
      prev.map((m) =>
        m.id === selectedMuestra.id
          ? { ...m, estado: 'Evaluada', puntaje: Number(totalSCA.toFixed(2)) }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          EVALUACIÓN SENSORIAL
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Calidad y catación
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Captura de los diez atributos SCA y notas de taza para las muestras en mesa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Lista de muestras en mesa */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D8] rounded-2xl p-4 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B3D34]">Muestras en mesa</span>
            <span className="text-[11px] text-[#9B8E85]">
              {muestras.filter((m) => m.estado === 'Pendiente').length} pendientes
            </span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {muestras.map((m) => {
              const isSelected = m.id === selectedMuestra.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F4EFE6] border-[#C07850]/60'
                      : 'bg-[#FAF7F2] border-[#EAE2D8] hover:border-[#C07850]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#241710]">{m.id}</span>
                      <span className="text-[11px] text-[#73655B]">· {m.lote}</span>
                    </div>
                    <p className="text-xs text-[#73655B] mt-0.5">
                      {m.origen} · {m.variedad} ({m.proceso})
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${
                    m.estado === 'Evaluada'
                      ? 'bg-[#EEF5F0] text-[#356847]'
                      : 'bg-white text-[#9A5B32] border border-[#E5DDD5]'
                  }`}>
                    {m.estado === 'Evaluada' ? `${m.puntaje} pts` : 'Pendiente'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ficha SCA de 10 atributos */}
        <form onSubmit={handleSaveEvaluation} className="lg:col-span-7 bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2EDE4] pb-4">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C07850]">
                FICHA SCA · {selectedMuestra.id}
              </span>
              <h3 className="font-serif text-2xl text-[#241710] mt-0.5">
                {selectedMuestra.lote} — {selectedMuestra.origen}
              </h3>
              <p className="text-xs text-[#73655B] mt-0.5">{selectedMuestra.tueste}</p>
            </div>
            <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl px-4 py-2.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[#9B8E85]">Puntaje SCA</span>
              <span className="font-serif text-3xl text-[#241710]">{totalSCA.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {SCA_ATTRIBUTES.map((attr) => (
              <div key={attr} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-[#4B3D34]">{attr}</label>
                  <span className="font-semibold text-[#241710]">{scores[attr].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={10}
                  step={0.25}
                  value={scores[attr]}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [attr]: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-[#6F4E37] cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1.5">
              Notas de taza (descriptores sensoriales)
            </label>
            <input
              type="text"
              value={descriptores}
              onChange={(e) => setDescriptores(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD5] text-sm text-[#241710] focus:outline-none focus:border-[#C07850]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Guardar ficha SCA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ParametrosFisicosView: React.FC = () => {
  const muestrasFisicas = [
    { lote: 'LOT-CH-091', humedad: '11.4%', aw: '0.56 Aw', densidad: '712 g/L', malla: '17/18 (88%)', defectos: '0 prim · 2 sec', estado: 'Aprobado' },
    { lote: 'LOT-CH-094', humedad: '11.7%', aw: '0.58 Aw', densidad: '705 g/L', malla: '16/17 (84%)', defectos: '0 prim · 3 sec', estado: 'Aprobado' },
    { lote: 'LOT-CH-098', humedad: '12.1%', aw: '0.60 Aw', densidad: '698 g/L', malla: '16/17 (81%)', defectos: '0 prim · 4 sec', estado: 'Revisión humedad' },
    { lote: 'LOT-CH-102', humedad: '11.2%', aw: '0.55 Aw', densidad: '718 g/L', malla: '17/18 (90%)', defectos: '0 prim · 1 sec', estado: 'Aprobado' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          ANÁLISIS DE GRANO VERDE
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Parámetros físicos
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Control de humedad, actividad de agua, densidad, granulometría y defectos físicos.
        </p>
      </div>

      <div className="bg-white border border-[#EAE2D8] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE2D8] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#73655B]">
                <th className="py-3.5 px-5 font-semibold">Lote</th>
                <th className="py-3.5 px-5 font-semibold">Humedad</th>
                <th className="py-3.5 px-5 font-semibold">Actividad Aw</th>
                <th className="py-3.5 px-5 font-semibold">Densidad</th>
                <th className="py-3.5 px-5 font-semibold">Malla</th>
                <th className="py-3.5 px-5 font-semibold">Defectos</th>
                <th className="py-3.5 px-5 font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4] text-sm">
              {muestrasFisicas.map((item) => (
                <tr key={item.lote} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#241710]">{item.lote}</td>
                  <td className="py-3.5 px-5 text-[#241710]">{item.humedad}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{item.aw}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{item.densidad}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{item.malla}</td>
                  <td className="py-3.5 px-5 text-[#73655B]">{item.defectos}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.estado === 'Aprobado'
                        ? 'bg-[#EEF5F0] text-[#356847]'
                        : 'bg-[#F7EFE6] text-[#9A5B32]'
                    }`}>
                      {item.estado === 'Aprobado' ? <Box className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                      {item.estado}
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

export const DictamenesSensorialesView: React.FC = () => {
  const dictamenes = [
    {
      folio: 'DIC-SCA-041',
      lote: 'LOT-CH-088 · Finca Santa Elena',
      puntaje: '87.50',
      clasificacion: 'Especialidad (Grado Q)',
      perfil: 'Jazmín, durazno, miel de abeja, acidez málica sedosa',
      estado: 'Emitido'
    },
    {
      folio: 'DIC-SCA-042',
      lote: 'LOT-CH-089 · Coop. Triunfo Verde',
      puntaje: '86.25',
      clasificacion: 'Especialidad (Grado Q)',
      perfil: 'Cacao, nuez tostada, naranja dulce, cuerpo cremoso',
      estado: 'Emitido'
    },
    {
      folio: 'DIC-SCA-043',
      lote: 'LOT-CH-090 · Beneficio El Ciprés',
      puntaje: '84.75',
      clasificacion: 'Especialidad',
      perfil: 'Caramelo, manzana roja, retrogusto limpio',
      estado: 'Emitido'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          CERTIFICADOS INTERNOS
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Dictámenes sensoriales
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Resoluciones oficiales de puntaje SCA y clasificación de especialidad por lote.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {dictamenes.map((d) => (
          <div key={d.folio} className="bg-white border border-[#EAE2D8] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-serif text-2xl text-[#241710]">{d.puntaje}</span>
              </div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#C07850] mt-4">
                {d.folio}
              </span>
              <h3 className="font-semibold text-sm text-[#241710] mt-1">{d.lote}</h3>
              <p className="text-xs text-[#73655B] mt-2 leading-relaxed">{d.perfil}</p>
            </div>

            <div className="pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs">
              <span className="font-medium text-[#4B3D34]">{d.clasificacion}</span>
              <span className="inline-flex items-center gap-1 text-[#356847] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {d.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
