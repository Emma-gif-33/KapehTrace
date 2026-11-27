import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Lote, PasaporteDigital } from '../../types/lotes';
import { registrarFichaCalidad, obtenerPasaporte } from '../../services/api';

const SCA_KEYS = [
  { key: 'fragancia_aroma', label: 'Fragancia / Aroma' },
  { key: 'sabor', label: 'Sabor' },
  { key: 'sabor_residual', label: 'Sabor residual' },
  { key: 'acidez', label: 'Acidez' },
  { key: 'cuerpo', label: 'Cuerpo' },
  { key: 'uniformidad', label: 'Uniformidad' },
  { key: 'balance', label: 'Balance' },
  { key: 'taza_limpia', label: 'Taza limpia' },
  { key: 'dulzor', label: 'Dulzor' },
  { key: 'puntaje_catador', label: 'Puntaje catador' }
] as const;

type ScaKey = (typeof SCA_KEYS)[number]['key'];

interface CatadorViewProps {
  lotes: Lote[];
  onRefresh: () => Promise<void>;
}

export const CalidadCatacionView: React.FC<CatadorViewProps> = ({ lotes, onRefresh }) => {
  const [selectedId, setSelectedId] = useState<number>(lotes[0]?.id || 1);
  const selectedLote = lotes.find((l) => l.id === selectedId) || lotes[0];

  const [licencia, setLicencia] = useState('Q-2026-CH');
  const [humedad, setHumedad] = useState('11.4');
  const [aw, setAw] = useState('0.56');
  const [densidad, setDensidad] = useState('712');
  const [tueste, setTueste] = useState('62');
  const [notasInput, setNotasInput] = useState('Chocolate amargo, Mandarina, Panela');
  const [conclusion, setConclusion] = useState('Perfil limpio de altura apto para exportación.');
  const [scores, setScores] = useState<Record<ScaKey, number>>({
    fragancia_aroma: 8.5,
    sabor: 8.5,
    sabor_residual: 8.25,
    acidez: 8.5,
    cuerpo: 8.25,
    uniformidad: 10,
    balance: 8.5,
    taza_limpia: 10,
    dulzor: 10,
    puntaje_catador: 8.5
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const totalSCA = Object.values(scores).reduce((acc, v) => acc + v, 0);

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLote) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const notas = notasInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await registrarFichaCalidad({
        lote_id: selectedLote.id,
        codigo_lote: selectedLote.codigo_lote,
        catador: {
          nombre: 'Catador Q-Grader',
          q_grader_licencia: licencia.trim() || 'Q-2026-CH',
          laboratorio_sede: 'Laboratorio KapehTrace Chiapas'
        },
        muestra: {
          humedad_porcentaje: Number(humedad) || 11.4,
          actividad_agua_aw: Number(aw) || 0.56,
          densidad_aparente_gl: Number(densidad) || 710,
          tueste_agtron: Number(tueste) || 62
        },
        puntajes_sca: scores,
        notas_cata: notas.length > 0 ? notas : ['Notas balanceadas'],
        conclusion: conclusion.trim() || undefined
      });
      await onRefresh();
      setFeedback({
        type: 'ok',
        text: res.online
          ? `Ficha SCA guardada correctamente con un puntaje de ${res.score_total} pts.`
          : `Score (${res.score_total}) guardado en respaldo local (${res.categoria}).`
      });
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
          EVALUACIÓN SENSORIAL · PROTOCOLO SCA
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Calidad y catación SCA
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Captura los 10 atributos SCA y parámetros físicos de la muestra para registrar su calificación oficial.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-[#EEF5F0] border-[#CDE0D3] text-[#356847]'
              : 'bg-[#F9EAE6] border-[#EAD0CA] text-[#A84A3A]'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 bg-white border border-[#EAE2D8] rounded-2xl p-4 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B3D34]">Lotes disponibles</span>
            <span className="text-[11px] text-[#9B8E85]">{lotes.length} lotes</span>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {lotes.map((l) => {
              const isSelected = l.id === selectedLote?.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F4EFE6] border-[#C07850]/60'
                      : 'bg-[#FAF7F2] border-[#EAE2D8] hover:border-[#C07850]/40'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-[#241710] block">{l.codigo_lote}</span>
                    <p className="text-[11px] text-[#73655B] mt-0.5">
                      {l.variedad} · {l.tipo_lote}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${
                    l.score_calidad_sca
                      ? 'bg-[#EEF5F0] text-[#356847]'
                      : 'bg-white text-[#9A5B32] border border-[#E5DDD5]'
                  }`}>
                    {l.score_calidad_sca ? `${l.score_calidad_sca} pts` : 'Sin score'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSaveEvaluation} className="lg:col-span-8 bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2EDE4] pb-4">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C07850]">
                FICHA SCA · LOTE #{selectedLote?.id}
              </span>
              <h3 className="font-serif text-2xl text-[#241710] mt-0.5">
                {selectedLote?.codigo_lote} — {selectedLote?.variedad}
              </h3>
              <p className="text-xs text-[#73655B] mt-0.5">{selectedLote?.bodega_ubicacion}</p>
            </div>
            <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl px-4 py-2.5 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[#9B8E85]">Puntaje SCA</span>
              <span className="font-serif text-3xl text-[#241710]">{totalSCA.toFixed(2)}</span>
            </div>
          </div>

          {/* Parámetros físicos de muestra */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Licencia Q</label>
              <input
                type="text"
                value={licencia}
                onChange={(e) => setLicencia(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD5] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Humedad (%)</label>
              <input
                type="number"
                step="0.1"
                min={5}
                max={16}
                value={humedad}
                onChange={(e) => setHumedad(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD5] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Aw</label>
              <input
                type="number"
                step="0.01"
                min={0.1}
                max={0.9}
                value={aw}
                onChange={(e) => setAw(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD5] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Densidad (g/L)</label>
              <input
                type="number"
                value={densidad}
                onChange={(e) => setDensidad(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD5] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Agtron</label>
              <input
                type="number"
                value={tueste}
                onChange={(e) => setTueste(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD5] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {SCA_KEYS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-[#4B3D34]">{label}</label>
                  <span className="font-semibold text-[#241710]">{scores[key].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={10}
                  step={0.25}
                  value={scores[key]}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-[#6F4E37] cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1.5">
                Notas de cata (separadas por coma)
              </label>
              <input
                type="text"
                value={notasInput}
                onChange={(e) => setNotasInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5DDD5] text-xs sm:text-sm text-[#241710] focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1.5">
                Conclusión sensorial
              </label>
              <input
                type="text"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5DDD5] text-xs sm:text-sm text-[#241710] focus:outline-none focus:border-[#C07850]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{submitting ? 'Guardando...' : 'Guardar ficha SCA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PasaporteSensorialView: React.FC<{ lotes: Lote[] }> = ({ lotes }) => {
  const [selectedId, setSelectedId] = useState<number>(lotes.find((l) => l.score_calidad_sca)?.id || lotes[0]?.id || 1);
  const [pasaporte, setPasaporte] = useState<PasaporteDigital | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    setLoading(true);
    try {
      const res = await obtenerPasaporte(selectedId);
      setPasaporte(res.pasaporte);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
            HISTORIAL DE CATACIÓN · PROTOCOLO SCA
          </span>
          <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
            Dictámenes y pasaporte sensorial
          </h2>
          <p className="text-sm text-[#73655B] mt-1">
            Consulta la ficha SCA registrada junto con los parámetros físicos de la muestra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710]"
          >
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.codigo_lote} ({l.score_calidad_sca ? `${l.score_calidad_sca} pts` : 'Sin score'})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleConsultar}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Ver dictamen'}
          </button>
        </div>
      </div>

      {!pasaporte && (
        <div className="bg-white border border-[#EAE2D8] rounded-2xl p-8 text-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#C07850] mx-auto" />
          <p className="text-sm font-semibold text-[#241710]">Selecciona un lote y presiona "Ver dictamen"</p>
          <p className="text-xs text-[#73655B]">
            Muestra la evaluación sensorial y los atributos registrados en el pasaporte del lote.
          </p>
        </div>
      )}

      {pasaporte && (
        <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EDE4] pb-4">
            <div>
              <span className="text-xs text-[#73655B]">Lote #{pasaporte.comercial.id}</span>
              <h3 className="font-serif text-2xl text-[#241710]">
                {pasaporte.comercial.codigo_lote} · {pasaporte.comercial.variedad}
              </h3>
            </div>
            {pasaporte.calidad_sensorial ? (
              <div className="px-4 py-2 rounded-xl bg-[#EEF5F0] text-[#356847] text-center">
                <span className="block text-[10px] uppercase tracking-wider">Score SCA</span>
                <span className="font-serif text-2xl">{pasaporte.calidad_sensorial.score_total}</span>
              </div>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#F7EFE6] text-[#9A5B32] text-xs font-medium">
                Sin ficha SCA registrada
              </span>
            )}
          </div>

          {pasaporte.calidad_sensorial && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-[#241710]">Desglose de atributos</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(pasaporte.calidad_sensorial.puntajes_desglose).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#73655B]">{k}</span>
                      <span className="font-semibold text-[#241710]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-[#241710]">Notas de cata y muestra</p>
                <div className="flex flex-wrap gap-1.5">
                  {pasaporte.calidad_sensorial.notas_cata.map((n) => (
                    <span key={n} className="px-2.5 py-1 rounded-full bg-white border border-[#E5DDD5] text-[#4B3D34]">
                      {n}
                    </span>
                  ))}
                </div>
                {pasaporte.calidad_sensorial.muestra && (
                  <p className="text-[#73655B] pt-2">
                    Humedad: {pasaporte.calidad_sensorial.muestra.humedad_porcentaje ?? 'N/D'}% ·
                    Aw: {pasaporte.calidad_sensorial.muestra.actividad_agua_aw ?? 'N/D'} ·
                    Densidad: {pasaporte.calidad_sensorial.muestra.densidad_aparente_gl ?? 'N/D'} g/L
                  </p>
                )}
                {pasaporte.calidad_sensorial.conclusion && (
                  <p className="text-[#241710] pt-1">{pasaporte.calidad_sensorial.conclusion}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
