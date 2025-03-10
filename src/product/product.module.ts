import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    FileUploadModule
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}
