import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nama kategori',
    example: 'Sepatu Running',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Slug URL-friendly (lowercase alphanumeric + dash)',
    example: 'sepatu-running',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug!: string;
}
