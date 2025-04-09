import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsPositive,
  IsInt,
  Min,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

class GenrePredictionDto {
  @IsString()
  name: string;
}

export class PredictionRequestDto {
  @IsString()
  title: string;

  @IsPositive()
  @IsNumber()
  budget: number;

  @IsInt()
  @Min(1)
  runtime: number; // duración en minutos

  @IsISO8601()
  releaseDate: string; // formato ISO para fechas

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenrePredictionDto)
  genres: GenrePredictionDto[];

  @IsOptional()
  @IsString()
  overview?: string;
}
