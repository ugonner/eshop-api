import { Controller, Post, Body, Get, Param, Put, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { OrderDTO, OrderStatusDTO, OrderWithOrderProfileDTO, QueryOrderDTO } from '../shared/dtos/order.dto';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { AuthService } from '../auth/auth.service';
import { UserProfileDTO } from '../shared/dtos/user.dto';

@ApiTags("Order")
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService, private authService: AuthService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(
    @User("userId") userId: string,
    @Body() payload: OrderDTO) {
    const res = await this.orderService.createOrder(userId, payload);
    return ApiResponse.success("Order created successfully", res);
  }
  @Post("order-profile")
  async createOrderWithOrderProfile(
    @Body() payload: OrderWithOrderProfileDTO) {
      const {orderProfile, ...orderDto} = payload;
      console.log("order porfile", orderProfile);
      let user = await this.authService.getUserByEmail(orderProfile?.email);
      if(!user){
        const authDto: UserProfileDTO = {
          email: orderProfile.email,
          password: orderProfile.userName || orderProfile.email.split("@")[0],
          firstName: orderProfile.userName?.split(" ")?.length >= 1 ? orderProfile.userName?.split(" ")[0] : "NA",
          lastName: orderProfile.userName?.split(" ")?.length > 1 ? orderProfile.userName?.split(" ")[1] : "NA"
          
        }
       user = await this.authService.createAccount(authDto);
     }
      
    const res = await this.orderService.createOrder(user.userId, orderDto);
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

  @Get("shipping-methods")
  async getShippingMethods(){
    const res = await this.orderService.getShippingMethods();
    return ApiResponse.success("Shipping methods fetched successsfully", res);
  }

  @Get("/user")
  @UseGuards(JwtGuard)
  async getUserOrders(
    @Query("userId") paramUserId: string,
    @User("userId") userId: string,
    @Query() payload: QueryOrderDTO
  ){
    const _userId = paramUserId || userId;
    const res = await this.orderService.getOrders(payload, _userId);
    return ApiResponse.success("orders fetched successfuly", res);
  }
  
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const res = await this.orderService.getOrderById(id);
    return ApiResponse.success("order fetched successfully", res);
  }

  @Get()
  async getOrders(
    @Query() payload: QueryOrderDTO
  ){
    const res = await this.orderService.getOrders(payload);
    return ApiResponse.success("orders fetched successfuly", res);
  }
}
