import React, { useState } from 'react';
import {
  Leaf,
  Box,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  GitBranch
} from 'lucide-react';
import {
  Lote,
  TipoLote,
  GraphTopology,
  PasaporteDigital
} from '../../types/lotes';
import {
  crearLote,
  crearMezcla,
  obtenerGrafoLote,
  obtenerPasaporte
} from '../../services/api';

interface RecepcionLotesProps {
  lotes: Lote[];
  onRefresh: () => Promise<void>;
}

export const RecepcionCosechasView: React.FC<RecepcionLotesProps> = ({ lotes, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [codigoLote, setCodigoLote] = useState('');
  const [tipoLote, setTipoLote] = useState<TipoLote>('PERGAMINO');
  const [variedad, setVariedad] = useState('Bourbon');
  const [pesoKg, setPesoKg] = useState('3450');
  const [bodega, setBodega] = useState('Bodega San Cristóbal - Bloque B1');
  const [precioUsd, setPrecioUsd] = useState('5.50');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await crearLote({
        codigo_lote: codigoLote.trim(),
        tipo_lote: tipoLote,
        peso_neto_kg: Number(pesoKg),
        bodega_ubicacion: bodega.trim(),
        variedad: variedad.trim(),
        precio_base_kg_usd: Number(precioUsd)
      });
      await onRefresh();
      setFeedback({
        type: 'ok',
        text: res.online
          ? `Lote ${res.lote.codigo_lote} registrado en inventario (${res.lote.sacos_69kg} sacos).`
          : `Lote ${res.lote.codigo_lote} guardado en respaldo local (${res.lote.sacos_69kg} sacos).`
      });
      setCodigoLote('');
      setShowForm(false);
    } catch (err) {
      setFeedback({ type: 'err', text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
            RECEPCIÓN DE CAFÉ · NUEVO LOTE
          </span>
          <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
            Recepción de lotes
          </h2>
          <p className="text-sm text-[#73655B] mt-1">
            Registro físico de lotes en bodega (Cereza, Pergamino o Exportación).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#332017] text-white text-xs font-semibold hover:bg-[#23150e] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancelar' : 'Registrar lote'}</span>
        </button>
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

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-[#EAE2D8] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Código de lote</label>
            <input
              type="text"
              value={codigoLote}
              onChange={(e) => setCodigoLote(e.target.value)}
              placeholder="Ej. PERG-2026-04"
              required
              minLength={3}
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Tipo de lote</label>
            <select
              value={tipoLote}
              onChange={(e) => setTipoLote(e.target.value as TipoLote)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm bg-white focus:outline-none focus:border-[#C07850]"
            >
              <option value="CEREZA">CEREZA</option>
              <option value="PERGAMINO">PERGAMINO</option>
              <option value="EXPORTACION">EXPORTACION</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Variedad</label>
            <input
              type="text"
              value={variedad}
              onChange={(e) => setVariedad(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Peso neto (kg)</label>
            <input
              type="number"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              min={1}
              step="0.01"
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Bodega / Ubicación</label>
            <input
              type="text"
              value={bodega}
              onChange={(e) => setBodega(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Precio base (USD/kg)</label>
              <input
                type="number"
                value={precioUsd}
                onChange={(e) => setPrecioUsd(e.target.value)}
                min={0.1}
                step="0.01"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#C07850] text-white text-xs font-semibold hover:bg-[#a86440] transition-colors cursor-pointer h-[38px] disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#EAE2D8] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE2D8] bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#73655B]">
                <th className="py-3.5 px-5 font-semibold">Código</th>
                <th className="py-3.5 px-5 font-semibold">Tipo</th>
                <th className="py-3.5 px-5 font-semibold">Variedad</th>
                <th className="py-3.5 px-5 font-semibold">Bodega</th>
                <th className="py-3.5 px-5 font-semibold">Peso / Sacos</th>
                <th className="py-3.5 px-5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4] text-sm">
              {lotes.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#241710]">{l.codigo_lote}</td>
                  <td className="py-3.5 px-5 text-xs text-[#73655B]">{l.tipo_lote}</td>
                  <td className="py-3.5 px-5 text-[#241710]">{l.variedad}</td>
                  <td className="py-3.5 px-5 text-xs text-[#73655B]">{l.bodega_ubicacion}</td>
                  <td className="py-3.5 px-5 font-medium text-[#241710]">
                    {l.peso_neto_kg.toLocaleString()} kg · {l.sacos_69kg} sacos
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      l.estado === 'DISPONIBLE'
                        ? 'bg-[#EEF5F0] text-[#356847]'
                        : l.estado === 'EN_CUARENTENA'
                          ? 'bg-[#F9EAE6] text-[#A84A3A]'
                          : 'bg-[#F7EFE6] text-[#9A5B32]'
                    }`}>
                      {l.estado}
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

export const ProcesosMezclasView: React.FC<RecepcionLotesProps> = ({ lotes, onRefresh }) => {
  const pergaminos = lotes.filter((l) => l.tipo_lote === 'PERGAMINO' || l.tipo_lote === 'CEREZA');
  const exportaciones = lotes.filter((l) => l.tipo_lote === 'EXPORTACION');

  const [codigoExportacion, setCodigoExportacion] = useState('EXP-2026-CH-06');
  const [variedadBlend, setVariedadBlend] = useState('Blend Bourbon-Geisha');
  const [bodega, setBodega] = useState('Bodega Puerto Chiapas - Muelle 3');
  const [precioUsd, setPrecioUsd] = useState('8.40');
  const [comp1Codigo, setComp1Codigo] = useState(pergaminos[0]?.codigo_lote || 'PERG-2026-01');
  const [comp1Prop, setComp1Prop] = useState('0.6');
  const [comp1Kg, setComp1Kg] = useState('4140');
  const [comp2Codigo, setComp2Codigo] = useState(pergaminos[1]?.codigo_lote || 'PERG-2026-02');
  const [comp2Prop, setComp2Prop] = useState('0.4');
  const [comp2Kg, setComp2Kg] = useState('2760');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const sumaProporcion = Number(comp1Prop) + Number(comp2Prop);

  const handleCrearMezcla = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await crearMezcla({
        codigo_exportacion: codigoExportacion.trim(),
        variedad_blend: variedadBlend.trim(),
        bodega_ubicacion: bodega.trim(),
        precio_base_kg_usd: Number(precioUsd),
        componentes: [
          { codigo_pergamino: comp1Codigo, proporcion: Number(comp1Prop), kg_aportados: Number(comp1Kg) },
          { codigo_pergamino: comp2Codigo, proporcion: Number(comp2Prop), kg_aportados: Number(comp2Kg) }
        ]
      });
      await onRefresh();
      setFeedback({ type: 'ok', text: `${res.mensaje} (${res.lote_creado.codigo_lote})` });
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
          MEZCLAS DE EXPORTACIÓN · CONSOLIDACIÓN
        </span>
        <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
          Mezclas de exportación
        </h2>
        <p className="text-sm text-[#73655B] mt-1">
          Consolida lotes pergamino en un nuevo lote homogéneo de exportación.
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

      <form onSubmit={handleCrearMezcla} className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2EDE4] pb-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C07850]">
              NUEVA MEZCLA DE EXPORTACIÓN
            </span>
            <h3 className="font-serif text-2xl text-[#241710] mt-0.5">
              Composición de lotes pergamino
            </h3>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            Math.abs(sumaProporcion - 1) <= 0.01
              ? 'bg-[#EEF5F0] text-[#356847]'
              : 'bg-[#F9EAE6] text-[#A84A3A]'
          }`}>
            Suma de proporciones: {(sumaProporcion * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Código exportación</label>
            <input
              type="text"
              value={codigoExportacion}
              onChange={(e) => setCodigoExportacion(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Variedad del blend</label>
            <input
              type="text"
              value={variedadBlend}
              onChange={(e) => setVariedadBlend(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Bodega destino</label>
            <input
              type="text"
              value={bodega}
              onChange={(e) => setBodega(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4B3D34] mb-1">Precio base (USD/kg)</label>
            <input
              type="number"
              value={precioUsd}
              onChange={(e) => setPrecioUsd(e.target.value)}
              step="0.01"
              min={0.1}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDD5] text-sm focus:outline-none focus:border-[#C07850]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-[#4B3D34]">Componente 1 (Pergamino)</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={comp1Codigo}
                onChange={(e) => setComp1Codigo(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              >
                {pergaminos.map((p) => (
                  <option key={p.id} value={p.codigo_lote}>{p.codigo_lote}</option>
                ))}
              </select>
              <input
                type="number"
                value={comp1Prop}
                onChange={(e) => setComp1Prop(e.target.value)}
                step="0.05"
                min="0.05"
                max="1"
                placeholder="Prop (0-1)"
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              />
              <input
                type="number"
                value={comp1Kg}
                onChange={(e) => setComp1Kg(e.target.value)}
                min="1"
                placeholder="Kg"
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              />
            </div>
          </div>

          <div className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-[#4B3D34]">Componente 2 (Pergamino)</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={comp2Codigo}
                onChange={(e) => setComp2Codigo(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              >
                {pergaminos.map((p) => (
                  <option key={p.id} value={p.codigo_lote}>{p.codigo_lote}</option>
                ))}
              </select>
              <input
                type="number"
                value={comp2Prop}
                onChange={(e) => setComp2Prop(e.target.value)}
                step="0.05"
                min="0.05"
                max="1"
                placeholder="Prop (0-1)"
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              />
              <input
                type="number"
                value={comp2Kg}
                onChange={(e) => setComp2Kg(e.target.value)}
                min="1"
                placeholder="Kg"
                className="px-2.5 py-2 rounded-xl border border-[#E5DDD5] text-xs bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Consolidando...' : 'Consolidar mezcla de exportación'}
          </button>
        </div>
      </form>

      {/* Lotes de exportación existentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportaciones.map((l) => (
          <div key={l.id} className="bg-white border border-[#EAE2D8] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#6F4E37]">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#C07850]">{l.sacos_69kg} sacos</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#241710]">{l.codigo_lote}</h4>
              <p className="text-xs text-[#73655B] mt-0.5">{l.variedad}</p>
            </div>
            <div className="pt-2 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#73655B]">
              <span>{l.estado}</span>
              <span className="font-semibold text-[#241710]">{l.peso_neto_kg.toLocaleString()} kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrazabilidadView: React.FC<{ lotes: Lote[] }> = ({ lotes }) => {
  const defaultLote = lotes.find((l) => l.tipo_lote === 'EXPORTACION') || lotes[0];
  const [selectedCodigo, setSelectedCodigo] = useState(defaultLote?.codigo_lote || 'EXP-2026-CH-04');
  const [grafo, setGrafo] = useState<GraphTopology | null>(null);
  const [pasaporte, setPasaporte] = useState<PasaporteDigital | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    setLoading(true);
    try {
      const loteObj = lotes.find((l) => l.codigo_lote === selectedCodigo);
      const [grafoRes, pasaporteRes] = await Promise.all([
        obtenerGrafoLote(selectedCodigo),
        loteObj ? obtenerPasaporte(loteObj.id) : Promise.resolve(null)
      ]);
      setGrafo(grafoRes.grafo);
      setPasaporte(pasaporteRes ? pasaporteRes.pasaporte : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C07850] block mb-1.5">
            CADENA DE CUSTODIA · LINAJE DEL LOTE
          </span>
          <h2 className="font-serif text-3xl text-[#241710] tracking-tight">
            Trazabilidad y linaje
          </h2>
          <p className="text-sm text-[#73655B] mt-1">
            Consulta la red de procedencia y el pasaporte digital completo del lote.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9B8E85] absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCodigo}
              onChange={(e) => setSelectedCodigo(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E5DDD5] text-sm text-[#241710] focus:outline-none focus:border-[#C07850]"
            >
              {lotes.map((l) => (
                <option key={l.id} value={l.codigo_lote}>
                  {l.codigo_lote} ({l.tipo_lote})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleConsultar}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#332017] hover:bg-[#23150e] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Consultar grafo'}
          </button>
        </div>
      </div>

      {!grafo && (
        <div className="bg-white border border-[#EAE2D8] rounded-2xl p-8 text-center space-y-2">
          <GitBranch className="w-6 h-6 text-[#C07850] mx-auto" />
          <p className="text-sm font-semibold text-[#241710]">Selecciona un lote y presiona "Consultar grafo"</p>
          <p className="text-xs text-[#73655B]">
            Se consultará el árbol de origen junto con la ficha comercial y de calidad del lote.
          </p>
        </div>
      )}

      {grafo && (
        <div className="space-y-5">
          <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#73655B]">Etapas de trazabilidad encontradas para</span>
                <h3 className="font-serif text-2xl text-[#241710]">{selectedCodigo}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#356847] bg-[#EEF5F0] px-3 py-1 rounded-full">
                <Leaf className="w-3.5 h-3.5" />
                {grafo.nodes.length} nodos · {grafo.edges.length} relaciones
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {grafo.nodes.map((n) => (
                <div key={n.id} className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C07850]">
                    {n.label}
                  </span>
                  <p className="text-sm font-bold text-[#241710] mt-1">
                    {String(n.properties.codigo || n.properties.nombre || n.properties.numero_contenedor || `#${n.id}`)}
                  </p>
                  <p className="text-[11px] text-[#73655B] mt-1">
                    {n.properties.region
                      ? String(n.properties.region)
                      : n.properties.altitud_msnm
                        ? `${n.properties.altitud_msnm} msnm`
                        : n.properties.proceso
                          ? `Proceso: ${n.properties.proceso}`
                          : 'Nodo verificado'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {pasaporte && pasaporte.linaje_custodia.length > 0 && (
            <div className="bg-white border border-[#EAE2D8] rounded-2xl p-6 space-y-3">
              <h4 className="font-serif text-xl text-[#241710]">Linaje de origen (Pasaporte Digital)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pasaporte.linaje_custodia.map((item, idx) => (
                  <div key={`${item.lote_pergamino}-${idx}`} className="bg-[#FAF7F2] border border-[#EAE2D8] rounded-xl p-4 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#241710]">
                      <span>{item.lote_pergamino} · {item.parcela}</span>
                      <span className="text-[#C07850]">{item.proporcion_pct}%</span>
                    </div>
                    <p className="text-[#73655B]">{item.productor} · {item.region} ({item.altitud_msnm} msnm)</p>
                    <p className="text-[#4B3D34]">Proceso: {item.proceso_beneficio} · {item.kg_aportados} kg</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
