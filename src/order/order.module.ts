import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderScheduler } from './order.scheduler';
import { PdfService } from '../pdf/pdf.service';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [OrderController],
  providers: [OrderService, OrderScheduler, PdfService, ReceiptService],
})
export class OrderModule {}
