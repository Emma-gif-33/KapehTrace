import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface Certificacion {
  nombre: string;
  codigo: string;
  vigencia: string;
  estado: 'Vigente' | 'Por renovar';
}

const CERTIFICACIONES: Certificacion[] = [
  { nombre: 'USDA Organic', codigo: 'CO-18429', vigencia: '18 oct 2025', estado: 'Vigente' },
  { nombre: 'Fair Trade', codigo: 'FT-77310', vigencia: '02 sep 2025', estado: 'Por renovar' },
  { nombre: 'Rainforest Alliance', codigo: 'RA-29018', vigencia: '14 ene 2026', estado: 'Vigente' },
  { nombre: 'MayaCert Orgánico', codigo: 'MC-48211', vigencia: '28 nov 2025', estado: 'Vigente' },
];

export const MarcoCertificacionesView: React.FC = () => {
  return (
    <div className="space-y-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            COSECHA 2024–2025
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Certificaciones
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Vigencias orgánicas y cumplimiento por destino
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Grid de certificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CERTIFICACIONES.map((cert) => {
          const isVigente = cert.estado === 'Vigente';
          return (
            <div
              key={cert.codigo}
              className="bg-white border border-[#EAE2D8] rounded-2xl p-6 shadow-[0_1px_2px_rgba(36,23,16,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5F0] text-[#356847] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    isVigente
                      ? 'bg-[#EEF5F0] text-[#356847]'
                      : 'bg-[#F7EFE4] text-[#9A6B2F]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isVigente ? 'bg-[#4B7A58]' : 'bg-[#B5823F]'}`} />
                    {cert.estado}
                  </span>
                </div>

                <h2 className="font-serif text-2xl text-[#241710] mt-4">
                  {cert.nombre}
                </h2>
                <p className="text-[11px] font-mono text-[#9B8E85] mt-0.5">
                  {cert.codigo}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F2EDE4]">
                <span className="block text-[11px] text-[#9B8E85]">Vigencia</span>
                <p className="text-xs font-bold text-[#241710] mt-0.5">
                  {cert.vigencia}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
