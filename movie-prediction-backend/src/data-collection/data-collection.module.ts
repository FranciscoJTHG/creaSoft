import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DataCollectionController } from '../data-collection/controllers/data-collection.controller';
import { TmdbApiService } from '../data-collection/services/tmdb-api.service';
import { Movie } from '../movies/entities/movie.entity';
import { Genre } from '../movies/entities/genre.entity';
import { MlModule } from '../ml/ml.module';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Movie, Genre]), ConfigModule, MlModule],
  controllers: [DataCollectionController],
  providers: [TmdbApiService],
})
export class DataCollectionModule {}
