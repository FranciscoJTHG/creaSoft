/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { ModelTrainingService } from './model-training.service';
import { PredictionRequestDto } from '../dto/prediction-request.dto';
import { MoviePredictionResponse } from '../interfaces/movie-prediction.interface';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(private modelTrainingService: ModelTrainingService) {}

  /**
   * Realiza una predicción del éxito de una película basada en sus características
   */
  async predictMovieSuccess(predictionDto: PredictionRequestDto): Promise<MoviePredictionResponse> {
    this.logger.log(`Realizando predicción para: ${predictionDto.title}`);

    // Obtener la predicción básica del modelo
    const basicPrediction = await this.modelTrainingService.predict(predictionDto);

    // Ajustar la predicción basada en la fecha de lanzamiento si está disponible
    let adjustedProbability = basicPrediction.probability;
    if (predictionDto.releaseDate) {
      adjustedProbability = this.adjustProbabilityByReleaseDate(
        basicPrediction.probability,
        predictionDto.releaseDate,
      );
    }

    // Añadir nivel de confianza basado en la probabilidad ajustada
    const confidenceLevel = this.getConfidenceLevel(adjustedProbability);

    // Generar recomendaciones basadas en la predicción y la fecha
    const recommendations = this.generateRecommendations(predictionDto, adjustedProbability);

    return {
      success: basicPrediction.success,
      probability: adjustedProbability,
      confidenceLevel,
      recommendations,
      factors: {
        seasonalImpact: adjustedProbability / basicPrediction.probability //,
        // genrePerformance: this.calculateGenrePerformance(movie.genres),
        // budgetEfficiency: this.calculateBudgetEfficiency(movie.budget, movie.genres)
      }
    };
  }

  /**
   * Ajusta la probabilidad basada en la fecha de lanzamiento
   */
  private adjustProbabilityByReleaseDate(probability: number, releaseDate: Date): number {
    const month = new Date(releaseDate).getMonth();
    const day = new Date(releaseDate).getDay(); // 0-6 (domingo-sábado)
    let seasonalFactor = 1.0;

    // Ajustes según temporada de lanzamiento
    // Verano (mayo-agosto): temporada de blockbusters
    if (month >= 3 && month <= 7) {
      seasonalFactor = 1.15;
    }
    // Invierno (noviembre-diciembre): temporada de premios y películas familiares
    else if (month >= 10 && month <= 11) {
      seasonalFactor = 1.1;
    }
    // Enero-marzo: temporalmente bajas en taquilla
    else if (month >= 0 && month <= 2) {
      seasonalFactor = 0.9;
    }

    let dayFactor = 1.0;
    if (day === 5) { // Viernes
      dayFactor = 1.05; // Mejor día para estrenos
    }

    // Limitar la probabilidad entre 0 y 1
    const adjustedProbability = Math.min(Math.max(probability * seasonalFactor * dayFactor, 0), 1);

    return adjustedProbability;
  }

  /**
   * Determina el nivel de confianza basado en la probabilidad
   */
  private getConfidenceLevel(probability: number): string {
    if (probability < 0.35 || probability > 0.85) {
      return 'Alta';  // Alta confianza cuando la probabilidad es muy baja o muy alta
    } else if (probability < 0.45 || probability > 0.75) {
      return 'Media';
    } else {
      return 'Baja';  // Baja confianza cuando está cerca del 50%
    }
  }

  /**
   * Genera recomendaciones para mejorar las posibilidades de éxito
   */
  private generateRecommendations(movie: PredictionRequestDto, probability: number): string[] {
    const recommendations: string[] = [];
    
    // Registrar los datos que estamos recibiendo para depuración
    this.logger.log(`Generando recomendaciones para: ${movie.title}, prob: ${probability}`);
    this.logger.log(`Datos: presupuesto=${movie.budget}, duración=${movie.runtime}, géneros=${movie.genres?.join(',')}`);
  
    if (probability < 0.5) {
      // Código existente para baja probabilidad...
    } else if (probability < 0.75) {
      recommendations.push('Aunque las probabilidades son favorables, considere estas mejoras:');
      
      // AÑADIR SIEMPRE AL MENOS UNA RECOMENDACIÓN GENERAL
      recommendations.push('Invertir en marketing digital para aumentar el alcance y visibilidad');
      
      // Verificar si tenemos información sobre la fecha
      if (movie.releaseDate) {
        const releaseDate = new Date(movie.releaseDate);
        const month = releaseDate.getMonth();
        
        if (month >= 0 && month <= 2) { // Enero-Marzo
          recommendations.push('Considerar mover la fecha de estreno a temporadas más favorables (mayo-agosto)');
        }
      } else {
        recommendations.push('Especificar una fecha de lanzamiento estratégica, preferiblemente en temporada alta');
      }
      
      // Verificaciones de presupuesto (con comprobación de nulos)
      if (movie.budget !== undefined && movie.budget < 50000000) {
        recommendations.push('Evaluar la posibilidad de incrementar el presupuesto para mejorar la calidad de producción');
      }
      
      // Verificaciones de duración (con comprobación de nulos)
      if (movie.runtime !== undefined) {
        if (movie.runtime < 90) {
          recommendations.push('Considerar extender la duración a 90-120 minutos para alinearse con las expectativas del público');
        } else if (movie.runtime > 150) {
          recommendations.push('Evaluar si la duración puede optimizarse para permitir más proyecciones diarias');
        }
      } else {
        recommendations.push('Definir una duración óptima entre 90 y 120 minutos para maximizar proyecciones diarias');
      }
      
      // Verificaciones de géneros (con comprobación de nulos)
      if (movie.genres && movie.genres.length > 0) {
        // Recomendaciones específicas según el género
        if (movie.genres.some(g => ['Action', 'Adventure', 'Sci-Fi'].includes(g))) {
          recommendations.push('Para películas de acción/aventura/sci-fi, asegurar efectos visuales de alta calidad');
        }
        
        if (movie.genres.includes('Drama') || movie.genres.includes('Romance')) {
          recommendations.push('Considerar estrategias de marketing que destaquen la profundidad emocional de la historia');
        }
      } else {
        recommendations.push('Definir claramente los géneros principales para enfocar mejor las estrategias de marketing');
      }
    } else {
      // Alta probabilidad
      recommendations.push('Las perspectivas son excelentes. Para maximizar el éxito:');
      recommendations.push('Implementar una campaña de marketing pre-estreno agresiva');
      recommendations.push('Considerar una estrategia de distribución internacional');
      recommendations.push('Explorar oportunidades de merchandising y franquicias');
    }
    
    this.logger.log(`Total recomendaciones generadas: ${recommendations.length}`);
    return recommendations;
  }
}