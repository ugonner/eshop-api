import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderOrderFields, OrderShippingMethodType, OrderStatus } from "../enums/order.enum";
import { QueryRequestDTO } from "./query-request.dto";

export class DeliveryAddressDTO {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    landmark?: string;

    @ApiProperty()
    @IsString()
    street: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    state?: string;

    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    country?: string;

}

export class OrderItemDTO {
    @ApiProperty()
    @IsString()
    variantId: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;
}

export class OrderProfileDTO {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    userName?: string;
}

export class OrderDTO {
    @ApiPropertyOptional()
      @IsNumber()
      @IsOptional()
      shippingCost: number;
    
      @ApiPropertyOptional()
      @IsEnum(OrderShippingMethodType)
      @IsOptional()
      shippingMethodType: OrderShippingMethodType;

      @ApiPropertyOptional()
      @IsString()
      @IsOptional()
      additionalInformation?: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => DeliveryAddressDTO)
    @IsOptional()
    deliveryAddress?: DeliveryAddressDTO;

    @ApiProperty()
    @ValidateNested({each: true})
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];
}

export class OrderWithOrderProfileDTO extends OrderDTO {

    @ApiPropertyOptional()
    @ValidateNested()
    @Type(() => OrderProfileDTO)
    orderProfile: OrderProfileDTO
}

export class OrderStatusDTO {
    @ApiPropertyOptional()
    @IsEnum(OrderStatus)
    @IsOptional()
    orderStatus?: OrderStatus;
}


export class QueryOrderDTO extends QueryRequestDTO{
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus: OrderStatus;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  maxPrice: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  minPrice: string;

 @ApiPropertyOptional()
 @IsEnum(OrderOrderFields)
 @IsOptional()
 orderBy: OrderOrderFields;


}
