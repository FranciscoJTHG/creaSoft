/* eslint-disable */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as fs from 'fs';
import { Movie } from '../../movies/entities/movie.entity';
import { PredictionRequestDto } from '../dto/prediction-request.dto';

@Injectable()
export class ModelTrainingService implements OnModuleInit {
  private model: tf.LayersModel | null = null;
  private featureNames: string[] = [];
  private genres: Set<string> = new Set();
  private modelPath: string;
  private modelMetadataPath: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {
    // Inicializar rutas del modelo
    const basePath = this.configService.get<string>('app.modelSavePath') || './models';
    this.modelPath = path.join(basePath, 'movie_success_model');
    this.modelMetadataPath = path.join(basePath, 'model_metadata.json');
  }

  async onModuleInit() {
    // Configuración básica de TensorFlow
    console.log(`TensorFlow.js version: ${tf.version.tfjs}`);

    // Crear directorio para modelos
    const basePath = this.configService.get<string>('app.modelSavePath') || './models';
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // Cargar modelo existente si está disponible
    try {
      if (fs.existsSync(`${this.modelPath}/model.json`)) {
        this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);

        // Cargar metadatos
        if (fs.existsSync(this.modelMetadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(this.modelMetadataPath, 'utf-8'));
          this.featureNames = metadata.featureNames;
          this.genres = new Set(metadata.genres);
        }

        console.log('Model loaded successfully');
      } else {
        console.log('No pre-existing model found');
      }
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async buildModel(inputFeatures: number): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Arquitectura del modelo
    model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [inputFeatures],
      }),
    );

    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Salida: probabilidad de éxito

    // Compilar el modelo
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Entrenar el modelo con los datos de películas
   */
  async trainModel(options: { epochs: number; batchSize: number } = { epochs: 50, batchSize: 32 }) {
    // Obtener datos de películas de la base de datos
    const movies = await this.moviesRepository.find();

    if (movies.length === 0) {
      throw new Error('No hay suficientes datos para entrenar el modelo');
    }

    // Identificar todos los géneros únicos
    this.genres = new Set();
    for (const movie of movies) {
      if (movie.genres) {
        for (const genre of movie.genres) {
          this.genres.add(genre.name);
        }
      }
    }

    // Definir características después de conocer todos los géneros
    this.featureNames = [
      'budget_normalized',
      'runtime_normalized',
      'release_month',
      'release_day_of_week',
      ...Array.from(this.genres).map(
        (genre) => `genre_${genre.toLowerCase().replace(/\s+/g, '_')}`,
      ),
    ];

    console.log(`Training model with features: ${this.featureNames.join(', ')}`);

    // Preprocesar datos
    const { features, labels } = this.preprocessData(movies);

    // Construir o resetear modelo
    this.model = await this.buildModel(this.featureNames.length);

    // Convertir datos a tensores
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels.map((l) => [l ? 1 : 0]));

    // Entrenar
    const history = await this.model.fit(xs, ys, {
      epochs: options.epochs,
      batchSize: options.batchSize,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
        },
      },
    });

    // Guardar modelo y metadatos
    await this.model.save(`file://${this.modelPath}`);
    fs.writeFileSync(
      this.modelMetadataPath,
      JSON.stringify({
        featureNames: this.featureNames,
        genres: Array.from(this.genres),
        trainingDate: new Date().toISOString(),
        sampleSize: movies.length,
      }),
      'utf-8',
    );

    return {
      epochs: options.epochs,
      featuresUsed: this.featureNames,
      sampleSize: movies.length,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalAccuracy: history.history.acc[history.history.acc.length - 1],
    };
  }

  // Preprocesar datos para entrenamiento
  preprocessData(movies: Movie[]): { features: number[][]; labels: boolean[] } {
    const features: number[][] = [];
    const labels: boolean[] = [];

    // Encontrar valores máximos para normalización
    const maxBudget = Math.max(...movies.map((m) => m.budget || 0));
    const maxRuntime = Math.max(...movies.map((m) => m.runtime || 0));

    for (const movie of movies) {
      // Solo usar películas con datos completos necesarios
      if (
        movie.budget &&
        movie.runtime &&
        movie.releaseDate &&
        movie.genres &&
        movie.isSuccessful !== null
      ) {
        const movieFeatures: number[] = [];

        // Características numéricas normalizadas
        movieFeatures.push(movie.budget / maxBudget); // budget_normalized
        movieFeatures.push(movie.runtime / maxRuntime); // runtime_normalized

        // Características de fecha
        const releaseDate = new Date(movie.releaseDate);
        movieFeatures.push((releaseDate.getMonth() + 1) / 12); // release_month
        movieFeatures.push(releaseDate.getDay() / 6); // release_day_of_week

        // One-hot encoding para géneros
        Array.from(this.genres).forEach((genre) => {
          const hasGenre = movie.genres.some((g) => g.name === genre) ? 1 : 0;
          movieFeatures.push(hasGenre);
        });

        // Agregar a los arrays de entrenamiento
        features.push(movieFeatures);
        labels.push(movie.isSuccessful);
      }
    }
    return { features, labels };
  }

  /**
   * Método para hacer predicciones
   */
  async predict(
    predictionDto: PredictionRequestDto,
  ): Promise<{ success: boolean; probability: number }> {
    if (!this.model) {
      throw new Error('El modelo no está cargado o entrenado');
    }

    // Convertir DTO a formato para predicción
    const movieData = {
      title: predictionDto.title,
      budget: predictionDto.budget,
      runtime: predictionDto.runtime || 0, // Valor por defecto si es undefined
      // Usamos una fecha actual ya que no tienes releaseDate en tu DTO
      releaseDate: new Date(),
      // Convertir correctamente los strings de géneros sin acceder a .name
      genres: predictionDto.genres.map((genreName) => ({ name: genreName })),
      // Como no tienes overview, usamos un string vacío o el título como fallback
      overview: '',
    };

    // Preprocesar entrada para el modelo
    const input = this.preprocessInput(movieData);

    // Predecir
    const inputTensor = tf.tensor2d([input]);
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const probability = prediction.dataSync()[0];

    // Liberar memoria
    inputTensor.dispose();
    prediction.dispose();

    return {
      success: probability > 0.5,
      probability,
    };
  }

  /**
   * Preprocesar datos de entrada para predicción
   */
  preprocessInput(movieData: any): number[] {
    const input: number[] = [];

    // Obtener películas para normalización
    // En una implementación real, estos valores deberían estar guardados con el modelo
    // Esta es una versión simplificada
    const maxBudget = 400000000; // Valor aproximado
    const maxRuntime = 240; // 4 horas como max

    // Características numéricas normalizadas
    input.push(movieData.budget / maxBudget); // budget_normalized
    input.push(movieData.runtime / maxRuntime); // runtime_normalized

    // Características de fecha
    const releaseDate = new Date(movieData.releaseDate);
    input.push((releaseDate.getMonth() + 1) / 12); // release_month
    input.push(releaseDate.getDay() / 6); // release_day_of_week

    // One-hot encoding para géneros
    Array.from(this.genres).forEach((genre) => {
      const hasGenre = movieData.genres.some((g) => g.name === genre) ? 1 : 0;
      input.push(hasGenre);
    });

    return input;
  }

  /**
   * Obtiene información sobre el modelo actual
   */
  getModelInfo(): {
    isLoaded: boolean;
    architecture?: string;
    lastTrainingDate?: Date | string;
    metadata?: any;
  } {
    // Verificar si el modelo está cargado
    const isLoaded = this.model !== null;

    // Obtener información sobre el modelo
    let lastTrainingDate: Date | undefined;
    let metadata: any = undefined;

    try {
      // Verificar si existe el archivo del modelo
      if (fs.existsSync(`${this.modelPath}/model.json`)) {
        const stats = fs.statSync(`${this.modelPath}/model.json`);
        lastTrainingDate = stats.mtime;
      }

      // Verificar si existe el archivo de metadatos
      if (fs.existsSync(this.modelMetadataPath)) {
        const metadataContent = fs.readFileSync(this.modelMetadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      }
    } catch (error) {
      console.error('Error al obtener información del modelo:', error);
    }

    return {
      isLoaded,
      // Si el modelo está cargado, incluir su arquitectura
      architecture: this.model ? JSON.stringify(this.model.toJSON()) : undefined,
      lastTrainingDate,
      metadata,
    };
  }
}
