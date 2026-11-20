import { z } from 'zod';

// Esquema para creación de lote físico en bodega (PostgreSQL)
export const CreateLoteSchema = z.object({
  codigo_lote: z.string().min(3).max(50),
  tipo_lote: z.enum(['CEREZA', 'PERGAMINO', 'EXPORTACION']),
  peso_neto_kg: z.number().positive('El peso neto debe ser mayor a 0'),
  bodega_ubicacion: z.string().min(3).max(100),
  variedad: z.string().min(2).max(50),
  precio_base_kg_usd: z.number().positive('El precio base debe ser mayor a 0'),
});
export type CreateLoteDTO = z.infer<typeof CreateLoteSchema>;

// Esquema para mezcla de pergaminos consolidando un lote de exportación (Saga Políglota)
export const MezclaComponenteSchema = z.object({
  codigo_pergamino: z.string().min(3),
  proporcion: z.number().min(0.01).max(1.0, 'La proporción debe estar entre 0.01 y 1.0'),
  kg_aportados: z.number().positive(),
});

export const CreateMezclaSchema = z.object({
  codigo_exportacion: z.string().min(3).max(50),
  variedad_blend: z.string().min(3),
  bodega_ubicacion: z.string().min(3),
  precio_base_kg_usd: z.number().positive(),
  componentes: z.array(MezclaComponenteSchema).min(1, 'Debe incluir al menos 1 lote pergamino aportante'),
});
export type CreateMezclaDTO = z.infer<typeof CreateMezclaSchema>;

// Esquema para evaluación sensorial de catación SCA (MongoDB)
export const FichaCalidadSchema = z.object({
  lote_id: z.number().int().positive(),
  codigo_lote: z.string().min(3),
  catador: z.object({
    nombre: z.string().min(3),
    q_grader_licencia: z.string().min(3),
    laboratorio_sede: z.string().optional(),
  }),
  muestra: z.object({
    humedad_porcentaje: z.number().min(5).max(16),
    actividad_agua_aw: z.number().min(0.1).max(0.9).optional(),
    densidad_aparente_gl: z.number().optional(),
    color_grano: z.string().optional(),
    tueste_agtron: z.number().optional(),
  }).optional(),
  puntajes_sca: z.object({
    fragancia_aroma: z.number().min(0).max(10),
    sabor: z.number().min(0).max(10),
    sabor_residual: z.number().min(0).max(10),
    acidez: z.number().min(0).max(10),
    cuerpo: z.number().min(0).max(10),
    uniformidad: z.number().min(0).max(10),
    balance: z.number().min(0).max(10),
    taza_limpia: z.number().min(0).max(10),
    dulzor: z.number().min(0).max(10),
    puntaje_catador: z.number().min(0).max(10),
  }),
  notas_cata: z.array(z.string()).min(1, 'Debe incluir al menos un descriptor de nota de sabor'),
  conclusion: z.string().optional(),
});
export type FichaCalidadDTO = z.infer<typeof FichaCalidadSchema>;

// Esquema para reporte de alerta sanitaria / cuarentena
export const AlertaCuarentenaSchema = z.object({
  codigo_lote: z.string().min(3),
  analito: z.string().min(2),
  resultado_ppm: z.number().positive(),
  limite_maximo_ppm: z.number().positive(),
  laboratorio: z.string().min(3),
  motivo_rechazo: z.string().min(5),
});
export type AlertaCuarentenaDTO = z.infer<typeof AlertaCuarentenaSchema>;
