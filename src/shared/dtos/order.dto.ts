import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderOrderFields, OrderStatus } from "../enums/order.enum";

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
export class OrderDTO {
    @ApiPropertyOptional()
      @IsNumber()
      @IsOptional()
      shippingCost: number;
      
      @ApiPropertyOptional()
      @IsString()
      @IsOptional()
      additionalInformation?: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => DeliveryAddressDTO)
    deliveryAddress: DeliveryAddressDTO;

    @ApiProperty()
    @ValidateNested({each: true})
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];
}

export class OrderStatusDTO {
    @ApiPropertyOptional()
    @IsEnum(OrderStatus)
    @IsOptional()
    orderStatus?: OrderStatus;
}


export class QueryOrderDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  maxPrice: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  minPrice: string;



 @ApiPropertyOptional()
 @IsString()
 @IsOptional()
 searchTerm?: string;

 @ApiPropertyOptional()
 @IsNumberString()
 @IsOptional()
 page?: string;

 @ApiPropertyOptional()
 @IsNumberString()
 @IsOptional()
 limit?: string;

 @ApiPropertyOptional()
 @IsEnum(["ASC" , "DESC"], {message: `order must be one of "ASC" | "DESC"`})
 @IsOptional()
 order: "ASC" | "DESC";

 @ApiPropertyOptional()
 @IsEnum(OrderOrderFields)
 @IsOptional()
 orderBy: OrderOrderFields;


}
