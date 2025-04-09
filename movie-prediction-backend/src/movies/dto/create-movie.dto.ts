import {
  IsString,
  IsNumber,
  IsOptional,
  // IsDate,
  IsArray,
  ValidateNested,
  IsPositive,
  IsInt,
  Min,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

class GenreDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  budget: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  runtime: number; // duración en minutos

  @IsOptional()
  @IsISO8601()
  releaseDate: string; // formato ISO para fechas

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreDto)
  genres: GenreDto[];

  @IsOptional()
  @IsString()
  overview: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  revenue: number;

  @IsOptional()
  @IsNumber()
  tmdbId: number;

  @IsOptional()
  @IsString()
  imdbId: string;
}
