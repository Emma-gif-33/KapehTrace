import React from 'react';

interface ContratoComercial {
  codigo: string;
  cliente: string;
  pais: string;
  sacos: number;
  valorUSD: string;
  estado: 'Vigente';
}

const CONTRATOS: ContratoComercial[] = [
  {
    codigo: 'KT-DE-24018',
    cliente: 'Kaffeehaus Bremen',
    pais: 'Alemania',
    sacos: 180,
    valorUSD: '$128,340',
    estado: 'Vigente'
  },
  {
    codigo: 'KT-JP-24009',
    cliente: 'Mori Coffee Co.',
    pais: 'Japón',
    sacos: 96,
    valorUSD: '$82,560',
    estado: 'Vigente'
  },
  {
    codigo: 'KT-US-24014',
    cliente: 'North Loop Roasters',
    pais: 'EE.UU.',
    sacos: 144,
    valorUSD: '$103,680',
    estado: 'Vigente'
  }
];

export const ElenaContratosView: React.FC = () => {
  return (
    <div className="space-y-7">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-2">
            COSECHA 2024–2025
          </span>
          <h1 className="font-serif text-3xl sm:text-[42px] leading-[1.1] text-[#241710] font-normal tracking-tight">
            Contratos comerciales
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Ventas, compromisos y saldos internacionales
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Tarjetas de contratos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CONTRATOS.map((c) => (
          <div
            key={c.codigo}
            className="bg-white border border-[#EAE2D8] rounded-2xl p-6 shadow-[0_1px_2px_rgba(36,23,16,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#9B8E85] tracking-wide">
                  {c.codigo}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF5F0] text-[#356847]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4B7A58]" />
                  {c.estado}
                </span>
              </div>

              <h2 className="font-serif text-2xl text-[#241710] mt-3 leading-snug">
                {c.cliente}
              </h2>
              <p className="text-xs text-[#73655B] mt-1">{c.pais}</p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#F2EDE4] flex items-end justify-between">
              <span className="text-xs font-medium text-[#4B3D34]">
                {c.sacos} sacos
              </span>
              <div className="text-right">
                <p className="font-serif text-2xl text-[#241710] leading-none">
                  {c.valorUSD}
                </p>
                <span className="block text-[10px] text-[#9B8E85] mt-1">
                  Valor pactado USD
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
