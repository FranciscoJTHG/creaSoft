import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, Min, IsOptional, IsDateString } from 'class-validator';

export class PredictionRequestDto {
  @ApiProperty({
    description: 'Título de la película',
    example: 'Avatar',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Presupuesto de producción en USD',
    example: 150000000,
  })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({
    description: 'Duración de la película en minutos',
    example: 120,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  runtime?: number;

  @ApiProperty({
    description: 'Lista de géneros de la película',
    example: ['Action', 'Adventure', 'Sci-Fi'],
  })
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    description: 'Fecha de lanzamiento de la película',
    example: '2023-07-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  releaseDate?: Date;
}
