import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { Genre } from '../entities/genre.entity';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = new Movie();
    movie.title = createMovieDto.title;
    movie.budget = createMovieDto.budget;
    movie.runtime = createMovieDto.runtime;
    movie.releaseDate = new Date(createMovieDto.releaseDate);
    movie.overview = createMovieDto.overview;
    movie.revenue = createMovieDto.revenue;
    movie.tmdbId = createMovieDto.tmdbId;
    movie.imdbId = createMovieDto.imdbId;

    // Procesar géneros
    if (createMovieDto.genres && createMovieDto.genres.length > 0) {
      const genres: Genre[] = [];
      for (const genreDto of createMovieDto.genres) {
        let genre;
        if (genreDto.id) {
          genre = await this.genresRepository.findOne({ where: { id: genreDto.id } });
        } else if (genreDto.name) {
          genre = await this.genresRepository.findOne({ where: { name: genreDto.name } });
          if (!genre) {
            genre = new Genre();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            genre.name = genreDto.name;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            genre = await this.genresRepository.save(genre);
          }
        }
        if (genre) {
          genres.push(genre);
        }
      }
      movie.genres = genres;
    }

    // Calcular si la película fue exitosa (si hay datos de revenue y budget)
    if (movie.revenue && movie.budget) {
      movie.isSuccessful = movie.calculateSuccess();
    }

    return this.moviesRepository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return this.moviesRepository.find();
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);

    // Actualizar campos simples
    if (updateMovieDto.title) movie.title = updateMovieDto.title;
    if (updateMovieDto.budget) movie.budget = updateMovieDto.budget;
    if (updateMovieDto.runtime) movie.runtime = updateMovieDto.runtime;
    if (updateMovieDto.releaseDate) movie.releaseDate = new Date(updateMovieDto.releaseDate);
    if (updateMovieDto.overview) movie.overview = updateMovieDto.overview;
    if (updateMovieDto.revenue) {
      movie.revenue = updateMovieDto.revenue;
      movie.isSuccessful = movie.calculateSuccess();
    }
    if (updateMovieDto.tmdbId) movie.tmdbId = updateMovieDto.tmdbId;
    if (updateMovieDto.imdbId) movie.imdbId = updateMovieDto.imdbId;

    // Actualizar géneros si se proporcionan
    if (updateMovieDto.genres && updateMovieDto.genres.length > 0) {
      const genres: Genre[] = [];
      for (const genreDto of updateMovieDto.genres) {
        let genre;
        if (genreDto.id) {
          genre = await this.genresRepository.findOne({ where: { id: genreDto.id } });
        } else if (genreDto.name) {
          genre = await this.genresRepository.findOne({ where: { name: genreDto.name } });
          if (!genre) {
            genre = new Genre();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            genre.name = genreDto.name;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            genre = await this.genresRepository.save(genre);
          }
        }
        if (genre) {
          genres.push(genre);
        }
      }
      movie.genres = genres;
    }

    return this.moviesRepository.save(movie);
  }

  async remove(id: number): Promise<void> {
    const result = await this.moviesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }
}
