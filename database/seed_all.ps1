# Re-siembra las tres bases de KapehTrace (limpia y vuelve a cargar los datos semilla).
# Uso:  .\database\seed_all.ps1 [-Prefijo kapehtrace]
#   Si levantaste el compose con otros nombres de contenedor, usa -Prefijo kt (por ejemplo).
# Credenciales de DEMOSTRACIÓN local (las mismas de .env.example).
param([string]$Prefijo = "kapehtrace")
$ErrorActionPreference = "Stop"
$d = $PSScriptRoot
$pgu = "kapeh_admin"; $pgdb = "kapeh_trace_db"; $mu = "kapeh_admin"; $mp = "kapeh_secret_2026"; $nu = "neo4j"; $np = "kapeh_secret_2026"

function Send-File($container, $file, [string[]]$cmd) {
    # Se pasa el archivo por stdin del contenedor (UTF-8 sin BOM)
    Get-Content -Raw -Encoding UTF8 $file | docker exec -i $container @cmd | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Falló la carga de $file" }
}

Write-Host "▶ PostgreSQL: recreando esquema y datos..."
docker exec -i "$Prefijo-postgres" psql -U $pgu -d $pgdb -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
Send-File "$Prefijo-postgres" "$d\relational\schema\01_create_tables.sql" @("psql","-U",$pgu,"-d",$pgdb,"-v","ON_ERROR_STOP=1","-q")
Send-File "$Prefijo-postgres" "$d\relational\data\02_seed_data.sql" @("psql","-U",$pgu,"-d",$pgdb,"-v","ON_ERROR_STOP=1","-q")

Write-Host "▶ MongoDB: validadores, índices y datos..."
$mongo = @("mongosh","-u",$mu,"-p",$mp,"--authenticationDatabase","admin","--quiet")
Send-File "$Prefijo-mongodb" "$d\document\validators\01_create_collections_validators.js" $mongo
Send-File "$Prefijo-mongodb" "$d\document\data\02_seed_documents.js" $mongo

Write-Host "▶ Neo4j: constraints, índices y grafo..."
$cy = @("cypher-shell","-u",$nu,"-p",$np)
Send-File "$Prefijo-neo4j" "$d\graph\schema\01_constraints_and_indexes.cypher" $cy
Send-File "$Prefijo-neo4j" "$d\graph\data\02_seed_graph.cypher" $cy

Write-Host "✔ Bases sembradas (5 lotes, 4 fichas SCA, 2 expedientes, grafo de 18 nodos y 16 relaciones)."
