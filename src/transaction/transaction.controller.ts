import { Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Param, Post, Put, Query, RawBody, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PaymentDTO, VerifyPaymentDTO } from '../shared/dtos/transaction/payment.dto';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { PaystackService } from './paystack.service';
import { PaymentMethod, PaymentStatus } from '../shared/enums/payment.enum';
import { InitiatePaymentDto, PaystackInitiatePaymentResponseDto, PaystackWebHookPayload } from '../shared/dtos/transaction/paystack.dto';
import { PaystackCurrency } from '../shared/enums/paystack.enum';

@Controller('transaction')
export class TransactionController {
    constructor(
        private transactionService: TransactionService,
        private paystackService: PaystackService
    ){}

    @Post()
    @UseGuards(JwtGuard)
    async createTransaction(
        @Body() payload: PaymentDTO,
        @User("userId") userId: string
    ){
        const res = await this.transactionService.createTransaction(payload, userId);
        return ApiResponse.success("transaction created successfullyy", res);
    }
    @Post("pay")
    @UseGuards(JwtGuard)
    async pay(
        @Body() payload: PaymentDTO,
        @User("userId") userId: string
    ){
        let res: PaystackInitiatePaymentResponseDto;
        const trx = await this.transactionService.createTransaction(payload, userId);
        if(payload.paymentMethod === PaymentMethod.PAYSTACK){
            const paymentData: InitiatePaymentDto = {
                userId: trx.user?.userId,
                email: trx.user?.email,
                amount: trx.amount,
                currency: PaystackCurrency.NGN,
            };
            const metadata: VerifyPaymentDTO = {
                transactionId: trx.id,
                paymentStatus: trx.paymentStatus
            };
            res = await this.paystackService.initiatePayment(paymentData, metadata);
        }
        return ApiResponse.success("transaction created successfullyy", res);
    }

    @Get("verify-payment/:provider")
    @UseGuards(JwtGuard)
    async verifyPaymentStatus(
        @Query("reference") reference: string,
        @Param("provider") provider: string,
    ){
        
        const res = await this.paystackService.verifyPayment(reference);
        return ApiResponse.success("Transction updated successfully", res);
    }

    
  @Post('/webhook/verify-payment/paystack')
  async handlePaystackWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('x-paystack-signature') signature: string,
  ) {
    try {
      const isValid = this.paystackService.verifySignatureByHash(
        rawBody,
        signature,
      );
      if (!isValid) {
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      // Process the webhook payload
     const  payload = JSON.parse(rawBody.toString());
      payload.data.metadata.paymentStatus = /success/i.test(payload.data.status) ? PaymentStatus.PAID : payload.data.status as PaymentStatus;
      this.transactionService.updatePayment(payload.data.metadata);
      return ApiResponse.success("Payment handled", payload.data.metadata, HttpStatus.OK);
    } catch (error) {
      //console.error('Webhook error:', error);
      console.log('Error ', error.message);
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    @Put("status")
    @UseGuards(JwtGuard)
    async updateTransactionStatus(
        @Body() payload: VerifyPaymentDTO,
    ){
        const res = await this.transactionService.updatePayment(payload);
        return ApiResponse.success("Transction updated successfully", res);
    }
}
