/**
 * Error de negocio tipado. El middleware `errorHandler` lo traduce a una
 * respuesta HTTP con el `statusCode` y el `code` indicados (en vez de tratar
 * todo como 500 o inferir el estado a partir del texto del mensaje).
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
