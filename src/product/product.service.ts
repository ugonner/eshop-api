import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import {
  ProductDTO,
  ProductStatusDTO,
  QueryProductDTO,
  TagDTO,
} from '../shared/dtos/product.dto';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../shared/guards/decorators/user.decorator';
import { Profile } from '../entities/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { OrderItemDTO } from '../shared/dtos/order.dto';
import { OrderItem } from '../entities/orderitem.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private fileUploadService: FileUploadService,
  ) {}

  private async createOrValidateProductTags(
    product: Product,
    tags: TagDTO[],
    queryRunner: QueryRunner,
  ): Promise<Tag[]> {
    if (tags?.length === 0) return [];
    const existingTags: Tag[] = [];
    const newTags: Tag[] = [];

    for (const tag of tags) {
      if (tag.id) existingTags.push(tag);
      else newTags.push(tag);
    }
    const createdTagsPromise = await Promise.allSettled(
      newTags.map((tag) => {
        const tagData = queryRunner.manager.create(Tag, tag);
        (tagData.products || []).push(product);
        return queryRunner.manager.save(Tag, tagData);
      }),
    );
    const createdTags: Tag[] = [];
    createdTagsPromise.forEach((res) => {
      if (res.status === 'fulfilled') createdTags.push(res.value);
    });

    const validateTagsPromise = await Promise.all(
      existingTags.map((tag) =>
        queryRunner.manager.findOneBy(Tag, { id: tag.id }),
      ),
    );
    validateTagsPromise.forEach((res, i) => {
      if (!res)
        throw new NotFoundException(`${existingTags[i].name} does not exist`);
      existingTags[i] = { ...res, ...existingTags[i] };
    });
    return [...existingTags, ...createdTags];
  }

  async createProduct(dto: ProductDTO, userId: string): Promise<Product> {
    let newProduct: Product;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { categories, variants, tags, ...productDto } = dto;

      const user = await queryRunner.manager.findOneBy(Profile, { userId });
      if (!user) throw new NotFoundException('user account not found');

      const product = queryRunner.manager.create(Product, productDto);
      product.user = user;
      product.variants = [];

      const allCategories = await queryRunner.manager.find(Category, {});
      const validatedCategories: Category[] = categories.reduce(
        (acc, category) => {
          const categoryExists = allCategories.find(
            (cat) => cat.id === category.id,
          );
          if (!categoryExists)
            throw new NotFoundException(
              `category ${category.name} does not exist`,
            );
          return [...acc, categoryExists];
        },
        [],
      );
      product.categories = validatedCategories;
      const productTags = await this.createOrValidateProductTags(
        product,
        tags,
        queryRunner,
      );
      product.tags = productTags;

      const prdt = await queryRunner.manager.save(Product, product);

      if (variants) {
        console.log('in variants SECTION');
        const productVariants = await Promise.all(
          variants.map((variant) =>
            this.prepareProductVariants(
              prdt,
              variant as ProductVariant,
              queryRunner,
            ),
          ),
        );
        //product.variants = productVariants.filter((variant) => Boolean(variant) );
      }
      await queryRunner.commitTransaction();
      newProduct = prdt;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      if (errorData) throw errorData;
      return newProduct;
    }
  }

  getQueryBuilder(): SelectQueryBuilder<Product> {
    const repository = this.dataSource.manager.getRepository(Product);
    return repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.user', 'user')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags');
  }

  async getProducts(dto: QueryProductDTO): Promise<IQueryResult<Product>> {
    const {
      maxPrice,
      minPrice,
      categories,
      tags,
      searchTerm,
      order,
      orderBy,
      page,
      limit,
      ...queryFields
    } = dto;
    const queryPage = page ? Number(page) : 1;
    const queryLimit = limit ? Number(limit) : 10;
    const queryOrder = order ? order.toUpperCase() : 'DESC';
    const queryOrderBy = orderBy ? orderBy : 'id';

    const queryBuilder = this.getQueryBuilder();

    if (queryFields) {
      Object.keys(queryFields).forEach((field) => {
        queryBuilder.andWhere(`product.${field} = :value`, {
          value: queryFields[field]
        });
      })
    }

    if(minPrice) queryBuilder.andWhere(`variants.price >= :minPrice`, {minPrice})
    if(maxPrice) queryBuilder.andWhere(`variants.price <=  :maxPrice`, {maxPrice});
    

    if (searchTerm) {
      const searchFields = ['name', 'description', 'imageUrl'];
      let queryStr = `LOWER(product.name) LIKE :searchTerm`;
      searchFields.forEach((field) => {
        queryStr += ` OR LOWER(product.${field}) LIKE :searchTerm`;
      });
      queryBuilder.andWhere(queryStr, {
        searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy(`product.${queryOrderBy}`, queryOrder as 'ASC' | 'DESC')
      .skip((queryPage - 1) * queryLimit)
      .limit(queryLimit)
      .getManyAndCount();

    return { page: queryPage, limit: queryLimit, total, data };
  }

  async getProductById(productId: string): Promise<Product> {
    return await this.dataSource.createQueryRunner().manager.findOne(Product, {
      where: { id: productId },
      relations: ['variants', 'tags', 'categories'],
    });
  }

  async prepareProductVariants(
    product: Product,
    variant: ProductVariant,
    queryRunner: QueryRunner,
  ): Promise<ProductVariant | null> {
    let updatedVariant: ProductVariant;
    if (variant.id) {
      const variantExists = await queryRunner.manager.findOneBy(
        ProductVariant,
        { id: variant.id, product: { id: product.id } },
      );
      if (variantExists) {
        const variantData = { ...variantExists, ...variant, product };
        const updatedVariant = await queryRunner.manager.save(
          ProductVariant,
          variantData,
        );
        return updatedVariant;
      }
    }
    const variantExists = await queryRunner.manager.findOneBy(ProductVariant, {
      size: variant.size,
      color: variant.color,
      productVariantType: variant.productVariantType,
      product: { id: product.id },
    });

    if (!variantExists) {
      const variantData = queryRunner.manager.create(ProductVariant, variant);
      variantData.product = product;
      const updatedVariant = await queryRunner.manager.save(
        ProductVariant,
        variantData,
      );
      return updatedVariant;
    }
    return;
  }

  async updateProduct(productId: string, dto: ProductDTO): Promise<Product> {
    let updatedProduct: Product;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const {
        categories,
        tags,
        variants,
        imageUrl,
        attachments,
        ...productDto
      } = dto;
      const productExists = await queryRunner.manager.findOne(Product, {
        where: { id: productId },
        relations: ['variants', 'tags', 'categories'],
      });
      if (!productExists) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const product = { ...productExists, ...productDto };

      const prevFiles = [];
      if (imageUrl) {
        product.imageUrl = imageUrl;
        prevFiles.push(product.imageUrl);
      }
      if (attachments) {
        product.attachments = [...(product.attachments || []), ...attachments];
      }

      const allCategories = await queryRunner.manager.find(Category, {});
      const validatedCategories: Category[] = categories.reduce(
        (acc, category) => {
          const categoryExists = allCategories.find(
            (cat) => cat.id === category.id,
          );
          if (!categoryExists)
            throw new NotFoundException(
              `category ${category.name} does not exist`,
            );
          return [...acc, categoryExists];
        },
        [],
      );
      product.categories = [
        ...(product.categories || []),
        ...validatedCategories,
      ];

      const productTags = await this.createOrValidateProductTags(
        product,
        tags,
        queryRunner,
      );
      product.tags = [...(product.tags || []), ...(productTags || [])];

      // Handling Variants
      if (variants) {
        const productVariants = await Promise.all(
          variants.map((variant) =>
            this.prepareProductVariants(
              product,
              variant as ProductVariant,
              queryRunner,
            ),
          ),
        );
        //product.variants = productVariants.filter((variant) => Boolean(variant) );
      }

      const prdt = await queryRunner.manager.save(Product, product);
      await queryRunner.commitTransaction();

      Promise.all(
        prevFiles.map((file) => this.fileUploadService.deleteFileLocal(file)),
      );
      updatedProduct = prdt;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      if (errorData) throw errorData;
      return updatedProduct;
    }
  }

  async updateProductPublicationStatus(
    productId: string,
    dto: ProductStatusDTO,
  ): Promise<Product> {
    let updatedProduct: Product;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const productExists = await queryRunner.manager.findOneBy(Product, {
        id: productId,
      });
      if (!productExists) throw new NotFoundException('Product not found');
      const productData: Partial<Product> = { ...productExists, ...dto };
      const prdt = await queryRunner.manager.save(Product, productData);
      await queryRunner.commitTransaction();
      updatedProduct = prdt;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      if (errorData) throw errorData;
      return updatedProduct;
    }
  }

  async validateProductInStock(items: OrderItem[], queryRunner: QueryRunner): Promise<boolean> {
    
    if(items.length === 0) throw new BadRequestException("No order items provided");
    items.forEach((item) => {
      const variant = item.productVariant;
      if(Number(variant.stock) < Number(item.quantity)) throw new BadRequestException(`Product Out of Stock: ${variant.product?.name} with specs: size: ${variant.size} | color: ${variant.color} | Available stock: ${variant.stock}`)
    });
  return true;
  }
}
