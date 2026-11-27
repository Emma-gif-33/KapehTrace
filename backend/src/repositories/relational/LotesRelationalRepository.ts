import { pgPool } from '../../config/database.js';
import { CreateLoteDTO } from '../../schemas/lotesSchemas.js';

export interface LoteRelationalEntity {
  id: number;
  codigo_lote: string;
  tipo_lote: string;
  estado: string;
  peso_neto_kg: number;
  sacos_69kg: number;
  bodega_ubicacion: string;
  score_calidad_sca: number | null;
  variedad: string;
  precio_base_kg_usd: number;
  created_at: Date;
  updated_at: Date;
}

export class LotesRelationalRepository {
  async findAll(filters?: { estado?: string; tipo?: string; minScore?: number }): Promise<LoteRelationalEntity[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters?.estado) {
      conditions.push(`estado = $${idx++}`);
      values.push(filters.estado);
    }
    if (filters?.tipo) {
      conditions.push(`tipo_lote = $${idx++}`);
      values.push(filters.tipo);
    }
    if (filters?.minScore !== undefined) {
      conditions.push(`score_calidad_sca >= $${idx++}`);
      values.push(filters.minScore);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT id, codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg,
             bodega_ubicacion, score_calidad_sca, variedad, precio_base_kg_usd,
             created_at, updated_at
      FROM lotes
      ${whereClause}
      ORDER BY id DESC;
    `;

    const result = await pgPool.query(query, values);
    return result.rows.map(this.mapRowToEntity);
  }

  async findById(id: number): Promise<LoteRelationalEntity | null> {
    const query = `SELECT * FROM lotes WHERE id = $1 LIMIT 1;`;
    const result = await pgPool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByCodigo(codigo: string): Promise<LoteRelationalEntity | null> {
    const query = `SELECT * FROM lotes WHERE codigo_lote = $1 LIMIT 1;`;
    const result = await pgPool.query(query, [codigo]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async create(data: CreateLoteDTO, sacos: number): Promise<LoteRelationalEntity> {
    const query = `
      INSERT INTO lotes (codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion, variedad, precio_base_kg_usd)
      VALUES ($1, $2, 'DISPONIBLE', $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      data.codigo_lote,
      data.tipo_lote,
      data.peso_neto_kg,
      sacos,
      data.bodega_ubicacion,
      data.variedad,
      data.precio_base_kg_usd,
    ];

    const result = await pgPool.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  async updateScoreSca(id: number, score: number): Promise<void> {
    const query = `UPDATE lotes SET score_calidad_sca = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`;
    await pgPool.query(query, [score, id]);
  }

  async updateEstado(id: number, estado: string): Promise<void> {
    const query = `UPDATE lotes SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`;
    await pgPool.query(query, [estado, id]);
  }

  async updateEstadoBatch(ids: number[], estado: string): Promise<number> {
    if (ids.length === 0) return 0;
    const query = `UPDATE lotes SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::bigint[]);`;
    const result = await pgPool.query(query, [estado, ids]);
    return result.rowCount || 0;
  }

  async delete(id: number): Promise<void> {
    const query = `DELETE FROM lotes WHERE id = $1;`;
    await pgPool.query(query, [id]);
  }

  async findContratoByLoteId(loteId: number): Promise<any | null> {
    const query = `
      SELECT c.numero_contrato, cl.razon_social AS cliente, cl.pais_destino, c.estado AS estado_contrato
      FROM contrato_lotes clote
      JOIN contratos_venta c ON clote.contrato_id = c.id
      JOIN clientes cl ON c.cliente_id = cl.id
      WHERE clote.lote_id = $1
      LIMIT 1;
    `;
    const res = await pgPool.query(query, [loteId]);
    return res.rows[0] || null;
  }

  private mapRowToEntity(row: any): LoteRelationalEntity {
    return {
      id: Number(row.id),
      codigo_lote: row.codigo_lote,
      tipo_lote: row.tipo_lote,
      estado: row.estado,
      peso_neto_kg: parseFloat(row.peso_neto_kg),
      sacos_69kg: parseInt(row.sacos_69kg, 10),
      bodega_ubicacion: row.bodega_ubicacion,
      score_calidad_sca: row.score_calidad_sca ? parseFloat(row.score_calidad_sca) : null,
      variedad: row.variedad,
      precio_base_kg_usd: parseFloat(row.precio_base_kg_usd),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
