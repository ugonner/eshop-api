import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "../../enums/payment.enum";
import { PaystackCurrency } from "../../enums/paystack.enum";

export class PaymentDTO {
    @ApiProperty()
    @IsString()
    orderId: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiProperty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod

}

export class VerifyPaymentDTO{
    @ApiProperty()
    @IsString()
    transactionId: string;

    @ApiProperty()
    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;
}


  