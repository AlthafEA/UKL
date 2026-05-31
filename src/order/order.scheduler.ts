import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class OrderScheduler {
  private readonly logger = new Logger(OrderScheduler.name);

  constructor(private readonly orderService: OrderService) {}

  // jalan tiap 1 menit; bisa kamu ubah jadi 5 menit
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCancelExpired() {
    const res = await this.orderService.cancelExpiredPendingOrders();
    if (res.cancelled > 0) {
      this.logger.log(`Cancelled expired orders: ${res.cancelled}`);
    }
  }
}