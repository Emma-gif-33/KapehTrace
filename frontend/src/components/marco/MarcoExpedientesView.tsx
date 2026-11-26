import React, { useState } from 'react';

interface ExpedienteQuimico {
  parametro: string;
  lote: string;
  resultado: string;
  limiteUE: string;
  estado: 'Conforme' | 'No conforme';
}

const INITIAL_EXPEDIENTES: ExpedienteQuimico[] = [
  { parametro: 'Glifosato', lote: 'CHS-24-0847', resultado: '0.03 ppm', limiteUE: 'UE: 0.10 ppm', estado: 'Conforme' },
  { parametro: 'Clorpirifos', lote: 'CHS-24-0812', resultado: 'ND', limiteUE: 'UE: 0.01 ppm', estado: 'Conforme' },
  { parametro: 'Ocratoxina A', lote: 'CHS-24-0761', resultado: '6.2 µg/kg', limiteUE: 'UE: 5.0 µg/kg', estado: 'No conforme' },
  { parametro: 'Plomo', lote: 'CHS-24-0794', resultado: '0.04 ppm', limiteUE: 'UE: 0.20 ppm', estado: 'Conforme' },
];

export const MarcoExpedientesView: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteQuimico[]>(INITIAL_EXPEDIENTES);
  const [showForm, setShowForm] = useState(false);
  const [parametro, setParametro] = useState('');
  const [lote, setLote] = useState('CHS-24-0850');
  const [resultado, setResultado] = useState('0.01 ppm');
  const [limiteUE, setLimiteUE] = useState('UE: 0.10 ppm');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parametro.trim()) return;
    setExpedientes([
      {
        parametro: parametro.trim(),
        lote: lote.trim() || 'CHS-24-0850',
        resultado: resultado.trim() || 'ND',
        limiteUE: limiteUE.trim() || 'UE: 0.10 ppm',
        estado: 'Conforme'
      },
      ...expedientes
    ]);
    setParametro('');
    setShowForm(false);
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
            Expedientes químicos
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Resultados de laboratorio y límites máximos de residuos
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Tarjeta de resultados */}
      <div className="bg-white border border-[#EAE2D8] rounded-2xl shadow-[0_1px_2px_rgba(36,23,16,0.03)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F2EDE4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#241710]">
              Resultados de laboratorio
            </h2>
            <p className="text-[11px] text-[#9B8E85] mt-0.5">
              Comparación por límite máximo de residuos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            {showForm ? 'Cancelar' : 'Cargar expediente'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="p-5 bg-[#FAF7F2] border-b border-[#F2EDE4] grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Parámetro / Analito</label>
              <input
                type="text"
                value={parametro}
                onChange={(e) => setParametro(e.target.value)}
                placeholder="Ej. Cadmio"
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Lote</label>
              <input
                type="text"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Resultado</label>
              <input
                type="text"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Límite UE</label>
                <input
                  type="text"
                  value={limiteUE}
                  onChange={(e) => setLimiteUE(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#C07850] text-white text-xs font-semibold hover:bg-[#a86440] transition-colors cursor-pointer h-[34px]"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#F2EDE4]">
          {expedientes.map((item) => {
            const isConforme = item.estado === 'Conforme';
            return (
              <div
                key={`${item.parametro}-${item.lote}`}
                className="px-6 py-4.5 py-5 grid grid-cols-1 sm:grid-cols-12 items-center gap-3"
              >
                <div className="sm:col-span-4">
                  <p className="text-xs sm:text-sm font-bold text-[#241710]">{item.parametro}</p>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-xs font-mono text-[#73655B]">{item.lote}</span>
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <span className="text-xs font-medium text-[#241710]">{item.resultado}</span>
                </div>
                <div className="sm:col-span-1 sm:text-right">
                  <span className="text-[11px] text-[#9B8E85] whitespace-nowrap">{item.limiteUE}</span>
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    isConforme
                      ? 'bg-[#EEF5F0] text-[#356847]'
                      : 'bg-[#F9EAE6] text-[#A84A3A]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConforme ? 'bg-[#4B7A58]' : 'bg-[#B85645]'}`} />
                    {item.estado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
