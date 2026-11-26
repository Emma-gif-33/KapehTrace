import React, { useState } from 'react';

interface MovimientoPago {
  id: string;
  cliente: string;
  metodo: string;
  monto: number;
  estado: 'Confirmado' | 'En revisión';
}

const INITIAL_MOVIMIENTOS: MovimientoPago[] = [
  {
    id: 'PAG-01',
    cliente: 'Kaffeehaus Bremen',
    metodo: 'SWIFT · DEUTDEFF',
    monto: 42780,
    estado: 'Confirmado'
  },
  {
    id: 'PAG-02',
    cliente: 'Mori Coffee Co.',
    metodo: 'Carta de crédito',
    monto: 57792,
    estado: 'En revisión'
  },
  {
    id: 'PAG-03',
    cliente: 'North Loop Roasters',
    metodo: 'SWIFT · BOFAUS3N',
    monto: 31104,
    estado: 'Confirmado'
  }
];

export const ElenaPagosView: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MovimientoPago[]>(INITIAL_MOVIMIENTOS);
  const [showForm, setShowForm] = useState(false);
  const [cliente, setCliente] = useState('Kaffeehaus Bremen');
  const [metodo, setMetodo] = useState('SWIFT · DEUTDEFF');
  const [monto, setMonto] = useState('12500');

  const pendienteInicial = 86240;
  const recibidoInicial = 221676;
  const extraRecibido = movimientos
    .slice(INITIAL_MOVIMIENTOS.length)
    .reduce((acc, m) => acc + m.monto, 0);

  const pendienteActual = Math.max(0, pendienteInicial - extraRecibido);
  const recibidoActual = recibidoInicial + extraRecibido;
  const totalCartera = pendienteActual + recibidoActual;
  const porcentajeCobrado = Math.min(100, Math.round((recibidoActual / totalCartera) * 100));

  const handleAddPago = (e: React.FormEvent) => {
    e.preventDefault();
    const numericMonto = Number(monto);
    if (!cliente.trim() || !numericMonto || numericMonto <= 0) return;

    const nuevo: MovimientoPago = {
      id: `PAG-0${movimientos.length + 1}`,
      cliente: cliente.trim(),
      metodo: metodo.trim() || 'Transferencia SWIFT',
      monto: numericMonto,
      estado: 'Confirmado'
    };

    setMovimientos([...movimientos, nuevo]);
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
            Pagos y clientes
          </h1>
          <p className="text-sm text-[#73655B] mt-2.5">
            Transferencias SWIFT, saldos y compradores
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-[#6D5F55] pb-1">
          <span className="w-2 h-2 rounded-full bg-[#4B7A58]" />
          <span>Sistemas operativos</span>
        </div>
      </div>

      {/* Contenido principal en 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Movimientos internacionales */}
        <div className="lg:col-span-7 bg-white border border-[#EAE2D8] rounded-2xl shadow-[0_1px_2px_rgba(36,23,16,0.03)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F2EDE4] flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl text-[#241710]">
              Movimientos internacionales
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {showForm ? 'Cancelar' : 'Registrar pago'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddPago} className="p-5 bg-[#FAF7F2] border-b border-[#F2EDE4] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Comprador</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Referencia / SWIFT</label>
                <input
                  type="text"
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD5] text-xs text-[#241710] focus:outline-none focus:border-[#C07850]"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-[#4B3D34] mb-1">Monto USD</label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    min={1}
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
            {movimientos.map((m) => (
              <div key={m.id} className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#241710]">
                    {m.cliente}
                  </p>
                  <p className="text-[11px] text-[#9B8E85] mt-0.5">
                    {m.metodo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-[#4B7A58]">
                    + ${m.monto.toLocaleString('en-US')}
                  </p>
                  <p className="text-[11px] text-[#9B8E85] mt-0.5">
                    {m.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cartera Global */}
        <div className="lg:col-span-5 bg-white border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(36,23,16,0.03)]">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9B8E85] block">
            CARTERA GLOBAL
          </span>
          <p className="font-serif text-4xl sm:text-[42px] text-[#241710] mt-2 leading-none">
            ${pendienteActual.toLocaleString('en-US')}
          </p>
          <p className="text-xs text-[#73655B] mt-2">
            USD pendientes por cobrar
          </p>

          <div className="mt-6">
            <div className="w-full h-2 rounded-full bg-[#EFE9E0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6B845E] transition-all duration-300"
                style={{ width: `${porcentajeCobrado}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9B8E85] mt-2.5">
              <span>{porcentajeCobrado}% cobrado</span>
              <span>${recibidoActual.toLocaleString('en-US')} recibido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
