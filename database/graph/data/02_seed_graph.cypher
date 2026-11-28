// Limpieza de datos previos
MATCH (n) DETACH DELETE n;

// 1. Creación de Productores
CREATE (p1:Productor {id_pg: 1, codigo: 'PROD-CH-001', nombre: 'Mateo Hernández Santiz', region: 'Sierra Mariscal'}),
       (p2:Productor {id_pg: 2, codigo: 'PROD-CH-002', nombre: 'Rosalba Pérez Gómez', region: 'Soconusco'}),
       (p3:Productor {id_pg: 3, codigo: 'PROD-CH-003', nombre: 'Gaspar López Méndez', region: 'Altos de Chiapas'});

// 2. Creación de Parcelas
CREATE (pa1:Parcela {codigo: 'PARC-01', nombre: 'Finca El Triunfo Alto', variedad: 'Bourbon', altitud_msnm: 1650}),
       (pa2:Parcela {codigo: 'PARC-02', nombre: 'Finca Santa Rosa Tacaná', variedad: 'Geisha', altitud_msnm: 1780}),
       (pa3:Parcela {codigo: 'PARC-03', nombre: 'Parcela Kolonté', variedad: 'Typica', altitud_msnm: 1550});

// Relación Productor -> Parcela
MATCH (p1:Productor {codigo: 'PROD-CH-001'}), (pa1:Parcela {codigo: 'PARC-01'}) CREATE (p1)-[:POSEE]->(pa1);
MATCH (p2:Productor {codigo: 'PROD-CH-002'}), (pa2:Parcela {codigo: 'PARC-02'}) CREATE (p2)-[:POSEE]->(pa2);
MATCH (p3:Productor {codigo: 'PROD-CH-003'}), (pa3:Parcela {codigo: 'PARC-03'}) CREATE (p3)-[:POSEE]->(pa3);

// 3. Creación de Lotes de Cereza Madura Cosechada
CREATE (lc1:LoteCereza {codigo: 'CER-2026-01', peso_kg: 51750.0, fecha_cosecha: date('2026-10-20')}),
       (lc2:LoteCereza {codigo: 'CER-2026-02', peso_kg: 34500.0, fecha_cosecha: date('2026-10-22')}),
       (lc3:LoteCereza {codigo: 'CER-2026-03', peso_kg: 69000.0, fecha_cosecha: date('2026-10-25')});

// Relación Parcela -> LoteCereza
MATCH (pa1:Parcela {codigo: 'PARC-01'}), (lc1:LoteCereza {codigo: 'CER-2026-01'}) CREATE (pa1)-[:PRODUJO]->(lc1);
MATCH (pa2:Parcela {codigo: 'PARC-02'}), (lc2:LoteCereza {codigo: 'CER-2026-02'}) CREATE (pa2)-[:PRODUJO]->(lc2);
MATCH (pa3:Parcela {codigo: 'PARC-03'}), (lc3:LoteCereza {codigo: 'CER-2026-03'}) CREATE (pa3)-[:PRODUJO]->(lc3);

// 4. Creación de Plantas de Beneficiado
CREATE (b1:Beneficio {codigo: 'BEN-01', nombre: 'Beneficio Ecológico Jaltenango', tipo: 'HUMEDO_SECO'}),
       (b2:Beneficio {codigo: 'BEN-02', nombre: 'Beneficio Comunitario Tacaná', tipo: 'HUMEDO'});

// 5. Creación de Lotes de Pergamino Seco
CREATE (lp1:LotePergamino {id_pg: 1, codigo: 'PERG-2026-01', proceso: 'LAVADO', peso_kg: 10350.0}),
       (lp2:LotePergamino {id_pg: 2, codigo: 'PERG-2026-02', proceso: 'HONEY', peso_kg: 6900.0}),
       (lp3:LotePergamino {id_pg: 3, codigo: 'PERG-2026-03', proceso: 'NATURAL', peso_kg: 13800.0});

