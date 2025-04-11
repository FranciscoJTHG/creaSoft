"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ErrorComponent from "./ErrorComponent";

const predictionSchema = z.object({
  genero: z
    .string()
    .min(3, { message: "El género debe tener al menos 3 caracteres" }),
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
  director: z.string().optional(),
});

type PredictionFormInputs = z.infer<typeof predictionSchema>;

export default function PredictionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PredictionFormInputs>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      fecha_estreno: new Date(),
    },
  });

  const onSubmit: SubmitHandler<PredictionFormInputs> = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mt-8 space-y-6 justify-items-center"
    >
      {/* Género */}
      <section className="flex flex-col lg:flex-row border border-gray-400 rounded-3xl py-4 px-8 lg:px-16 shadow-lg gap-4 lg:gap-1 justify-between w-11/12 lg:w-full">
        <div className="w-full lg:w-32 min-w-32">
          <label
            htmlFor="genero"
            className="block text-sm font-medium text-black"
          >
            Género
          </label>
          <div className="mt-1">
            <input
              id="genero"
              type="text"
              className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 ${
                errors.genero
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Ej: Acción, Comedia, Drama"
              aria-invalid={errors.genero ? "true" : "false"}
              {...register("genero")}
            />
            {errors.genero && (
              <ErrorComponent message={errors.genero.message} />
            )}
          </div>
        </div>
        <div className="w-px bg-gray-300 mx-4 hidden lg:flex"></div>
        {/* Presupuesto */}
        <div className="w-full lg:w-32 min-w-32">
          <label
            htmlFor="presupuesto"
            className="block text-sm font-medium text-black"
          >
            Presupuesto ($)
          </label>
          <div className="mt-1">
            <input
              id="presupuesto"
              type="number"
              step="any"
              className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2`}
              placeholder="Ej: 1000000"
              min="0"
              aria-invalid={errors.presupuesto ? "true" : "false"}
              {...register("presupuesto", { valueAsNumber: true })}
            />
            {errors.presupuesto && (
              <ErrorComponent message={errors.presupuesto.message} />
            )}
          </div>
        </div>
        <div className="w-px bg-gray-300 mx-4 hidden lg:block"></div>
        {/* Duración */}
        <div className="w-full lg:w-32 min-w-32">
          <label
            htmlFor="duracion"
            className="block text-sm font-medium text-black"
          >
            Duración (min)
          </label>
          <div className="mt-1">
            <input
              id="duracion"
              type="number"
              className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2`}
              placeholder="Ej: 120"
              min="1"
              aria-invalid={errors.duracion ? "true" : "false"}
              {...register("duracion", { valueAsNumber: true })}
            />
            {errors.duracion && (
              <ErrorComponent message={errors.duracion.message} />
            )}
          </div>
        </div>
        <div className="w-px bg-gray-300 mx-4 hidden lg:block"></div>
        {/* Fecha de estreno */}
        <div className="w-full lg:w-32 min-w-32">
          <label
            htmlFor="fecha_estreno"
            className="block text-sm font-medium text-black"
          >
            Fecha de estreno
          </label>
          <div className="mt-1">
            <input
              id="fecha_estreno"
              type="date"
              className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2`}
              aria-invalid={errors.fecha_estreno ? "true" : "false"}
              {...register("fecha_estreno", { valueAsDate: true })}
            />
            {errors.fecha_estreno && (
              <ErrorComponent message={errors.fecha_estreno.message} />
            )}
          </div>
        </div>
        <div className="w-px bg-gray-300 mx-4 hidden lg:block"></div>
        <div className="w-full lg:w-32 min-w-32">
          <label
            htmlFor="director"
            className="block text-sm font-medium text-black"
          >
            Actor Principal
          </label>
          <div className="mt-1">
            <input
              id="director"
              type="text"
              className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
              placeholder="Deshabilitado"
              {...register("director")}
              disabled
            />
          </div>
        </div>
      </section>

      <div>
        <button
          type="submit"
          className="w-60 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Predecir
        </button>
      </div>
    </form>
  );
}
