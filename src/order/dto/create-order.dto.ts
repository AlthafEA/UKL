import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { District, ShippingType } from '@prisma/client';

class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID SKU produk yang dipesan',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @ApiProperty({
    description: 'Jumlah item',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Daftar item yang dipesan',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Tipe pengiriman',
    enum: ShippingType,
    example: 'DELIVERY',
  })
  @IsEnum(ShippingType)
  shippingType!: ShippingType;

  @ApiPropertyOptional({
    description: 'Kecamatan tujuan (wajib jika shippingType=DELIVERY)',
    enum: District,
    example: 'LOWOKWARU',
  })
  @IsEnum(District)
  @IsOptional()
  district?: District;

  @ApiPropertyOptional({
    description: 'Alamat pengiriman lengkap (wajib jika shippingType=DELIVERY)',
    example: 'Jl. Soekarno-Hatta No. 9, Lowokwaru, Malang',
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({
    description: 'Metode pembayaran',
    example: 'MANUAL_TRANSFER',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string; // "MANUAL_TRANSFER"
}