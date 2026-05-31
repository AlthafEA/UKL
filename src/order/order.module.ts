import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderScheduler } from './order.scheduler';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [OrderController],
  providers: [OrderService, OrderScheduler],
})
export class OrderModule {}