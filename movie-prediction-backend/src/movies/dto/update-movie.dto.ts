// update-movie.dto.ts
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsNumber()
  @IsOptional()
  revenue?: number;

  @IsNumber()
  @IsOptional()
  runtime?: number;

  @IsOptional()
  releaseDate?: string | Date;

  @IsNumber()
  @IsOptional()
  tmdbId?: number;

  @IsString()
  @IsOptional()
  imdbId?: string;

  @IsArray()
  @IsOptional()
  genres?: Array<{ id?: number; name?: string }>;
}
