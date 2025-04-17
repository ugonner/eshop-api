import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifiction/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
