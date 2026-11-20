import { Request, Response, NextFunction } from 'express';
import { LotesService } from '../services/LotesService.js';

export class CalidadController {
  constructor(private service: LotesService = new LotesService()) {}

  // POST /api/calidad/inspeccion
  registrarFicha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultado = await this.service.registrarFichaCalidad(req.body);
      res.status(201).json({
        success: true,
        message: 'Ficha de catación SCA registrada en MongoDB y score replicado en PostgreSQL.',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/calidad/alerta-cuarentena
  detonarCuarentena = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultado = await this.service.ejecutarProtocoloCuarentena(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
