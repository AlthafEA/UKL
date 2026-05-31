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
  @IsString()
  @IsNotEmpty()
  skuId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsEnum(ShippingType)
  shippingType!: ShippingType;

  @IsEnum(District)
  @IsOptional()
  district?: District;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string; // "MANUAL_TRANSFER"
}