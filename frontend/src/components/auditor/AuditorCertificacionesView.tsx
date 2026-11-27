import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { HealthStatus, Lote, PasaporteDigital } from '../../types/lotes';
import { obtenerPasaporte } from '../../services/api';
import { DatabaseStatusBadge } from '../shared/DatabaseStatusBadge';

interface AuditorCertificacionesViewProps {
  lotes: Lote[];
  health: HealthStatus | null;
}

export const AuditorCertificacionesView: React.FC<AuditorCertificacionesViewProps> = ({
  lotes,
  health
}) => {
  const [selectedId, setSelectedId] = useState<number>(lotes[0]?.id || 1);
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
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            CERTIFICACIONES E INOCUIDAD
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Certificaciones y laboratorio
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Consulta los expedientes químicos y dictámenes orgánicos registrados por lote
          </p>
        </div>

        <DatabaseStatusBadge health={health} />
      </div>

      <div className="bg-white border border-[#EAE2D8] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span className="text-xs font-medium text-[#73655B]">
          Selecciona un lote para consultar sus expedientes:
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710]"
          >
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.codigo_lote} ({l.estado})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleConsultar}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>
      </div>

      {pasaporte && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pasaporte.certificaciones_laboratorio.length === 0 ? (
            <div className="md:col-span-2 bg-white border border-[#EAE2D8] rounded-2xl p-8 text-center text-xs text-[#73655B]">
              Este lote no tiene expedientes de laboratorio registrados todavía.
            </div>
          ) : (
            pasaporte.certificaciones_laboratorio.map((cert, idx) => {
              const isConforme = cert.dictamen !== 'NO_CONFORME';
              return (
                <div
                  key={`${cert.tipo}-${idx}`}
                  className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#EEF5F0] text-[#356847] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      isConforme
                        ? 'bg-[#EEF5F0] text-[#356847]'
                        : 'bg-[#F9EAE6] text-[#A84A3A]'
                    }`}>
                      {cert.dictamen || 'CONFORME'}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl text-[#241710]">{cert.tipo}</h2>
                    <p className="text-xs text-[#73655B] mt-0.5">{cert.organismo || 'Organismo acreditado'}</p>
                  </div>

                  {cert.parametros && cert.parametros.length > 0 && (
                    <div className="bg-[#FAF7F2] rounded-xl p-3 space-y-1.5 text-xs">
                      {cert.parametros.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between">
                          <span className="text-[#4B3D34] font-medium">{p.analito}</span>
                          <span className={p.aprobado ? 'text-[#356847]' : 'text-[#A84A3A] font-semibold'}>
                            {p.resultado_ppm} ppm (Lím: {p.limite_maximo_residuo_ppm})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
