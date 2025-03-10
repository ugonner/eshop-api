import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import * as crypto from "crypto";
import { TransactionService } from './transaction.service';
import { InitiatePaymentDto, PaystackInitiatePaymentResponseDto } from '../shared/dtos/transaction/paystack.dto';
import { VerifyPaymentDTO } from '../shared/dtos/transaction/payment.dto';

@Injectable()
export class PaystackService {
  private axiosInstance: AxiosInstance;

  constructor(
    private transactionService: TransactionService
  ) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private generateReference() {
    const input = `${uuidv4()}-${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex')
      .substr(0, 12);
  }

  async initiatePayment(
    payload: InitiatePaymentDto,
    metadata?: VerifyPaymentDTO, // Optional metadata
  ): Promise<PaystackInitiatePaymentResponseDto> {
    try {
      let callback_page = `order`;
      
      const body = {
        ...payload,
        amount: payload.amount * 100, // Convert to kobo for NGN
        callback_url: `${process.env.APP_URL}${callback_page}`,
        reference: this.generateReference(),
        metadata,
      };
      const response = await this.axiosInstance.post(
        '/transaction/initialize',
        body,
      );
      return response.data;
    } catch (error) {
      console.log('paystack ', error.message);
      throw new HttpException(
        'Error initiating payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Verify Payment
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `/transaction/verify/${reference}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error verifying payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  verifySignatureByHash(body: Buffer, signature: string): boolean {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    return hash === signature;
  }

}
