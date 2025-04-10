import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/orderitem.entity';
import { Profile } from '../entities/user.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { OrderDTO, OrderItemDTO, OrderStatusDTO, QueryOrderDTO } from '../shared/dtos/order.dto';
import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { DBUtils, handleDateQuery } from '../shared/helpers/db';
import { ProductService } from '../product/product.service';
import { IShippingMethodDetail, ShippingMethods } from '../shared/DATASETS/shipping/shippingMethods';
import { OrderShippingMethodType } from '../shared/enums/order.enum';
import { promises } from 'dns';

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  async validateOrderItem(item: OrderItemDTO, queryRunner: QueryRunner): Promise<OrderItem> {
    
    const variant = await queryRunner.manager.findOne(ProductVariant, {where: {id: item.variantId}});
    if(!variant) throw new NotFoundException("iNVALID PRODUCT VARIANT");
      if(Number(variant.stock) < Number(item.quantity)) throw new BadRequestException(`Product Out of Stock: ${variant.product?.name} with specs: size: ${variant.size} | color: ${variant.color} | Available stock: ${variant.stock}`)
        
    const orderItem = new OrderItem();
    orderItem.productVariant = variant;
    orderItem.price = variant.price;
    orderItem.quantity = item.quantity;
    orderItem.totalAmount = variant.price * item.quantity;
    return orderItem;
    //return await queryRunner.manager.save(OrderItem, orderItem);
  }

  async validateOrderItems(items: OrderItemDTO[], queryRunner: QueryRunner): Promise<OrderItem[]>{
    const variants = await queryRunner.manager.findBy(ProductVariant, {id: In(items.map((item) => item.variantId))});
    const orderItems: OrderItem[] = [];
    items.forEach((item) => {
      const variant = variants?.find((variantItem) => variantItem.id === item.variantId);
      if(!variant) throw new BadRequestException(`A product item with id ${item.variantId} was not found, may have been deleted` );
      if(Number(variant.stock) < Number(item.quantity)) throw new BadRequestException(`Product Out of Stock: ${variant.product?.name} with specs: size: ${variant.size} | color: ${variant.color} flavor: ${variant.flavor} | Available stock: ${variant.stock}`)
        const orderItem = new OrderItem();
      orderItem.productVariant = variant;
      orderItem.price = variant.price;
      orderItem.quantity = item.quantity;
      orderItem.totalAmount = variant.price * item.quantity;
      orderItems.push(orderItem);    
    })
    return orderItems;
  }

  async createOrder(userId: string, dto: OrderDTO): Promise<Order> {
    let newOrder: Order;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    try{
        await queryRunner.startTransaction();
        const {items, shippingMethodType, ...orderDto} = dto;

        const user = await queryRunner.manager.findOne(Profile, { where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    let totalAmount = 0;
    const orderItems: OrderItem[] = await this.validateOrderItems(items, queryRunner);


    const order = queryRunner.manager.create(Order, orderDto);
    order.shippingMethod = ShippingMethods.find((sMethod) => sMethod.type === (shippingMethodType || OrderShippingMethodType.WALK_IN)); 
    order.shippingCost = order.shippingMethod.cost; 
    order.invoiceNo = await DBUtils.generateUniqueID(
            queryRunner.manager.getRepository(Order),
            'invoiceNo',
            8,
          );
    order.user = user;
    order.totalAmount = orderItems.reduce((acc, item) => {
      return acc + (item.quantity * item.productVariant?.price)
    }, 0);
    order.orderItems = orderItems;


    const savedOrder = await queryRunner.manager.save(Order, order);
    const updatedOrderItems = orderItems.map((item) => ({...item, order: savedOrder}));
    await queryRunner.manager.save(OrderItem, updatedOrderItems);
    await queryRunner.commitTransaction();
    newOrder = {...order, orderItems};
    }catch(error){
        errorData = error;
        await queryRunner.rollbackTransaction();
        
    }finally{
        await queryRunner.release();
        if(errorData) throw errorData;
        return newOrder;
    }
  }

  async updateOrderStatus(orderId: string, dto: OrderStatusDTO): Promise<Order>{
    let order: Order;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    try{
      await queryRunner.startTransaction();
      const orderExists = await queryRunner.manager.findOneBy(Order, {id: orderId});
      if(!orderExists) throw new NotFoundException("Order not found ");
      const orderData = {...orderExists, ...dto};
      const updatedOrder = await queryRunner.manager.save(Order, orderData);
      await queryRunner.commitTransaction();
      order = updatedOrder;
    }catch(error){
      errorData = error;
      await queryRunner.rollbackTransaction();
    }finally{
      await queryRunner.release();
      if(errorData) throw errorData;
      return order;
    }
  }
  async getOrderById(orderId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();

    return await queryRunner.manager.findOne(Order, {
      where: { id: orderId },
      relations: ["user", 'orderItems', 'orderItems.productVariant', "orderItems.productVariant.product"],
    });
  }

  
    getQueryBuilder(): SelectQueryBuilder<Order> {
      const repository = this.dataSource.manager.getRepository(Order);
      return repository
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect('orders.orderItems', 'orderItems')
        .leftJoinAndSelect('orderItems.productVariant', 'productVariants')
        .leftJoinAndSelect('productVariants.product', 'product');
    }
  
    async getOrders(dto: QueryOrderDTO, userId?: string): Promise<IQueryResult<Order>> {
      
      const {
        maxPrice,
        minPrice,
        searchTerm,
        order,
        orderBy,
        page,
        limit,
        startDate,
        endDate,
        dDate,
        ...queryFields
      } = dto;
      const queryPage = page ? Number(page) : 1;
      const queryLimit = limit ? Number(limit) : 10;
      const queryOrder = order ? order.toUpperCase() : 'DESC';
      const queryOrderBy = orderBy ? orderBy : 'createdAt';
  
      let queryBuilder = this.getQueryBuilder();
  
      if (queryFields) {
        Object.keys(queryFields).forEach((field) => {
          queryBuilder.andWhere(`orders.${field} = :value`, {
            value: queryFields[field]
          });
        })
      }

      if(userId) queryBuilder.andWhere(`user.userId = :userId`, {userId})
  
      if(startDate || endDate || dDate){
         queryBuilder = handleDateQuery<Order>(
          {startDate, endDate, dDate, entityAlias: "orders"}, queryBuilder, "createdAt"
         );
      }
      if(minPrice) queryBuilder.andWhere(`orders.totalAmount >= :minPrice`, {minPrice})
      if(maxPrice) queryBuilder.andWhere(`orders.totalAmount <=  :maxPrice`, {maxPrice});
      
  
      if (searchTerm) {
        const searchFields = ["deliveryAddress", "invoiceNo"];
        let queryStr = `LOWER(user.firstName) LIKE :searchTerm OR LOWER(user.lastName) LIKE :searchTerm OR LOWER(user.email) LIKE :searchTerm OR LOWER(user.phoneNumber) LIKE :searchTerm`;
        searchFields.forEach((field) => {
          queryStr += ` OR LOWER(orders.${field}) LIKE :searchTerm`;
        });
        queryBuilder.andWhere(queryStr, {
          searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
        });
      }
  
      const [data, total] = await queryBuilder
        .orderBy(`orders.${queryOrderBy}`, queryOrder as 'ASC' | 'DESC')
        .skip((queryPage - 1) * queryLimit)
        .limit(queryLimit)
        .getManyAndCount();
  
      return { page: queryPage, limit: queryLimit, total, data };
    }
  
    async getShippingMethods(): Promise<IShippingMethodDetail[]> {
      return ShippingMethods;
    }
}
