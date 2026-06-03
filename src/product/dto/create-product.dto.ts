import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  /**
   * Action type supaya 1 modul product bisa handle:
   * - create product
   * - create sku
   */
  @ApiProperty({
    description: 'Tipe aksi: PRODUCT untuk buat produk, SKU untuk buat varian',
    enum: ['PRODUCT', 'SKU'],
    example: 'PRODUCT',
  })
  @IsString()
  @IsNotEmpty()
  type!: 'PRODUCT' | 'SKU';

  // ========== PRODUCT ==========
  @ApiPropertyOptional({
    description: 'ID kategori (wajib jika type=PRODUCT)',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Nama produk (wajib jika type=PRODUCT)',
    example: 'Sepatu Running Hitam',
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Slug URL-friendly (wajib jika type=PRODUCT)',
    example: 'sepatu-running-hitam',
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Deskripsi produk',
    example: 'Sepatu running berbahan mesh breathable',
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Harga dasar dalam Rupiah (wajib jika type=PRODUCT)',
    example: 85000,
    minimum: 0,
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsInt()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({
    description: 'URL gambar produk (opsional, bisa via upload endpoint)',
  })
  // imageUrl tidak wajib di create karena bisa via upload endpoint
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Status aktif produk',
    example: true,
    default: true,
  })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsOptional()
  isActive?: boolean;

  // ========== SKU ==========
  @ApiPropertyOptional({
    description: 'ID produk induk (wajib jika type=SKU)',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({
    description: 'Warna varian (wajib jika type=SKU)',
    example: 'Hitam',
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiPropertyOptional({
    description: 'Ukuran varian (wajib jika type=SKU)',
    example: 'L',
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  size!: string;

  @ApiPropertyOptional({
    description: 'Stok awal (opsional, default 0)',
    example: 50,
    minimum: 0,
  })
  @ValidateIf((o) => o.type === 'SKU')
  @IsInt()
  @Min(0)
  @IsOptional()
  initialStock?: number;
}
