import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { District, OrderStatus, Role, ShippingType } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  // ---------- CUSTOMER ----------
  async checkout(userId: string, dto: CreateOrderDto) {
    if (!dto.items?.length) throw new BadRequestException('items is required');

    if (dto.shippingType === ShippingType.DELIVERY) {
      if (!dto.district) throw new BadRequestException('district is required for DELIVERY');
      if (!dto.shippingAddress) throw new BadRequestException('shippingAddress is required for DELIVERY');
    } else {
      // PICKUP
      dto.district = undefined;
      dto.shippingAddress = undefined;
    }

    // Load rates if delivery
    let shippingFee = 0;
    if (dto.shippingType === ShippingType.DELIVERY) {
      shippingFee = await this.getShippingFee(dto.district!);
    }

    // Fetch SKU + Product (price from product.basePrice)
    const skuIds = dto.items.map((i) => i.skuId);
    const skus = await this.prisma.productSku.findMany({
      where: { id: { in: skuIds } },
      include: { product: true, inventory: true },
    });

    if (skus.length !== skuIds.length) {
      throw new BadRequestException('Some SKU not found');
    }

    // map skuId -> sku
    const skuMap = new Map(skus.map((s) => [s.id, s]));

    // compute subtotal from DB
    let subtotal = 0;
    const orderItemsData: Array<{ skuId: string; quantity: number; price: number }> = [];

    for (const item of dto.items) {
      const sku = skuMap.get(item.skuId)!;
      const price = sku.product.basePrice;
      subtotal += price * item.quantity;
      orderItemsData.push({ skuId: item.skuId, quantity: item.quantity, price });
    }

    const total = subtotal + shippingFee;
    const paymentExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Transaction: create order + items + decrement stock atomically
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING,
            shippingType: dto.shippingType,
            district: dto.district as District | undefined,
            shippingAddress: dto.shippingAddress,
            shippingFee,
            subtotal,
            total,
            paymentMethod: dto.paymentMethod,
            paymentExpiresAt,
          },
        });

        await tx.orderItem.createMany({
          data: orderItemsData.map((x) => ({
            orderId: order.id,
            skuId: x.skuId,
            quantity: x.quantity,
            price: x.price,
          })),
        });

        // Atomic stock decrement per sku
        for (const x of orderItemsData) {
          const res = await tx.inventory.updateMany({
            where: { skuId: x.skuId, stock: { gte: x.quantity } },
            data: { stock: { decrement: x.quantity } },
          });
          if (res.count !== 1) {
            throw new BadRequestException(`Insufficient stock for skuId=${x.skuId}`);
          }
        }

        return tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });
      });
    } catch (e: any) {
      // bubble up BadRequestException from insufficient stock
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Checkout failed');
    }
  }

  async listMyOrders(userId: string, query: QueryOrderDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              sku: { include: { product: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { page, limit, total, items };
  }

  async getMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { sku: { include: { product: true } } },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Forbidden');

    return order;
  }

  async uploadPaymentProof(userId: string, orderId: string, file: Express.Multer.File, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Forbidden');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only PENDING orders can upload payment proof');
    }
    if (order.paymentProofUploadedAt) {
      throw new BadRequestException('Payment proof already uploaded');
    }

    if (!file) throw new BadRequestException('File is required');

    const uploaded = await this.cloudinary.uploadImage(file, {
      folder: `payment-proofs/${orderId}`,
    });

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: uploaded.secure_url ?? uploaded.url,
        paymentProofUploadedAt: new Date(),
        status: OrderStatus.WAITING_CONFIRMATION,
        // note: dto.note can be stored if you add a column (not in schema now)
      },
    });
  }

  // ---------- ADMIN ----------
  async updateStatusAdmin(orderId: string, dto: UpdateOrderDto) {
    if (!dto.status) throw new BadRequestException('status is required');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // simple rule: allow transitions
    // PENDING -> CANCELLED
    // WAITING_CONFIRMATION -> PAID | CANCELLED
    // PAID -> SHIPPED
    // SHIPPED -> (no change)
    // CANCELLED -> (no change)
    const next = dto.status;

    const allowed = this.isAllowedTransition(order.status, next);
    if (!allowed) {
      throw new BadRequestException(`Invalid status transition ${order.status} -> ${next}`);
    }

    // If admin cancels after stock already deducted, restore stock
    if (next === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.CANCELLED } });

        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { skuId: item.skuId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });

      return this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    }

    // Mark paidAt on PAID
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: next,
        paidAt: next === OrderStatus.PAID ? new Date() : undefined,
      },
    });
  }

  // ---------- Scheduler helpers ----------
  async cancelExpiredPendingOrders() {
    const now = new Date();

    // Find orders that are still PENDING, no proof uploaded, expired
    const expired = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        paymentProofUploadedAt: null,
        paymentExpiresAt: { lt: now },
      },
      include: { items: true },
      take: 200, // batch
    });

    if (!expired.length) return { cancelled: 0 };

    await this.prisma.$transaction(async (tx) => {
      for (const order of expired) {
        // cancel
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });

        // restore stock
        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { skuId: item.skuId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return { cancelled: expired.length };
  }

  // ---------- private ----------
  private async getShippingFee(district: District) {
    const rate = await this.prisma.districtShippingRate.findUnique({
      where: { district },
    });
    if (!rate || !rate.isActive) throw new BadRequestException('Shipping rate unavailable for district');

    return rate.fee;
  }

  private isAllowedTransition(current: OrderStatus, next: OrderStatus) {
    if (current === next) return true;

    const map: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CANCELLED],
      WAITING_CONFIRMATION: [OrderStatus.PAID, OrderStatus.CANCELLED],
      PAID: [OrderStatus.SHIPPED],
      SHIPPED: [],
      CANCELLED: [],
    };

    return map[current]?.includes(next) ?? false;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return {
        success: false,
        message: 'Order tidak ditemukan',
        data: null,
      };
    }

    // Cek akses: hanya pemilik order atau admin
    if (userRole !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke order ini');
    }

    // Hanya bisa cancel jika status PENDING
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order hanya bisa dibatalkan saat status PENDING');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    return {
      success: true,
      message: 'Order berhasil dibatalkan',
      data: updated,
    };
  }
}