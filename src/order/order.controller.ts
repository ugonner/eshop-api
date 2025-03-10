import { Controller, Post, Body, Get, Param, Put, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { OrderDTO, OrderStatusDTO, QueryOrderDTO } from '../shared/dtos/order.dto';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { JwtGuard } from '../shared/guards/jwt.guards';

@ApiTags("Order")
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(
    @User("userId") userId: string,
    @Body() payload: OrderDTO) {
    const res = await this.orderService.createOrder(userId, payload);
    return ApiResponse.success("Order created successfully", res);
  }

  @Put("/:orderId")
  //@UseGuards(JwtGuard)
  async updateOrderStatus(
    @Body() payload: OrderStatusDTO,
    @Param("orderId") orderId: string
  ){
    const res = await this.orderService.updateOrderStatus(orderId, payload);
    return ApiResponse.success("Order status updated successfullly", res);
  }

  @Get("/user/:userId")
  @UseGuards(JwtGuard)
  async getUserOrders(
    @Param("userId") paramUserId: string,
    @User("userId") userId: string,
    @Query() payload: QueryOrderDTO
  ){
    const _userId = paramUserId || userId;
    const res = await this.orderService.getOrders(payload, _userId);
    return ApiResponse.success("orders fetched successfuly", res);
  }
  
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return await this.orderService.getOrderById(id);
  }

  @Get()
  async getOrders(
    @Query() payload: QueryOrderDTO
  ){
    const res = await this.orderService.getOrders(payload);
    return ApiResponse.success("orders fetched successfuly", res);
  }
}
