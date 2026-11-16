import { z } from "zod";

// Update the schema to include title instead of actor
export const predictionSchema = z.object({
    title: z
      .string()
      .min(3, { message: "El título debe tener al menos 3 caracteres" }),
    presupuesto: z
      .number({ invalid_type_error: "El presupuesto debe ser un número" })
      .positive({ message: "El presupuesto debe ser positivo" }),
    duracion: z
      .number({ invalid_type_error: "La duración debe ser un número entero" })
      .int({ message: "La duración debe ser un número entero" })
      .positive({ message: "La duración debe ser positiva" }),
    fecha_estreno: z.date({
      required_error: "La fecha de estreno es requerida",
      invalid_type_error: "Formato de fecha inválido",
    }),
    genero: z
      .string()
      .min(3, { message: "El género debe tener al menos 3 caracteres" }),
  });
  
export type PredictionFormInputs = z.infer<typeof predictionSchema>;