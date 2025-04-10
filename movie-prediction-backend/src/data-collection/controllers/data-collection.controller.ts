import { Controller, Post, Get, Param, Query, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TmdbApiService } from '../services/tmdb-api.service';
import { Movie } from '../../movies/entities/movie.entity';
import { Genre } from '../../movies/entities/genre.entity';
import { DataPreprocessingService } from '../../ml/services/data-preprocessing.service';

@ApiTags('data-collection')
@Controller('(api/data')
export class DataCollectionController {
  private readonly logger = new Logger('DataCollectionController');

  constructor(
    private readonly tmdbApiService: TmdbApiService,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
    private readonly dataPreprocessingService: DataPreprocessingService,
  ) {}

  @Post('collect')
  async collectMovieData(@Query('pages') pages: number = 5) {
    const savedCount = await this.tmdbApiService.collectAndSaveMovies(pages);
    return {
      status: 'success',
      message: `Collected and saved ${savedCount} movies`,
    };
  }

  @Get('movie/:tmdbId')
  async getMovieDetails(@Param('tmdbId') tmdbId: string) {
    this.logger.log(`Fetching details for TMDB ID: ${tmdbId}`);

    const movieDetails = await this.tmdbApiService.fetchMovieDetails(parseInt(tmdbId, 10));
    return movieDetails;
  }

  // Nuevo endpoint para probar la conexión
  @ApiOperation({ summary: 'Probar conexión con TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Conexión establecida correctamente',
    // schema: {
    //   example: {
    //     success: true,
    //     message: 'Conexión con TMDB establecida correctamente',
    //     data: {
    //       /* ejemplo de datos */
    //     },
    //   },
    // },
  })
  @Get('test-connection')
  async testTmdbConnection() {
    try {
      // Usa un método existente como fetchMovieDetails o implementa uno nuevo
      // Aquí uso un ID de película popular como ejemplo (ID 550 = Fight Club)
      const result = await this.tmdbApiService.fetchMovieDetails(550);

      return {
        success: true,
        message: 'Conexión con TMDB establecida correctamente',
        data: {
          title: result.title,
          id: result.id,
          overview: result.overview ? result.overview.substring(0, 100) + '...' : '',
          // Incluye otros campos relevantes pero limitados para no sobrecargar la respuesta
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al conectar con TMDB API',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }

  @ApiOperation({ summary: 'Actualizar dataset con películas populares' })
  @ApiResponse({
    status: 200,
    description: 'Dataset actualizado con películas populares',
  })
  @Post('update-dataset')
  async updateDataset(@Query('pages') pages: number = 3) {
    this.logger.log(`Actualizando dataset con ${pages} páginas de películas populares`);
    const newMoviesCount = await this.tmdbApiService.collectAndSaveMovies(pages);

    return {
      status: 'success',
      message: `Dataset actualizado, ${newMoviesCount} películas populares añadidas`,
    };
  }

  @ApiOperation({ summary: 'Preparar datos para entrenamiento' })
  @ApiResponse({
    status: 200,
    description: 'Datos preparados para entrenamiento',
  })
  @Post('prepare-training-data')
  async prepareTrainingData() {
    this.logger.log('Preparando datos para entrenamiento');

    // Aquí necesitarías inyectar un DataPreprocessingService
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await this.dataPreprocessingService.prepareTrainingData();

    return {
      status: 'success',
      message: 'Datos preparados para entrenamiento',
    };
  }

  @ApiOperation({ summary: 'Validar calidad de datos' })
  @ApiResponse({
    status: 200,
    description: 'Validación de datos completada',
  })
  @Get('validate-data')
  async validateData() {
    this.logger.log('Validando calidad de los datos');

    // Implementar validación de datos (películas sin información, outliers, etc.)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const validation = await this.dataPreprocessingService.validateDataQuality();

    return {
      status: 'success',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      validation,
    };
  }
}
