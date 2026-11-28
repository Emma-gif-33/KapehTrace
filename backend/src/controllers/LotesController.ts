import { Request, Response, NextFunction } from 'express';
import { LotesService } from '../services/LotesService.js';
import { AppError } from '../errors.js';

export class LotesController {
  constructor(private service: LotesService = new LotesService()) {}

  // GET /api/lotes
  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { estado, tipo, minScore } = req.query;
      const lotes = await this.service.listarLotes({
        estado: estado as string,
        tipo: tipo as string,
        minScore: minScore ? parseFloat(minScore as string) : undefined,
      });

      res.status(200).json({
        success: true,
        count: lotes.length,
        data: lotes,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/lotes/:id/pasaporte
  obtenerPasaporte = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idRaw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const loteId = parseInt(idRaw, 10);
      if (isNaN(loteId)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'El ID del lote debe ser un número entero válido.');
      }

      const pasaporte = await this.service.obtenerPasaporteDigital(loteId);
      res.status(200).json({
        success: true,
        data: pasaporte,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/lotes
  crear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nuevoLote = await this.service.crearLote(req.body);
      res.status(201).json({
        success: true,
        message: 'Lote físico registrado correctamente en bodega (PostgreSQL).',
        data: nuevoLote,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/lotes/mezcla
  crearMezcla = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultado = await this.service.crearMezclaExportacion(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/lotes/:codigo/grafo
  obtenerGrafo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const codigo = Array.isArray(req.params.codigo) ? req.params.codigo[0] : req.params.codigo;
      const grafoData = await this.service.obtenerTopologiaVisual(codigo);
      res.status(200).json({
        success: true,
        codigo_lote: codigo,
        data: grafoData,
      });
    } catch (error) {
      next(error);
    }
  };
}
