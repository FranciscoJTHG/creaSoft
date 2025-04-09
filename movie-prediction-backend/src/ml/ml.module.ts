import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelTrainingService } from './services/model-training.service';
import { PredictionService } from './services/prediction.service';
import { DataPreprocessingService } from './services/data-preprocessing.service';
import { ModelController } from '../ml/controllers/ml.controller';
import { Movie } from '../movies/entities/movie.entity';
import { Genre } from '../movies/entities/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre])],
  controllers: [ModelController],
  providers: [ModelTrainingService, PredictionService, DataPreprocessingService],
  exports: [ModelTrainingService, PredictionService, DataPreprocessingService],
})
export class MlModule {}
