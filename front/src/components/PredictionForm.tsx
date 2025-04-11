"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorComponent from "./ErrorComponent";
import { useState } from "react";
import PredictionResults from "./ResultsComponents";
import {
  PredictionFormInputs,
  predictionSchema,
} from "@/services/validation-schemas/prediction-form.schema";
import { fetchPrediction } from "@/services/actions/fetch-prediction";

type PredResponse = {
  success: boolean;
  probability: number;
  confidenceLevel: string;
  recommendations: string[];
  factors: {
    seasonalImpact: number;
  };
};

export default function PredictionForm() {
  const [predictionResponse, setPredictionResponse] =
    useState<PredResponse | null>(null);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    reset,
  } = useForm<PredictionFormInputs>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      fecha_estreno: new Date(),
    },
  });

  const handleFetchRes = async () => {
    setApiError("");
    const requestData = {
      title: getValues("title"),
      budget: getValues("presupuesto"),
      runtime: getValues("duracion"),
      genres: [getValues("genero")],
      releaseDate: getValues("fecha_estreno"),
    };
    try {
      const res = await fetchPrediction(requestData);
      setPredictionResponse(res);
      reset({
        title: "",
        presupuesto: undefined,
        duracion: undefined,
        fecha_estreno: new Date(),
        genero: "",
      });
    } catch (e) {
      setApiError("Ocurrió un error, intentelo más tarde");
      console.log(e);
    }
  };

  return (
    <>
      {apiError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      {predictionResponse == null && (
        <form
          onSubmit={handleSubmit(handleFetchRes)}
          className="w-full mt-8 space-y-6 justify-items-center"
        >
          {/* Título y Género */}
          <section className="flex flex-col lg:flex-row border border-gray-400 rounded-3xl py-4 px-8 lg:px-16 shadow-lg gap-4 lg:gap-1 justify-between w-11/12 lg:w-full">
            <div className="w-full lg:w-32 min-w-32">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-black dark:text-slate-300"
              >
                Título
              </label>
              <div className="mt-1">
                <input
                  id="title"
                  type="text"
                  className={`block w-full shadow-sm sm:text-sm dark:bg-gray-600 border-gray-300 rounded-md p-2 ${
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Título de la película"
                  aria-invalid={errors.title ? "true" : "false"}
                  {...register("title")}
                />
                {errors.title && (
                  <ErrorComponent message={errors.title.message} />
                )}
              </div>
            </div>
            <div className="w-px bg-gray-300 mx-4 hidden lg:flex"></div>
            {/* Presupuesto */}
            <div className="w-full lg:w-32 min-w-32">
              <label
                htmlFor="presupuesto"
                className="block text-sm font-medium text-black dark:text-slate-300"
              >
                Presupuesto ($)
              </label>
              <div className="mt-1">
                <input
                  id="presupuesto"
                  type="number"
                  step="any"
                  className={`block w-full shadow-sm sm:text-sm dark:bg-gray-600 border-gray-300 rounded-md p-2`}
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
                className="block text-sm font-medium text-black dark:text-slate-300"
              >
                Duración (min)
              </label>
              <div className="mt-1">
                <input
                  id="duracion"
                  type="number"
                  className={`block w-full shadow-sm sm:text-sm dark:bg-gray-600 border-gray-300 rounded-md p-2`}
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
                className="block text-sm font-medium text-black dark:text-slate-300"
              >
                Fecha de estreno
              </label>
              <div className="mt-1">
                <input
                  id="fecha_estreno"
                  type="date"
                  className={`block w-full shadow-sm sm:text-sm dark:bg-gray-600 border-gray-300 rounded-md p-2`}
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
                htmlFor="genero"
                className="block text-sm font-medium text-black dark:text-slate-300"
              >
                Género
              </label>
              <div className="mt-1">
                <input
                  id="genero"
                  type="text"
                  className="block w-full shadow-sm dark:bg-gray-600 sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="Género de película"
                  {...register("genero")}
                />
              </div>
            </div>
          </section>

          <div>
            <button
              type="submit"
              className="w-60 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 dark:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {isSubmitting ? "Espere por favor..." : "Predecir"}
            </button>
          </div>
        </form>
      )}
      {predictionResponse && predictionResponse.success && (
        <>
          <PredictionResults
            successRate={predictionResponse.probability}
            recommendations={predictionResponse.recommendations}
          />
          <div>
            <button
              className="bg-pink-500 dark:bg-blue-800 rounded-2xl px-6 py-2"
              onClick={() => {
                setPredictionResponse(null);
              }}
            >
              Predecir otra película
            </button>
          </div>
        </>
      )}
    </>
  );
}
