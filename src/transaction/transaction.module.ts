import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PaystackService } from './paystack.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [TransactionController],
  providers: [TransactionService, PaystackService]
})
export class TransactionModule {}
