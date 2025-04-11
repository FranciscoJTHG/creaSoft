"use client";

import React from "react";

interface PredictionResultsProps {
  successRate: number;
  recommendations?: string[];
}

export default function PredictionResults({
  successRate,
  recommendations = [],
}: PredictionResultsProps) {
  const rate = (successRate * 100).toFixed(1);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashArray = successRate * circumference;

  return (
    <div className="dark:bg-slate-800 bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
      <h3 className="text-center text-gray-800 text-sm mb-6 dark:text-gray-400">
        Estos son los resultados estimados para tu película, basados en datos
        históricos y aprendizaje automático con inteligencia artificial
      </h3>

      {/* Success Rate Section */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold mb-4 text-center">
          Tasa de éxito
        </h4>
        <div className="relative w-48 h-48 mx-auto">
          {/* SVG Circle Progress */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-gray-200 dark:stroke-slate-900"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-pink-500 dark:stroke-blue-800"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: circumference - dashArray,
                transition: "stroke-dashoffset 1s ease-in-out",
              }}
            />
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{rate}%</span>
            <span className="text-sm text-gray-600">Éxito medio</span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div>
        <h4 className="text-xl font-semibold mb-2">Recomendaciones</h4>
        {recommendations.map((rec, index) => {
          return (
            <li>
              {" "}
              <span
                key={index}
                className="text-gray-600 dark:text-gray-400 text-sm"
              >
                {rec}
              </span>
            </li>
          );
        })}
      </div>
    </div>
  );
}
