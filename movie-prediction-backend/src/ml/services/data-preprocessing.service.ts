/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

interface MovieFeature {
  budget: number;
  runtime: number;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
}

@Injectable()
export class DataPreprocessingService {
  private readonly logger = new Logger(DataPreprocessingService.name);

  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  // Prepara y formatea los datos para entrenamiento
  async prepareTrainingData(): Promise<{ features: MovieFeature[]; labels: number[] }> {
    this.logger.log('Preparando datos para entrenamiento');

    // Obtener películas con datos completos de presupuesto y ganancias
    const movies = await this.moviesRepository.find({
      relations: ['genres'],
      where: [
        { budget: (() => 'budget > 0') as any },
        { revenue: (() => 'revenue > 0') as any },
        { isSuccessful: (() => 'is_successful IS NOT NULL') as any },
      ],
    });

    this.logger.log(`Se encontraron ${movies.length} películas para entrenamiento`);

    const features: MovieFeature[] = [];
    const labels: number[] = [];

    for (const movie of movies) {
      // Extraer características relevantes para el modelo
      const movieFeatures: MovieFeature = {
        budget: this.normalize(movie.budget, 'budget'),
        runtime: this.normalize(movie.runtime, 'runtime'),
        voteAverage: movie.voteAverage / 10,
        voteCount: this.normalize(movie.voteCount, 'voteCount'),
        genreIds: movie.genres.map((g) => g.id),
      };

      features.push(movieFeatures);
      labels.push(movie.isSuccessful ? 1 : 0);
    }

    return { features, labels };
  }

  async validateDataQuality(): Promise<{
    totalMovies: number;
    moviesWithCompleteData: number;
    moviesWithBudget: number;
    moviesWithRevenue: number;
    moviesWithGenres: number;
    qualityScore: number;
  }> {
    this.logger.log('Validando calidad de los datos');

    // Contar películas totales
    const totalMovies = await this.moviesRepository.count();

    // Contar películas con presupuesto usando QueryBuilder
    const moviesWithBudget = await this.moviesRepository
      .createQueryBuilder('movie')
      .where('movie.budget > 0')
      .getCount();

    // Contar películas con ingresos
    const moviesWithRevenue = await this.moviesRepository
      .createQueryBuilder('movie')
      .where('movie.revenue > 0')
      .getCount();

    // Contar películas con datos completos
    const moviesWithCompleteData = await this.moviesRepository
      .createQueryBuilder('movie')
      .where('movie.budget > 0')
      .andWhere('movie.revenue > 0')
      .getCount();

    // Contar películas con géneros (esta parte ya está bien)
    const moviesWithGenres = await this.moviesRepository
      .createQueryBuilder('movie')
      .innerJoin('movie.genres', 'genre')
      .getCount();

    // Calcular puntuación de calidad (sin cambios)
    const budgetScore = (moviesWithBudget / totalMovies) * 30;
    const revenueScore = (moviesWithRevenue / totalMovies) * 30;
    const genreScore = (moviesWithGenres / totalMovies) * 20;
    const completeDataScore = (moviesWithCompleteData / totalMovies) * 20;

    const qualityScore = Math.round(budgetScore + revenueScore + genreScore + completeDataScore);

    return {
      totalMovies,
      moviesWithCompleteData,
      moviesWithBudget,
      moviesWithRevenue,
      moviesWithGenres,
      qualityScore,
    };
  }

  // Normalización simple (puedes mejorar esto con técnicas más avanzadas)
  private normalize(value: number, feature: string): number {
    const maxValues: Record<string, number> = {
      budget: 300000000, // $300M como presupuesto máximo típico
      runtime: 240, // 4 horas como duración máxima típica
      voteCount: 10000, // 10K votos como máximo típico
    };

    return value / maxValues[feature];
  }
}
