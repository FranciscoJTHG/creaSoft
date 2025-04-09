import Image from "next/image";
import PredictionForm from "@/components/PredictionForm";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-sora)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-5xl">
        <div className="text-center w-full">
          <h1 className="text-4xl sm:text-5xl">Predictor de películas IA</h1>
          <h2 className="text-lg sm:text-xl text-gray-600 mt-2">
            Evalúa el éxito de tu película con IA
          </h2>
        </div>

        <PredictionForm />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
