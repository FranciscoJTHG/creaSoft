import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModelTrainingService } from '../services/model-training.service';
import { PredictionService } from '../services/prediction.service';
import { DataPreprocessingService } from '../services/data-preprocessing.service';
import { PredictionRequestDto } from '../dto/prediction-request.dto';
import { MoviePredictionResponse } from '../interfaces/movie-prediction.interface';

@ApiTags('ml')
@Controller('ml')
export class ModelController {
  private readonly logger = new Logger(ModelController.name);

  constructor(
    private modelTrainingService: ModelTrainingService,
    private predictionService: PredictionService,
    private dataPreprocessingService: DataPreprocessingService,
  ) {}

  @ApiOperation({ summary: 'Entrenar el modelo de predicción' })
  @ApiResponse({
    status: 200,
    description: 'Modelo entrenado exitosamente',
  })
  @Post('train')
  async trainModel(@Body() options: { epochs?: number; batchSize?: number }) {
    this.logger.log(`Iniciando entrenamiento con opciones: ${JSON.stringify(options)}`);

    // Validar calidad de datos antes de entrenar
    const dataQuality = await this.dataPreprocessingService.validateDataQuality();

    if (dataQuality.qualityScore < 50) {
      return {
        status: 'error',
        message: 'La calidad de los datos es insuficiente para entrenar un modelo confiable',
        dataQuality,
      };
    }

    // Entrenar el modelo
    const result = await this.modelTrainingService.trainModel({
      epochs: options.epochs || 50,
      batchSize: options.batchSize || 32,
    });

    return {
      status: 'success',
      message: 'Modelo entrenado exitosamente',
      result,
      dataQuality,
    };
  }

  @ApiOperation({ summary: 'Predecir el éxito de una película' })
  @ApiResponse({
    status: 200,
    description: 'Predicción generada exitosamente',
  })
  @Post('predict')
  async predict(@Body() predictionDto: PredictionRequestDto): Promise<MoviePredictionResponse> {
    this.logger.log(`Predicción solicitada para: ${predictionDto.title}`);
    this.logger.log('Datos recibidos:', JSON.stringify(predictionDto));
    return this.predictionService.predictMovieSuccess(predictionDto);
  }

  @ApiOperation({ summary: 'Obtener información del modelo actual' })
  @ApiResponse({ status: 200, description: 'Información del modelo' })
  @Get('model-info')
  // eslint-disable-next-line @typescript-eslint/require-await
  async getModelInfo() {
    return this.modelTrainingService.getModelInfo();
  }

  @ApiOperation({ summary: 'Validar calidad de datos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de calidad de datos',
  })
  @Get('data-quality')
  async checkDataQuality() {
    const quality = await this.dataPreprocessingService.validateDataQuality();

    return {
      status: 'success',
      data: quality,
      recommendation:
        quality.qualityScore >= 70
          ? 'Los datos son adecuados para entrenar un modelo confiable'
          : 'Se recomienda mejorar la calidad de los datos antes de entrenar',
    };
  }
}
