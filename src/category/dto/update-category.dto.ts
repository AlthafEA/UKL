import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nama kategori baru',
    example: 'Kaos Premium',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug baru (lowercase alphanumeric + dash)',
    example: 'kaos-premium',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Status aktif/non-aktif',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}