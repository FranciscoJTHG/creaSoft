import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Genre } from './genre.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'int', nullable: true })
  runtime: number; // duración en minutos

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  // Campos adicionales útiles para el modelo ML
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: true })
  revenue: number;

  @Column({ nullable: true })
  overview: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0, nullable: true })
  voteAverage: number;

  @Column({ type: 'int', default: 0, nullable: true })
  voteCount: number;

  // Relación con géneros (Many-to-Many)
  @ManyToMany(() => Genre, (genre) => genre.movies, {
    cascade: true,
    eager: true, // Carga automáticamente los géneros al consultar una película
  })
  @JoinTable({
    name: 'movie_genre', // Nombre de la tabla de relación
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'genre_id',
      referencedColumnName: 'id',
    },
  })
  genres: Genre[];

  // IDs externos para integración con APIs
  @Column({ nullable: true })
  tmdbId: number;

  @Column({ nullable: true })
  imdbId: string;

  // Campos para auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campo que indica si la película fue exitosa (usado para entrenamiento)
  @Column({ type: 'boolean', nullable: true })
  isSuccessful: boolean | null;

  // Método auxiliar para calcular si una película fue exitosa basado en su ROI
  calculateSuccess(): boolean | null {
    if (!this.budget || this.budget <= 0 || !this.revenue) return null;
    const roi = this.revenue / this.budget;
    return roi >= 1.5; // Consideramos éxito si al menos recuperó 1.5 veces su presupuesto
  }
}
