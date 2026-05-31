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
  @IsString()
  @IsNotEmpty()
  type!: 'PRODUCT' | 'SKU';

  // ========== PRODUCT ==========
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug!: string;

  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  description?: string;

  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsInt()
  @Min(0)
  basePrice!: number;

  // imageUrl tidak wajib di create karena bisa via upload endpoint
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsOptional()
  isActive?: boolean;

  // ========== SKU ==========
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsNotEmpty()
  size!: string;

  @ValidateIf((o) => o.type === 'SKU')
  @IsInt()
  @Min(0)
  @IsOptional()
  initialStock?: number;
}