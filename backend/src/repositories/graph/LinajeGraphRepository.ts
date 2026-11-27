import { neo4jDriver } from '../../config/database.js';

export interface LinajeComponente {
  productor: string;
  region: string;
  parcela: string;
  variedad: string;
  altitud_msnm: number;
  lote_pergamino: string;
  proceso_beneficio: string;
  proporcion_pct: number;
  kg_aportados: number;
}

export interface ImpactoAlerta {
  parcela_origen: string;
  lotes_afectados_ids: number[];
  lotes_afectados_codigos: string[];
  contenedores_en_riesgo: string[];
}

export class LinajeGraphRepository {
  async findLinajeByLoteExportacion(codigoExportacion: string): Promise<LinajeComponente[]> {
    const session = neo4jDriver.session();
    try {
      const cypher = `
        MATCH (le:LoteExportacion {codigo: $codigo})<-[m:MEZCLADO_EN]-(lp:LotePergamino)<-[:TRANSFORMADO_EN]-(lc:LoteCereza)<-[:PRODUJO]-(pa:Parcela)<-[:POSEE]-(prod:Productor)
        RETURN 
          prod.nombre AS productor,
          prod.region AS region,
          pa.nombre AS parcela,
          pa.variedad AS variedad,
          pa.altitud_msnm AS altitud_msnm,
          lp.codigo AS lote_pergamino,
          lp.proceso AS proceso_beneficio,
          m.proporcion_pct * 100 AS proporcion_pct,
          m.kg_aportados AS kg_aportados
        ORDER BY m.proporcion_pct DESC;
      `;
      const res = await session.run(cypher, { codigo: codigoExportacion });
      return res.records.map((r) => ({
        productor: r.get('productor'),
        region: r.get('region'),
        parcela: r.get('parcela'),
        variedad: r.get('variedad'),
        altitud_msnm: r.get('altitud_msnm') ? Number(r.get('altitud_msnm')) : 0,
        lote_pergamino: r.get('lote_pergamino'),
        proceso_beneficio: r.get('proceso_beneficio'),
        proporcion_pct: r.get('proporcion_pct'),
        kg_aportados: r.get('kg_aportados'),
      }));
    } finally {
      await session.close();
    }
  }

  async createMezclaExportacion(
    idPg: number,
    codigoExportacion: string,
    sacos: number,
    pesoKg: number,
    componentes: { codigo_pergamino: string; proporcion: number; kg_aportados: number }[]
  ): Promise<number> {
    const session = neo4jDriver.session();
    try {
      const cypher = `
        MERGE (le:LoteExportacion {codigo: $codigoExportacion})
        ON CREATE SET le.id_pg = $idPg, le.sacos_69kg = $sacos, le.peso_kg = $pesoKg, le.fecha_mezcla = date()
        WITH le
        UNWIND $componentes AS comp
        MATCH (lp:LotePergamino {codigo: comp.codigo_pergamino})
        MERGE (lp)-[m:MEZCLADO_EN]->(le)
        SET m.proporcion_pct = comp.proporcion, m.kg_aportados = comp.kg_aportados
        RETURN count(m) AS mezclas_creadas;
      `;
      const res = await session.run(cypher, {
        idPg,
        codigoExportacion,
        sacos,
        pesoKg,
        componentes,
      });
      const record = res.records[0];
      return record ? Number(record.get('mezclas_creadas')) : 0;
    } finally {
      await session.close();
    }
  }

  async deleteMezcla(codigoExportacion: string): Promise<void> {
    const session = neo4jDriver.session();
    try {
      const cypher = `
        MATCH (le:LoteExportacion {codigo: $codigo})
        DETACH DELETE le;
      `;
      await session.run(cypher, { codigo: codigoExportacion });
    } finally {
      await session.close();
    }
  }

  async findImpactoPorLote(codigoLote: string): Promise<ImpactoAlerta> {
    const session = neo4jDriver.session();
    try {
      const cypher = `
        MATCH (leOrigen:LoteExportacion {codigo: $codigo})<-[:MEZCLADO_EN*1..2]-(pa:Parcela)
        MATCH (pa)-[:PRODUJO*1..3]->(hermanos:LoteExportacion)
        OPTIONAL MATCH (hermanos)-[:ESTIBADO_EN]->(c:Contenedor)
        RETURN 
          pa.nombre AS parcela_origen,
          collect(DISTINCT hermanos.id_pg) AS ids_lotes,
          collect(DISTINCT hermanos.codigo) AS codigos_lotes,
          collect(DISTINCT c.numero_contenedor) AS contenedores;
      `;
      const res = await session.run(cypher, { codigo: codigoLote });
      if (res.records.length === 0) {
        return {
          parcela_origen: 'Desconocida',
          lotes_afectados_ids: [],
          lotes_afectados_codigos: [codigoLote],
          contenedores_en_riesgo: [],
        };
      }
      const row = res.records[0];
      return {
        parcela_origen: row.get('parcela_origen') || 'Parcela en investigación',
        lotes_afectados_ids: (row.get('ids_lotes') || []).map((id: any) => Number(id)),
        lotes_afectados_codigos: row.get('codigos_lotes') || [],
        contenedores_en_riesgo: (row.get('contenedores') || []).filter(Boolean),
      };
    } finally {
      await session.close();
    }
  }

  async getGraphTopology(codigoLote: string): Promise<{ nodes: any[]; edges: any[] }> {
    const session = neo4jDriver.session();
    try {
      const cypher = `
        MATCH path = (c:Contenedor)<-[:ESTIBADO_EN*0..1]-(le:LoteExportacion {codigo: $codigo})<-[:MEZCLADO_EN*0..1]-(lp:LotePergamino)<-[:TRANSFORMADO_EN*0..1]-(lc:LoteCereza)<-[:PRODUJO*0..1]-(pa:Parcela)<-[:POSEE*0..1]-(prod:Productor)
        UNWIND nodes(path) AS n
        UNWIND relationships(path) AS r
        RETURN 
          collect(DISTINCT { id: id(n), label: labels(n)[0], properties: properties(n) }) AS nodes,
          collect(DISTINCT { from: id(startNode(r)), to: id(endNode(r)), type: type(r), properties: properties(r) }) AS edges;
      `;
      const res = await session.run(cypher, { codigo: codigoLote });
      const record = res.records[0];
      if (!record) return { nodes: [], edges: [] };
      return {
        nodes: record.get('nodes'),
        edges: record.get('edges'),
      };
    } finally {
      await session.close();
    }
  }
}
