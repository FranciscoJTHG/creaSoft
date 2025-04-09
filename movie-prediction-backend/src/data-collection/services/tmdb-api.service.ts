import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { Movie } from '../../movies/entities/movie.entity';
import { Genre } from '../../movies/entities/genre.entity';

// Definir la interfaz MovieDetails
export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  budget: number;
  revenue: number;
  runtime: number;
  release_date: string;
  imdb_id: string;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
}

// Interfaz para la respuesta de la API de géneros
interface GenreResponse {
  genres: Array<{ id: number; name: string }>;
}

// interface MovieListItem {
//   id: number;
//   title: string;
//   poster_path: string | null;
//   release_date: string;
//   overview: string;
//   vote_average: number;
//   vote_count: number;
//   // Puedes añadir más campos según necesites
// }

// // Interfaz para la respuesta de películas populares
// interface PopularMoviesResponse {
//   page: number;
//   results: MovieListItem[]; // Ahora usamos MovieListItem en lugar de any
//   total_results: number;
//   total_pages: number;
// }

@Injectable()
export class TmdbApiService {
  private apiKey: string;
  private baseUrl: string;
  private readonly logger = new Logger(TmdbApiService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
  ) {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    if (!apiKey) {
      throw new Error('TMDB API key is not configured');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  async fetchGenres(): Promise<Map<number, Genre>> {
    const genreMap = new Map<number, Genre>();

    try {
      // Usar HttpService con firstValueFrom
      const { data } = await firstValueFrom(
        this.httpService.get<GenreResponse>(`${this.baseUrl}/genre/movie/list`, {
          params: {
            api_key: this.apiKey,
          },
        }),
      );

      // Procesar los géneros
      for (const tmdbGenre of data.genres) {
        let genre = await this.genresRepository.findOne({
          where: { name: tmdbGenre.name },
        });

        if (!genre) {
          genre = new Genre();
          genre.name = tmdbGenre.name;
          genre = await this.genresRepository.save(genre);
        }

        genreMap.set(tmdbGenre.id, genre);
      }

      return genreMap;
    } catch (error) {
      this.logger.error(
        `Error fetching genres: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async fetchPopularMovies(page: number): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.baseUrl}/movie/popular`, {
            params: {
              api_key: this.apiKey,
              page,
            },
          })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          .pipe(map((response: AxiosResponse) => response.data)),
      );
      return response;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error fetching popular movies: ${error.message}`);
      throw error;
    }
  }

  async fetchMovieDetails(tmdbId: number): Promise<MovieDetails> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MovieDetails>(`${this.baseUrl}/movie/${tmdbId}`, {
          params: { api_key: this.apiKey },
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Error fetching movie details for ID ${tmdbId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async collectAndSaveMovies(pages = 5): Promise<number> {
    const genreMap = await this.fetchGenres();
    let savedCount = 0;

    for (let page = 1; page <= pages; page++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const movies = await this.fetchPopularMovies(page);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (const movieData of movies.results) {
        try {
          const existingMovie = await this.moviesRepository.findOne({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            where: { tmdbId: movieData.id },
          });

          if (existingMovie) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.logger.log(`Movie ${movieData.title} already exists, skipping`);
            continue;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const details = await this.fetchMovieDetails(movieData.id);

          const movie = new Movie();
          movie.title = details.title;
          movie.overview = details.overview;
          movie.budget = details.budget;
          movie.revenue = details.revenue;
          movie.runtime = details.runtime;
          movie.releaseDate = new Date(details.release_date);
          movie.tmdbId = details.id;
          movie.imdbId = details.imdb_id;
          movie.voteAverage = details.vote_average;
          movie.voteCount = details.vote_count;

          movie.genres = [];
          for (const genreId of details.genres.map((g) => g.id)) {
            const genre = genreMap.get(genreId);
            if (genre) {
              movie.genres.push(genre);
            }
          }

          if (details.budget > 0 && details.revenue > 0) {
            movie.isSuccessful = movie.calculateSuccess();
          }

          await this.moviesRepository.save(movie);
          savedCount++;
          this.logger.log(`Saved movie: ${movie.title}`);

          // Esperar un poco entre peticiones para no sobrecargar la API
          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (error) {
          this.logger.error(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Error processing movie ${movieData.title}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    }

    return savedCount;
  }
}
