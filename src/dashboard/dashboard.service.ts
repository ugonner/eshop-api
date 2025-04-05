import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IDashboardData } from '../shared/interfaces/dashboard';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../shared/enums/order.enum';
import { Product } from '../entities/product.entity';
import { Profile } from '../entities/user.entity';
import { PaymentTransaction } from '../entities/transaction.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource
    ){}

    async getDashoard(): Promise<IDashboardData>{
        const { totalRevenue} = await this.dataSource
        .getRepository(Order)
        .createQueryBuilder("orders")
        .select("SUM(orders.totalAmount)", "totalRevenue")
        // .where("invoice.createdAt BETWEEN :start AND :end", {
        //   start: new Date("2025-01-01"),
        //   end: new Date("2025-03-31"),
        // })
        .where(`orders.orderStatus = :orderStatus`, {orderStatus: OrderStatus.PAID_AND_PROCESSING})
        .getRawOne();

        const {totalOrders} = await this.dataSource
        .getRepository(Order)
        .createQueryBuilder("orders")
        .select("COUNT(orders.id)", "totalOrders")
        .getRawOne();

        const {totalProducts} = await this.dataSource
        .getRepository(Product)
        .createQueryBuilder("product")
        .select("COUNT(product.id)", "totalProducts")
        .getRawOne();
     
        const {totalUsers} = await this.dataSource
        .getRepository(Profile)
        .createQueryBuilder("user")
        .select("COUNT(user.id)", "totalUsers")
        .getRawOne();

        const {totalTransactions} = await this.dataSource
        .getRepository(PaymentTransaction)
        .createQueryBuilder("trx")
        .select("COUNT(trx.id)", "totalTransactions")
        .getRawOne();

        const products = await this.dataSource.createQueryRunner().manager.find(Product, {
            where: {},
            relations: ["variants"],
            skip: 0,
            take: 20,
            order: {createdAt: "DESC"}
        })

        return {
            totalOrders,
            totalProducts,
            totalUsers,
            totalTransactions,
            totalRevenue,
            products
        }




    }
}
