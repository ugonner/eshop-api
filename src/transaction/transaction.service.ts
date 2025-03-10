import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { PaymentDTO, VerifyPaymentDTO } from '../shared/dtos/transaction/payment.dto';
import { PaymentTransaction } from '../entities/transaction.entity';
import { Profile } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { PaymentStatus } from '../shared/enums/payment.enum';
import { OrderItemDTO } from '../shared/dtos/order.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { OrderStatus } from '../shared/enums/order.enum';
import { ProductService } from '../product/product.service';

@Injectable()
export class TransactionService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private productService: ProductService
    ){}

    async createTransaction(dto: PaymentDTO, userId: string): Promise<PaymentTransaction> {
        let transaction: PaymentTransaction;
        let errorData: unknown;
        const queryRunner = this.dataSource.createQueryRunner();
        try{
            await queryRunner.startTransaction();
            const {orderId, ...transactionDto} = dto;

            const user = await queryRunner.manager.findOneBy(Profile, {userId});
            if(!user) throw new NotFoundException("user account not found");

            const order = await queryRunner.manager.findOne(Order, {
                where: {id: orderId},
                relations: ["orderItems", "orderItems.productVariant", "orderItems.productVariant.product"]
            })
            if(!order) throw new NotFoundException("Order not found");
            if(order.orderStatus === OrderStatus.PAID_AND_PROCESSING) throw new BadRequestException("This order has already been paid for");
            const itemsValidInStock = await this.productService.validateProductInStock(order.orderItems, queryRunner);
            if(!itemsValidInStock) throw new BadRequestException("One of your product is out of stock");

            const trxData = queryRunner.manager.create(PaymentTransaction, transactionDto);
            trxData.paymentStatus = PaymentStatus.PENDING;
            trxData.amount = Number(order.totalAmount) + Number(order.shippingCost || 0);
            trxData.order = order;
            trxData.user = user;
            const trx = await queryRunner.manager.save(PaymentTransaction, trxData);
            await queryRunner.commitTransaction();
            transaction = trx;
        }catch(error){
            errorData = error;
            await queryRunner.rollbackTransaction();
        }finally{
            if(errorData) throw errorData;
            return transaction;
        }
    }

    async updatePayment(dto: VerifyPaymentDTO): Promise<PaymentTransaction> {
        let transaction: PaymentTransaction;
        let errorData: unknown;
        const queryRunner = this.dataSource.createQueryRunner();
        try{
            await queryRunner.startTransaction();
            const trx = await queryRunner.manager.findOne(PaymentTransaction, {
                where: {id: dto.transactionId},
                relations: ["order", "order.orderItems",  "order.orderItems.productVariant"]
            });
            if(!trx) throw new NotFoundException("Transaction record not found");
            const order = trx.order;
            const stockUpdateOperator = dto.paymentStatus === PaymentStatus.PAID ? "subtract" : "add";
            const promiseRes = await Promise.allSettled(
                order.orderItems.map((item) => this.updateProductVariantStockInventory({
                    item: {variantId: item.productVariant.id, quantity: item.quantity},
                    operator: stockUpdateOperator,
                }, queryRunner))
            );
            promiseRes.forEach((res) => {
                if(res.status === "rejected") console.log("Errror updating item stock", res.reason)
            })
            order.orderStatus = dto.paymentStatus === PaymentStatus.PAID ? OrderStatus.PAID_AND_PROCESSING : OrderStatus.CANCELLED;
            await queryRunner.manager.save(Order, order);

            trx.paymentStatus = dto.paymentStatus;
            const trxData = await queryRunner.manager.save(PaymentTransaction, trx);
            await queryRunner.commitTransaction();
            transaction = trxData;

        }catch(error){
            errorData = error;
            await queryRunner.rollbackTransaction();
        }finally{
            if(errorData) throw errorData;
            return transaction;
        }
    }

    private async updateProductVariantStockInventory(dto: {operator: "add" | "subtract", item: OrderItemDTO}, queryRunner: QueryRunner): Promise<ProductVariant>{
        const {operator, item} = dto;
        const variant = await queryRunner.manager.findOneBy(ProductVariant, {id: item.variantId});
        if(!variant) throw new NotFoundException("No variant found");
        variant.stock = operator === "add" ? (Number(variant.stock) + Number(item.quantity)) : (Number(variant.stock) - Number(item.quantity));
        const vrt = await queryRunner.manager.save(ProductVariant, variant);
        return vrt;
    }
}
