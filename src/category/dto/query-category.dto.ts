import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class QueryCategoryDto {
  @ApiPropertyOptional({
    description: 'Kata kunci pencarian (nama/slug)',
    example: 'kaos',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan slug',
    example: 'kaos-polos',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Filter kategori aktif/non-aktif',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Nomor halaman (dimulai dari 1)',
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