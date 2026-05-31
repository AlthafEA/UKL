import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  /**
   * Admin update status (PAID/SHIPPED/CANCELLED)
   * Customer tidak boleh set ini, controller akan guard + roles.
   */
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  /**
   * Optional note saat upload bukti transfer
   */
  @IsString()
  @IsOptional()
  @MaxLength(200)
  note?: string;
}