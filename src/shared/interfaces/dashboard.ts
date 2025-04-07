import { Product } from "../../entities/product.entity";

export interface IDashboardData {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalTransactions?: number;
    totalRevenue: number;
    products: Product[]
}