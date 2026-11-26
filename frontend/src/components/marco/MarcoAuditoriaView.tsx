import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MarcoAuditoriaView: React.FC = () => {
  const [cuarentenaEjecutada, setCuarentenaEjecutada] = useState(false);

  return (
    <div className="space-y-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            COSECHA 2024–2025
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Auditoría e inocuidad
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Alertas, certificados y cumplimiento
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Alerta sanitaria crítica */}
        <div className="lg:col-span-7 bg-[#FDF7F5] border border-[#EAD0CA] rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F7E4DF] text-[#A64B2A] flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-2.5">
              <span className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A64B2A]">
                ALERTA SANITARIA CRÍTICA
              </span>
              <h2 className="font-serif text-2xl sm:text-[26px] text-[#241710] leading-snug">
                Lote CHS-24-0761 no conforme
              </h2>
              <p className="text-xs sm:text-sm text-[#73655B] leading-relaxed">
                El análisis detectó Ocratoxina A por encima del umbral. La cuarentena en cascada identificó 3 lotes y 132 sacos relacionados.
              </p>

              <div className="pt-2">
                {!cuarentenaEjecutada ? (
                  <button
                    type="button"
                    onClick={() => setCuarentenaEjecutada(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#A64B2A] hover:bg-[#8E3E21] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Ejecutar protocolo de cuarentena
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEF5F0] text-[#356847] text-xs font-semibold border border-[#CDE0D3]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Protocolo ejecutado · 3 lotes (132 sacos) bloqueados en bodega</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estado documental */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block mb-4">
            ESTADO DOCUMENTAL
          </span>

          <div className="divide-y divide-[#F2EDE4]">
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">Certificados vigentes</span>
              <span className="font-serif text-xl text-[#241710]">42</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">Por renovar</span>
              <span className="font-serif text-xl text-[#241710]">05</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#73655B]">No conformidades</span>
              <span className="font-serif text-xl text-[#A64B2A]">01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
