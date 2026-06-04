import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  /**
   * Admin update status (PAID/SHIPPED/CANCELLED)
   * Customer tidak boleh set ini, controller akan guard + roles.
   */
  @ApiPropertyOptional({
    description: 'Status pesanan baru (hanya untuk Admin)',
    enum: OrderStatus,
    example: 'PAID',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  /**
   * Optional note saat upload bukti transfer
   */
  @ApiPropertyOptional({
    description: 'Catatan opsional saat upload bukti pembayaran',
    example: 'Transfer via BCA a/n Budi',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  note?: string;
}
