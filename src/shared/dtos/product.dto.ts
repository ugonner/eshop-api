import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { IAttachment } from "../interfaces/typings";
import { Type } from "class-transformer";
import { ProductOrderFields, ProductVariantType } from "../enums/product.enum";
import { categoryDTO } from "./category.dto";
import { QueryRequestDTO } from "./query-request.dto";

export class TagDTO {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    id?: string;

    @ApiProperty()
    @IsString()
    name: string;
}

export class ProductVariantDTO {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
   id?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    size?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    flavor?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    imageUrl?: string;
  
    
    @ApiProperty()
    @IsEnum(ProductVariantType)
    productVariantType: ProductVariantType
    
    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsNumber()
    stock: number


}

export class ProductDTO {

  
@ApiProperty()
@IsString()
 name: string;
  
 @ApiProperty()
@IsString()
description: string;

@ApiProperty()
@IsString()
imageUrl: string;

@ApiPropertyOptional()
@IsString({each: true})
@IsArray()
@IsOptional()
attachments: IAttachment[];

  @ApiPropertyOptional()
  @ValidateNested({each: true})
  @Type(() => TagDTO)
  @IsArray()
  @IsOptional()
  tags?: TagDTO[];


 @ApiProperty()
 @ValidateNested({each: true})
 @Type(() => categoryDTO)
 @IsArray()
 categories: categoryDTO[];

  @ApiProperty()
  @ValidateNested({each: true})
  @Type(() => ProductVariantDTO)
  @IsArray()
  variants: ProductVariantDTO[];

}

export class ProductStatusDTO {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
}

export class QueryProductDTO extends QueryRequestDTO{
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
categories: string;

@ApiPropertyOptional()
  @IsString()
  @IsOptional()
tags: string;

@ApiPropertyOptional()
 @IsEnum(ProductOrderFields)
 @IsOptional()
 orderBy: ProductOrderFields;


}

export class GetVariantsDTO {
  @ApiProperty()
  @IsString({each: true})
  variantIds: string[]
}

export class UpdateProductVariantStatusDTO {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}