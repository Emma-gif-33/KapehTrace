import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlertaCuarentenaResponse, HealthStatus, Lote } from '../../types/lotes';
import { detonarCuarentena } from '../../services/api';
import { DatabaseStatusBadge } from '../shared/DatabaseStatusBadge';

interface AuditorInocuidadViewProps {
  lotes: Lote[];
  health: HealthStatus | null;
  onRefresh: () => Promise<void>;
}

export const AuditorInocuidadView: React.FC<AuditorInocuidadViewProps> = ({
  lotes,
  health,
  onRefresh
}) => {
  const [codigoLote, setCodigoLote] = useState(
    lotes.find((l) => l.estado === 'EN_CUARENTENA')?.codigo_lote || lotes[0]?.codigo_lote || 'EXP-2026-CH-05'
  );
  const [analito, setAnalito] = useState('Ocratoxina A');
  const [resultadoPpm, setResultadoPpm] = useState('6.2');
  const [limitePpm, setLimitePpm] = useState('5.0');
  const [laboratorio, setLaboratorio] = useState('SENASICA Inocuidad Chiapas');
  const [motivo, setMotivo] = useState('Resultado por encima del límite máximo permitido');
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<AlertaCuarentenaResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enCuarentena = lotes.filter((l) => l.estado === 'EN_CUARENTENA').length;
  const disponibles = lotes.filter((l) => l.estado === 'DISPONIBLE').length;

  const handleEjecutarCuarentena = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await detonarCuarentena({
        codigo_lote: codigoLote,
        analito: analito.trim(),
        resultado_ppm: Number(resultadoPpm),
        limite_maximo_ppm: Number(limitePpm),
        laboratorio: laboratorio.trim(),
        motivo_rechazo: motivo.trim()
      });
      setResultado(res.resultado);
      await onRefresh();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            CONTROL SANITARIO · ALERTA DE INOCUIDAD
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Auditoría e inocuidad
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Registra análisis no conformes, rastrea el origen afectado y bloquea lotes en riesgo
          </p>
        </div>

        <DatabaseStatusBadge health={health} />
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border bg-[#F9EAE6] border-[#EAD0CA] text-[#A84A3A] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Protocolo de cuarentena en cascada */}
        <form
          onSubmit={handleEjecutarCuarentena}
          className="lg:col-span-7 bg-[#FDF7F5] border border-[#EAD0CA] rounded-2xl p-6 sm:p-7 space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F7E4DF] text-[#A64B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A64B2A]">
                PROTOCOLO DE CUARENTENA EN CASCADA
              </span>
              <h2 className="font-serif text-2xl text-[#241710] mt-1">
                Reportar resultado no conforme
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Lote afectado</label>
              <select
                value={codigoLote}
                onChange={(e) => setCodigoLote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.codigo_lote}>
                    {l.codigo_lote} ({l.estado})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Analito</label>
              <input
                type="text"
                value={analito}
                onChange={(e) => setAnalito(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Resultado (ppm / µg)</label>
              <input
                type="number"
                step="0.01"
                value={resultadoPpm}
                onChange={(e) => setResultadoPpm(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Límite máximo</label>
              <input
                type="number"
                step="0.01"
                value={limitePpm}
                onChange={(e) => setLimitePpm(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Laboratorio</label>
              <input
                type="text"
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Motivo de rechazo</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                minLength={5}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#A64B2A] hover:bg-[#8E3E21] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Ejecutando protocolo...' : 'Ejecutar protocolo de cuarentena'}
          </button>

          {resultado && (
            <div className="mt-3 p-4 rounded-xl bg-white border border-[#CDE0D3] text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#356847] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resultado.mensaje}</span>
              </div>
              <p className="text-[#73655B]">
                Parcela de origen identificada: <strong className="text-[#241710]">{resultado.parcela_origen_sospechosa}</strong>
              </p>
              <p className="text-[#73655B]">
                Lotes bloqueados: <strong className="text-[#241710]">{resultado.codigos_lotes_afectados.join(', ')}</strong>
              </p>
              {resultado.contenedores_en_riesgo.length > 0 && (
                <p className="text-[#A64B2A]">
                  Contenedores en riesgo: {resultado.contenedores_en_riesgo.join(', ')}
                </p>
              )}
            </div>
          )}
        </form>

        {/* Resumen de estado */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block mb-4">
            ESTADO DEL LOTE
          </span>

          <div className="divide-y divide-[#F2EDE4]">
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">Total de lotes</span>
              <span className="font-serif text-xl text-[#241710]">{String(lotes.length).padStart(2, '0')}</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">Disponibles</span>
              <span className="font-serif text-xl text-[#241710]">{String(disponibles).padStart(2, '0')}</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">En cuarentena</span>
              <span className="font-serif text-xl text-[#A64B2A]">{String(enCuarentena).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
