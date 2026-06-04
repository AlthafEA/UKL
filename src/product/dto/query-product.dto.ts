import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class QueryProductDto {
  @ApiPropertyOptional({
    description: 'Kata kunci pencarian (nama/slug/deskripsi)',
    example: 'sepatu',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan slug kategori',
    example: 'sepatu-running',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'categorySlug must be lowercase alphanumeric words separated by "-"',
  })
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan warna SKU',
    example: 'Hitam',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ukuran SKU',
    example: 'L',
  })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({
    description: 'Harga minimum (Rupiah)',
    example: 50000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Harga maksimum (Rupiah)',
    example: 200000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Nomor halaman',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Jumlah item per halaman',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
