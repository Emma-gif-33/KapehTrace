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
        MATCH (leOrigen:LoteExportacion {codigo: $codigo})<-[:MEZCLADO_EN]-(:LotePergamino)<-[:TRANSFORMADO_EN]-(:LoteCereza)<-[:PRODUJO]-(pa:Parcela)
        MATCH (pa)-[:PRODUJO]->(:LoteCereza)-[:TRANSFORMADO_EN]->(:LotePergamino)-[:MEZCLADO_EN]->(hermanos:LoteExportacion)
        OPTIONAL MATCH (hermanos)-[:ESTIBADO_EN]->(c:Contenedor)
        RETURN 
          collect(DISTINCT pa.nombre) AS parcelas_origen,
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
      const parcelas: string[] = (row.get('parcelas_origen') || []).filter(Boolean);
      return {
        parcela_origen: parcelas.length > 0 ? parcelas.join(', ') : 'Parcela en investigación',
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
        MATCH (target {codigo: $codigo})
        OPTIONAL MATCH pUp = (target)<-[:MEZCLADO_EN|TRANSFORMADO_EN|PRODUJO|POSEE*1..5]-(ancestor)
        OPTIONAL MATCH pDown = (target)-[:MEZCLADO_EN|ESTIBADO_EN*1..2]->(descendant)
        WITH target,
             [x IN collect(pUp) WHERE x IS NOT NULL] + [y IN collect(pDown) WHERE y IS NOT NULL] AS paths
        WITH [target] + REDUCE(acc = [], p IN paths | acc + nodes(p)) AS allNodes,
             REDUCE(acc = [], p IN paths | acc + relationships(p)) AS allRels
        UNWIND allNodes AS n
        WITH collect(DISTINCT n) AS uniqNodes, allRels
        UNWIND (CASE WHEN size(allRels) = 0 THEN [null] ELSE allRels END) AS r
        RETURN
          [n IN uniqNodes | { id: id(n), label: labels(n)[0], properties: properties(n) }] AS nodes,
          [rel IN collect(DISTINCT r) WHERE rel IS NOT NULL | { from: id(startNode(rel)), to: id(endNode(rel)), type: type(rel), properties: properties(rel) }] AS edges;
      `;
      const res = await session.run(cypher, { codigo: codigoLote });
      const record = res.records[0];
      if (!record) return { nodes: [], edges: [] };

      const toPlain = (val: any): any => {
        if (val === null || val === undefined) return val;
        if (typeof val === 'object' && typeof val.toNumber === 'function') return val.toNumber();
        if (Array.isArray(val)) return val.map(toPlain);
        if (typeof val === 'object') {
          const out: Record<string, any> = {};
          for (const [k, v] of Object.entries(val)) out[k] = toPlain(v);
          return out;
        }
        return val;
      };

      const rawNodes = record.get('nodes') || [];
      const rawEdges = record.get('edges') || [];

      return {
        nodes: rawNodes.map((n: any) => ({
          id: Number(n.id),
          label: n.label,
          properties: toPlain(n.properties),
        })),
        edges: rawEdges.map((e: any) => ({
          from: Number(e.from),
          to: Number(e.to),
          type: e.type,
          properties: toPlain(e.properties),
        })),
      };
    } finally {
      await session.close();
    }
  }
}
