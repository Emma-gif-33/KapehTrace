import React from 'react';
import { HealthStatus } from '../../types/lotes';

interface DatabaseStatusBadgeProps {
  health: HealthStatus | null;
}

export const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({ health }) => {
  if (!health) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-[#73655B]">
        <span className="w-2 h-2 rounded-full bg-[#C07850] animate-pulse" />
        <span>Verificando bases de datos...</span>
      </div>
    );
  }

  const isUp = health.status === 'UP';
  const isDegraded = health.status === 'DEGRADED';

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border ${
          isUp
            ? 'bg-[#EEF5F0] text-[#356847] border-[#CDE0D3]'
            : isDegraded
              ? 'bg-[#F7EFE4] text-[#9A6B2F] border-[#E8D5B8]'
              : 'bg-[#FAF7F2] text-[#73655B] border-[#E5DDD5]'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isUp ? 'bg-[#4B7A58]' : isDegraded ? 'bg-[#B5823F]' : 'bg-[#9B8E85]'
          }`}
        />
        {isUp
          ? '3 BDs conectadas'
          : isDegraded
            ? 'Conexión parcial'
            : 'Sin conexión al servidor (respaldo)'}
      </span>

      <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#73655B]">
        <span className={health.databases.postgres ? 'text-[#356847]' : 'text-[#9B8E85]'}>
          PG {health.databases.postgres ? '●' : '○'}
        </span>
        <span className={health.databases.mongodb ? 'text-[#356847]' : 'text-[#9B8E85]'}>
          Mongo {health.databases.mongodb ? '●' : '○'}
        </span>
        <span className={health.databases.neo4j ? 'text-[#356847]' : 'text-[#9B8E85]'}>
          Neo4j {health.databases.neo4j ? '●' : '○'}
        </span>
      </div>
    </div>
  );
};
