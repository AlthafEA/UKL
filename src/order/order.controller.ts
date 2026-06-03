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
  Delete,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RolesGuard } from '../helper/roles-guard';
import { Roles } from '../helper/roles-decorator'; // jika belum ada, bilang
import { ReceiptService } from './receipt.service';
import express from 'express';

@ApiTags('Orders')
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly receiptService: ReceiptService
  ) { }

  // -------- CUSTOMER --------
  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Checkout / buat pesanan baru',
    description:
      'Membuat pesanan baru. Stok akan berkurang secara atomik. ' +
      'Jika shippingType=DELIVERY, wajib isi district dan shippingAddress. ' +
      'Pesanan yang tidak dibayar dalam 1 jam akan otomatis dibatalkan.',
  })
  @ApiCreatedResponse({
    description: 'Pesanan berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        status: { type: 'string', example: 'PENDING' },
        shippingType: { type: 'string', example: 'DELIVERY' },
        district: { type: 'string', example: 'LOWOKWARU', nullable: true },
        shippingAddress: { type: 'string', nullable: true },
        shippingFee: { type: 'number', example: 10000 },
        subtotal: { type: 'number', example: 170000 },
        total: { type: 'number', example: 180000 },
        paymentMethod: { type: 'string', example: 'MANUAL_TRANSFER' },
        paymentExpiresAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              skuId: { type: 'string' },
              quantity: { type: 'number', example: 2 },
              price: { type: 'number', example: 85000 },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validasi gagal, stok tidak cukup, atau SKU tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  checkout(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.checkout(req.user.id, dto);
  }

  @Get('orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Daftar pesanan saya',
    description: 'Mengambil daftar pesanan milik user yang sedang login, dengan pagination dan filter status.',
  })
  @ApiOkResponse({
    description: 'Berhasil mengambil daftar pesanan',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        total: { type: 'number', example: 3 },
        items: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  listMy(@Req() req: any, @Query() query: QueryOrderDto) {
    return this.orderService.listMyOrders(req.user.id, query);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Detail pesanan saya',
    description: 'Mengambil detail pesanan berdasarkan ID. Hanya bisa melihat pesanan milik sendiri.',
  })
  @ApiParam({ name: 'id', description: 'ID pesanan (CUID)' })
  @ApiOkResponse({ description: 'Berhasil mengambil detail pesanan' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Pesanan bukan milik user ini' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  getMy(@Req() req: any, @Param('id') id: string) {
    return this.orderService.getMyOrder(req.user.id, id);
  }

  @Post('orders/:id/payment-proof')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload bukti pembayaran',
    description:
      'Upload bukti transfer untuk pesanan yang masih PENDING. ' +
      'Setelah upload, status pesanan berubah menjadi WAITING_CONFIRMATION. ' +
      'File dikirim sebagai multipart/form-data.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File bukti pembayaran dan catatan opsional',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File bukti transfer (JPG/PNG)',
        },
        note: {
          type: 'string',
          description: 'Catatan opsional',
          example: 'Transfer via BCA a/n Budi',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({ name: 'id', description: 'ID pesanan (CUID)' })
  @ApiOkResponse({ description: 'Bukti pembayaran berhasil diupload' })
  @ApiBadRequestResponse({ description: 'Pesanan bukan PENDING atau bukti sudah diupload' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Pesanan bukan milik user ini' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  uploadProof(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.uploadPaymentProof(req.user.id, id, file, dto);
  }

  @Get('/orders/:id/receipt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'CUSTOMER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Download struk pembelian (PDF)' })
  @ApiParam({ name: 'id', description: 'ID order' })
  @ApiProduces('application/pdf')
  async downloadReceipt(
    @Param('id') id: string,
    @Req() req,
    @Res() res: express.Response, // pastikan type-nya dari express
  ) {
    const buffer = await this.receiptService.generateReceipt(id, req.user.id, req.user.role);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="struk-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // -------- ADMIN --------
  @Patch('orders/:id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update status pesanan (Admin)',
    description:
      'Admin mengubah status pesanan. Transisi yang diizinkan:\n' +
      '- PENDING → CANCELLED\n' +
      '- WAITING_CONFIRMATION → PAID / CANCELLED\n' +
      '- PAID → SHIPPED\n\n' +
      'Jika dibatalkan, stok akan dikembalikan secara otomatis.',
  })
  @ApiParam({ name: 'id', description: 'ID pesanan (CUID)' })
  @ApiOkResponse({ description: 'Status pesanan berhasil diupdate' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'Transisi status tidak valid' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateStatusAdmin(id, dto);
  }

  @Delete('orders/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hapus pesanan',
    description: 'Menghapus pesanan berdasarkan ID. Bisa diakses oleh Customer dan Admin.',
  })
  @ApiParam({ name: 'id', description: 'ID pesanan (CUID)' })
  @ApiOkResponse({ description: 'Pesanan berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Tidak memiliki akses' })

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'CUSTOMER')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string, @Req() req) {
    return this.orderService.remove(id, req.user.id, req.user.role);
  }
}