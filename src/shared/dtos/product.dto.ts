import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { IAttachment } from "../interfaces/typings";
import { Type } from "class-transformer";
import { ProductOrderFields, ProductVariantType } from "../enums/product.enum";
import { categoryDTO } from "./category.dto";

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
}

export class QueryProductDTO {
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
  @IsString({each: true})
 @IsArray()
@IsOptional()
categories: string[];
@ApiPropertyOptional()
@IsString({each: true})
@IsArray()
@IsOptional()
tags: string[];

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
 @IsEnum(ProductOrderFields)
 @IsOptional()
 orderBy: ProductOrderFields;


}
