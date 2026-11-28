import { ObjectId } from 'mongodb';
import { getMongoDb } from '../../config/database.js';
import { FichaCalidadDTO } from '../../schemas/lotesSchemas.js';

export interface FichaCalidadDocument extends FichaCalidadDTO {
  _id?: any;
  score_total: number;
  fecha_evaluacion: Date;
}

export class CalidadDocumentRepository {
  private get fichasCollection() {
    return getMongoDb().collection<FichaCalidadDocument>('fichas_calidad_sca');
  }

  private get expedientesCollection() {
    return getMongoDb().collection('expedientes_certificacion');
  }

  async findFichaByLoteId(loteId: number): Promise<FichaCalidadDocument | null> {
    return this.fichasCollection.findOne({ lote_id: loteId });
  }

  async findFichaByCodigo(codigo: string): Promise<FichaCalidadDocument | null> {
    return this.fichasCollection.findOne({ codigo_lote: codigo });
  }

  async insertFicha(ficha: FichaCalidadDocument): Promise<string> {
    const res = await this.fichasCollection.insertOne(ficha);
    return res.insertedId.toString();
  }

  async deleteFichaByLoteId(loteId: number): Promise<void> {
    await this.fichasCollection.deleteOne({ lote_id: loteId });
  }

  async findExpedientesByLoteId(loteId: number): Promise<any[]> {
    return this.expedientesCollection.find({ lote_id: loteId }).toArray();
  }

  async insertExpediente(expediente: any): Promise<string> {
    const res = await this.expedientesCollection.insertOne(expediente);
    return res.insertedId.toString();
  }

  async deleteExpedienteById(id: string): Promise<void> {
    await this.expedientesCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async findLotesByNotasCata(nota: string, minScore: number = 80.0): Promise<FichaCalidadDocument[]> {
    // Se escapa la entrada del usuario para que no se interprete como expresión regular (evita ReDoS).
    const notaEscapada = nota.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.fichasCollection
      .find({
        notas_cata: { $regex: new RegExp(notaEscapada, 'i') },
        score_total: { $gte: minScore },
      })
      .sort({ score_total: -1 })
      .toArray();
  }
}
