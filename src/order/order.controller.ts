import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RolesGuard } from '../helper/roles-guard';
import { Roles } from '../helper/roles-decorator'; // jika belum ada, bilang

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // -------- CUSTOMER --------
  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  checkout(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.checkout(req.user.id, dto);
  }

  @Get('orders')
  @UseGuards(AuthGuard('jwt'))
  listMy(@Req() req: any, @Query() query: QueryOrderDto) {
    return this.orderService.listMyOrders(req.user.id, query);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard('jwt'))
  getMy(@Req() req: any, @Param('id') id: string) {
    return this.orderService.getMyOrder(req.user.id, id);
  }

  @Post('orders/:id/payment-proof')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  uploadProof(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.uploadPaymentProof(req.user.id, id, file, dto);
  }

  // -------- ADMIN --------
  @Patch('orders/:id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateStatusAdmin(id, dto);
  }
}