// Transformación: Cereza -> Beneficio -> Pergamino
MATCH (lc1:LoteCereza {codigo: 'CER-2026-01'}), (b1:Beneficio {codigo: 'BEN-01'}) CREATE (lc1)-[:PROCESADO_EN {fecha: date('2026-10-21')}]->(b1);
MATCH (lc1:LoteCereza {codigo: 'CER-2026-01'}), (lp1:LotePergamino {codigo: 'PERG-2026-01'}) CREATE (lc1)-[:TRANSFORMADO_EN {rendimiento_pct: 0.20}]->(lp1);

MATCH (lc2:LoteCereza {codigo: 'CER-2026-02'}), (b2:Beneficio {codigo: 'BEN-02'}) CREATE (lc2)-[:PROCESADO_EN {fecha: date('2026-10-23')}]->(b2);
MATCH (lc2:LoteCereza {codigo: 'CER-2026-02'}), (lp2:LotePergamino {codigo: 'PERG-2026-02'}) CREATE (lc2)-[:TRANSFORMADO_EN {rendimiento_pct: 0.20}]->(lp2);

MATCH (lc3:LoteCereza {codigo: 'CER-2026-03'}), (b1:Beneficio {codigo: 'BEN-01'}) CREATE (lc3)-[:PROCESADO_EN {fecha: date('2026-10-26')}]->(b1);
MATCH (lc3:LoteCereza {codigo: 'CER-2026-03'}), (lp3:LotePergamino {codigo: 'PERG-2026-03'}) CREATE (lc3)-[:TRANSFORMADO_EN {rendimiento_pct: 0.20}]->(lp3);

// 6. Creación de Lote de Exportación Homogéneo (Mezcla M:N)
CREATE (le1:LoteExportacion {id_pg: 4, codigo: 'EXP-2026-CH-04', sacos_69kg: 250, peso_kg: 17250.0, fecha_mezcla: date('2026-11-10')}),
       (le2:LoteExportacion {id_pg: 5, codigo: 'EXP-2026-CH-05', sacos_69kg: 100, peso_kg: 6900.0, fecha_mezcla: date('2026-11-12')});

// Relación de Mezcla: Pergamino 1 (60%) + Pergamino 2 (40%) = Lote de Exportación 4
MATCH (lp1:LotePergamino {codigo: 'PERG-2026-01'}), (le1:LoteExportacion {codigo: 'EXP-2026-CH-04'})
CREATE (lp1)-[:MEZCLADO_EN {proporcion_pct: 0.60, kg_aportados: 10350.0}]->(le1);

MATCH (lp2:LotePergamino {codigo: 'PERG-2026-02'}), (le1:LoteExportacion {codigo: 'EXP-2026-CH-04'})
CREATE (lp2)-[:MEZCLADO_EN {proporcion_pct: 0.40, kg_aportados: 6900.0}]->(le1);

// Pergamino 3 aporta a Lote Exportación 5
MATCH (lp3:LotePergamino {codigo: 'PERG-2026-03'}), (le2:LoteExportacion {codigo: 'EXP-2026-CH-05'})
CREATE (lp3)-[:MEZCLADO_EN {proporcion_pct: 1.00, kg_aportados: 6900.0}]->(le2);

// 7. Estibado en Contenedor Marítimo
CREATE (c1:Contenedor {numero_contenedor: 'MSCU-88491-0', naviera: 'MSC Mediterranean Shipping', puerto_destino: 'Rotterdam, Países Bajos'}),
       (c2:Contenedor {numero_contenedor: 'HAPAG-44109-2', naviera: 'Hapag-Lloyd', puerto_destino: 'Hamburgo, Alemania'});

MATCH (le1:LoteExportacion {codigo: 'EXP-2026-CH-04'}), (c1:Contenedor {numero_contenedor: 'MSCU-88491-0'})
CREATE (le1)-[:ESTIBADO_EN {fecha_estiba: date('2026-11-18'), sello_seguridad: 'SEAL-MX-9982'}]->(c1);
