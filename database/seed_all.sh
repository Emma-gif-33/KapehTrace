#!/usr/bin/env bash
# Re-siembra las tres bases de KapehTrace (idempotente: limpia y vuelve a cargar los datos semilla).
# Uso:  ./database/seed_all.sh [prefijo_contenedor]     (por defecto: kapehtrace)
#   Ej. si levantaste el compose con otros nombres de contenedor:  ./database/seed_all.sh kt
# Requiere los contenedores <prefijo>-postgres, <prefijo>-mongodb y <prefijo>-neo4j en ejecución.
# Credenciales de DEMOSTRACIÓN local (las mismas de .env.example).
set -euo pipefail
P="${1:-kapehtrace}"
DIR="$(cd "$(dirname "$0")" && pwd)"
PGU="${POSTGRES_USER:-kapeh_admin}"; PGDB="${POSTGRES_DB:-kapeh_trace_db}"
MU="${MONGO_USER:-kapeh_admin}";   MP="${MONGO_PASSWORD:-kapeh_secret_2026}"
NU="${NEO4J_USER:-neo4j}";         NP="${NEO4J_PASSWORD:-kapeh_secret_2026}"

echo "PostgreSQL: recreando esquema y datos..."
docker exec -i "$P-postgres" psql -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 -q \
  -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
docker exec -i "$P-postgres" psql -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 -q < "$DIR/relational/schema/01_create_tables.sql"
docker exec -i "$P-postgres" psql -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 -q < "$DIR/relational/data/02_seed_data.sql" > /dev/null

echo "MongoDB: validadores, índices y datos..."
docker exec -i "$P-mongodb" mongosh -u "$MU" -p "$MP" --authenticationDatabase admin --quiet < "$DIR/document/validators/01_create_collections_validators.js" > /dev/null
docker exec -i "$P-mongodb" mongosh -u "$MU" -p "$MP" --authenticationDatabase admin --quiet < "$DIR/document/data/02_seed_documents.js" > /dev/null

echo "Neo4j: constraints, índices y grafo..."
docker exec -i "$P-neo4j" cypher-shell -u "$NU" -p "$NP" < "$DIR/graph/schema/01_constraints_and_indexes.cypher" > /dev/null
docker exec -i "$P-neo4j" cypher-shell -u "$NU" -p "$NP" < "$DIR/graph/data/02_seed_graph.cypher" > /dev/null

echo "Bases sembradas: 5 lotes, 4 fichas SCA, 2 expedientes, grafo de 18 nodos y 16 relaciones."
