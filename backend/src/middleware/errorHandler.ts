import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('💥 Error detectado en el pipeline del servidor:', err);

  const statusCode = err.statusCode || (err.message?.includes('NOT_FOUND') ? 404 : 500);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Ocurrió un error inesperado en el servidor.',
      details: err.details || null,
      timestamp: new Date().toISOString(),
    },
  });
}
