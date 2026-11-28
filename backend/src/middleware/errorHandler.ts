import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';

/**
 * Traduce cualquier error a la envoltura estándar { success:false, error:{...} }.
 *  - AppError            -> statusCode/code definidos por la capa de servicio.
 *  - PostgreSQL 23505    -> 409 DUPLICATE_RESOURCE (clave única violada).
 *  - PostgreSQL 23xxx    -> 400 CONSTRAINT_VIOLATION (CHECK, FK, NOT NULL).
 *  - MongoDB 11000       -> 409 DUPLICATE_RESOURCE (índice único violado).
 *  - MongoDB 121         -> 400 DOCUMENT_VALIDATION_FAILED ($jsonSchema).
 *  - JSON mal formado    -> 400 INVALID_JSON.
 *  - Cualquier otro      -> 500 INTERNAL_SERVER_ERROR.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message: string = err?.message || 'Ocurrió un error inesperado en el servidor.';
  const details = err?.details ?? null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
  } else if (err?.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'El cuerpo de la petición no es un JSON válido.';
  } else if (err?.code === '23505' || err?.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'Ya existe un registro con ese identificador único (código de lote duplicado).';
  } else if (err?.code === 121) {
    statusCode = 400;
    code = 'DOCUMENT_VALIDATION_FAILED';
    message = 'MongoDB rechazó el documento por incumplir el esquema $jsonSchema.';
  } else if (typeof err?.code === 'string' && /^23\d{3}$/.test(err.code)) {
    statusCode = 400;
    code = 'CONSTRAINT_VIOLATION';
    message = 'La operación viola una restricción de integridad de la base de datos.';
  }

  if (statusCode >= 500) {
    console.error('Error detectado en el pipeline del servidor:', err);
  } else {
    console.warn(`${code} (${statusCode}): ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  });
}
