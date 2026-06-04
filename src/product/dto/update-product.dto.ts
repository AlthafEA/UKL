import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateProductDto {
  /**
   * Action type supaya 1 modul product bisa handle:
   * - update product
   * - update sku
   * - update stock
   */
  @ApiPropertyOptional({
    description: 'Tipe aksi update',
    enum: ['PRODUCT', 'SKU', 'STOCK', 'IMAGE'],
    example: 'PRODUCT',
  })
  @IsString()
  @IsOptional()
  type?: 'PRODUCT' | 'SKU' | 'STOCK' | 'IMAGE';

  // ========== PRODUCT ==========
  @ApiPropertyOptional({
    description: 'ID kategori baru',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Nama produk baru',
    example: 'Sepatu Formal Premium',
  })
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug baru',
    example: 'sepatu-formal-premium',
  })
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi produk baru',
    example: 'Sepatu formal premium bahan kulit sintetis',
  })
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Harga dasar baru (Rupiah)',
    example: 95000,
    minimum: 0,
  })
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsInt()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'URL gambar produk',
  })
  @ValidateIf((o) => !o.type || o.type === 'IMAGE')
  @IsString()
  @IsOptional()
  imageUrl?: string;

  // ========== SKU ==========
  @ApiPropertyOptional({
    description: 'Warna varian baru (type=SKU)',
    example: 'Putih',
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Ukuran varian baru (type=SKU)',
    example: 'XL',
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsOptional()
  size?: string;

  // ========== STOCK ==========
  @ApiPropertyOptional({
    description: 'Jumlah stok baru (type=STOCK)',
    example: 100,
    minimum: 0,
  })
  @ValidateIf((o) => o.type === 'STOCK')
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}
