import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFiles, HttpStatus, Put, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { GetVariantsDTO, ProductDTO, ProductStatusDTO, QueryProductDTO, UpdateProductVariantStatusDTO } from '../shared/dtos/product.dto';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags("product")
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService, private fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createProduct(
    @Body()
    payload: ProductDTO,
    @User("userId") userId: string
  ) {
    try{
        const res = await this.productService.createProduct(payload, userId);
        return ApiResponse.success("Product created successfully", res);
      }catch(error){
      const savedFiles = [...(payload.attachments?.map((attachment) => attachment.attachmentUrl) || []), payload.imageUrl];
      if(savedFiles.length > 0){
        Promise.all(
          savedFiles.map((fileUrl) => this.fileUploadService.deleteFileLocal(fileUrl))
        );
      }
      throw error;
    }
  }

  
  @Post("/variants")
  async getVariants(
    @Body() payload: GetVariantsDTO
  ){
    const res = await this.productService.getVariants(payload);
    return ApiResponse.success("variants got successfully", res);
  }
  
  @Put(":productId")
  @UseGuards(JwtGuard)
  async updateProduct(
    @Body()
    payload: ProductDTO,
    @Param("productId") productId: string,
    @User("userId") userId: string
  ) {
      console.log("got in update");
      const res = await this.productService.updateProduct(productId, payload);
        return ApiResponse.success("Product updated successfully", res);
       }

  @Put("/status/:productId")
  async updateProductStatus(
    @Param("productId") productId: string,
    @Body() payload: ProductStatusDTO
  ){
    const res = await this.productService.updateProductPublicationStatus(productId, payload);
    return ApiResponse.success("Product status updated successfully", res);
  }

  @Put("variant/:variantId")
  @UseGuards(JwtGuard)
  async updateProductVariant(
    @Param("variantId") variantId: string,
    @Body() payload: UpdateProductVariantStatusDTO
  ){
    const res = await this.productService.deleteVariant(variantId, payload);
    return ApiResponse.success("Variant status updated ", res);
  }

  @Get()
  async getAllProducts(
    @Query() payload: QueryProductDTO,
  ) {
    const res = await this.productService.getProducts(payload);
    return ApiResponse.success("Products fetched successfully", res);
  }

  @Get("tags")
  async getAllTags(){
    const res = await this.productService.getTags();
    return ApiResponse.success("Tags fetched successfully", res);
  }


  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const res = await this.productService.getProductById(id);
    return ApiResponse.success("product fetched successfully", res);
  }
}
