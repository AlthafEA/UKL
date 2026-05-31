import { IsInt, IsOptional, IsString, Matches, Min, ValidateIf } from 'class-validator';

export class UpdateProductDto {
  /**
   * Action type supaya 1 modul product bisa handle:
   * - update product
   * - update sku
   * - update stock
   */
  @IsString()
  @IsOptional()
  type?: 'PRODUCT' | 'SKU' | 'STOCK' | 'IMAGE';

  // ========== PRODUCT ==========
  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  name?: string;

  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by "-"',
  })
  slug?: string;

  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsString()
  @IsOptional()
  description?: string;

  @ValidateIf((o) => !o.type || o.type === 'PRODUCT')
  @IsInt()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ValidateIf((o) => !o.type || o.type === 'IMAGE')
  @IsString()
  @IsOptional()
  imageUrl?: string;

  // ========== SKU ==========
  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsOptional()
  color?: string;

  @ValidateIf((o) => o.type === 'SKU')
  @IsString()
  @IsOptional()
  size?: string;

  // ========== STOCK ==========
  @ValidateIf((o) => o.type === 'STOCK')
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}