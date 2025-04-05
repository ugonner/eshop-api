import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  GetVariantsDTO,
  ProductDTO,
  ProductStatusDTO,
  ProductVariantDTO,
  QueryProductDTO,
  TagDTO,
  UpdateProductVariantStatusDTO,
} from '../shared/dtos/product.dto';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../shared/guards/decorators/user.decorator';
import { Profile } from '../entities/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { OrderItemDTO } from '../shared/dtos/order.dto';
import { OrderItem } from '../entities/orderitem.entity';
import { handleDateQuery } from '../shared/helpers/db';

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

  private collateResidualFiles(
    dto: ProductDTO,
    product?: Product,
  ): { prevFiles: string[]; newFiles: string[] } {
    let prevFiles = [];
    let newFiles = [];

    if (product?.imageUrl !== dto?.imageUrl) prevFiles.push(product?.imageUrl);
    newFiles.push(dto?.imageUrl);

    dto.variants.forEach((variant) => {
      if (product && product.variants) {
        const prevVariant = product.variants.find(
          (prevVariant) => prevVariant.id === variant.id,
        );
        if (prevVariant?.imageUrl !== variant?.imageUrl) {
          prevFiles.push(prevVariant?.imageUrl);
        }
      }
      newFiles.push(variant?.imageUrl);
    });
    return { prevFiles, newFiles };
  }

  async createProduct(dto: ProductDTO, userId: string): Promise<Product> {
    let newProduct: Product;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const { prevFiles, newFiles } = this.collateResidualFiles(dto);

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
        await this.validateAndCreateVariants(variants, product, queryRunner);
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
      startDate,
      endDate,
      dDate,
      order,
      orderBy,
      page,
      limit,
      ...queryFields
    } = dto;
    const queryPage = page ? Number(page) : 1;
    const queryLimit = limit ? Number(limit) : 10;
    const queryOrder = order ? order.toUpperCase() : 'DESC';
    const queryOrderBy = orderBy ? orderBy : 'createdAt';

    let queryBuilder = this.getQueryBuilder();

    if (queryFields) {
      Object.keys(queryFields).forEach((field) => {
        queryBuilder.andWhere(`product.${field} = :value`, {
          value: queryFields[field],
        });
      });
    }

    if (startDate || endDate || dDate) {
      queryBuilder = handleDateQuery<Product>(
        { startDate, endDate, dDate, entityAlias: 'product' },
        queryBuilder,
        'createdAt',
      );
    }

    if (minPrice)
      queryBuilder.andWhere(`variants.price >= :minPrice`, { minPrice });
    if (maxPrice)
      queryBuilder.andWhere(`variants.price <=  :maxPrice`, { maxPrice });

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

    //queryBuilder.andWhere(`product.isDeleted = :isDeleted`, {isDeleted: true})

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
      flavor: variant.flavor,
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

  async validateAndCreateVariants(
    variants: ProductVariantDTO[],
    product: Product,
    queryRunner: QueryRunner,
  ): Promise<ProductVariant[]> {
    let productVariants: ProductVariant[] = [];
    if (product?.variants) productVariants = product.variants;
    else
      productVariants = await queryRunner.manager.find(ProductVariant, {
        where: {
          product: { id: product.id },
        },
      });
    const validVariants: ProductVariant[] = [];
    variants.forEach((variantDto) => {
      const variant = queryRunner.manager.create(ProductVariant, variantDto);
      (variant as ProductVariant).product = product;
      (variant as any).productId = product.id;
      if (variantDto.id) {
        const variantExists = productVariants.find(
          (pVariant) => pVariant.id === variant.id,
        );
        if (variantExists) validVariants.push(variant as ProductVariant);
      } else {
        const variantExists = productVariants.find(
          (pVariant) =>
            pVariant.size === variant.size &&
            pVariant.color === variant.color &&
            pVariant.flavor === variant.flavor,
        );
        if (!variantExists) validVariants.push(variant as ProductVariant);
      }
    });
    console.log('varinats length', validVariants.length);
    await queryRunner.manager.save(ProductVariant, validVariants);
    return validVariants;
  }

  async updateProduct(productId: string, dto: ProductDTO): Promise<Product> {
    let updatedProduct: Product;
    let errorData: unknown;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let prevFiles = [];
    let newFiles = [];
    try {
      //console.log("dto", dto);
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
        relations: ['tags', 'categories', 'variants'],
      });
      if (!productExists) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const staleFiles = this.collateResidualFiles(dto, productExists);
      prevFiles = staleFiles.prevFiles;
      newFiles = staleFiles.newFiles;

      const product = { ...productExists, ...productDto };

      if (imageUrl) {
        product.imageUrl = imageUrl;
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
      product.categories = [...validatedCategories];

      const productTags = await this.createOrValidateProductTags(
        product,
        tags,
        queryRunner,
      );
      product.tags = [...(productTags || [])];

      // Handling Variants
      if (variants) {
        const validVariants = await this.validateAndCreateVariants(
          variants,
          productExists,
          queryRunner,
        );
        console.log('valid varinats', validVariants);
        product.variants = validVariants;
        //product.variants = productVariants.filter((variant) => Boolean(variant) );
      }

      const prdt = await queryRunner.manager.save(Product, product);
      await queryRunner.commitTransaction();

      updatedProduct = prdt;
      Promise.allSettled(
        prevFiles.map((file) => this.fileUploadService.deleteFileLocal(file)),
      ).then((res) =>
        console.log(
          ...res.map((resValue) =>
            resValue.status === 'rejected' ? resValue.reason : null,
          ),
        ),
      );
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

  async validateProductInStock(
    items: OrderItem[],
    queryRunner: QueryRunner,
  ): Promise<boolean> {
    if (items.length === 0)
      throw new BadRequestException('No order items provided');
    items.forEach((item) => {
      const variant = item.productVariant;
      if (Number(variant.stock) < Number(item.quantity))
        throw new BadRequestException(
          `Product Out of Stock: ${variant.product?.name} with specs: size: ${variant.size} | color: ${variant.color} | Available stock: ${variant.stock}`,
        );
    });
    return true;
  }

  async getTags(): Promise<IQueryResult<Tag>> {
    const qB = this.dataSource.getRepository(Tag).createQueryBuilder('tag');
    const [data, total] = await qB.getManyAndCount();
    return { page: 1, limit: 0, total, data };
  }

  async getVariants(dto: GetVariantsDTO): Promise<ProductVariant[]> {
    return await this.dataSource
      .createQueryRunner()
      .manager.find(ProductVariant, {
        where: { id: In(dto.variantIds) },
        relations: ['product'],
      });
  }

  async deleteVariant(variantId: string, dto: UpdateProductVariantStatusDTO) {
    let errorData: unknown;
    let variant: ProductVariant;
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const variantExists = await queryRunner.manager.findOneBy(
        ProductVariant,
        { id: variantId },
      );
      if (!variantExists) throw new NotFoundException('Variant not found');
      const variantData = { ...variantExists, ...dto };
      await queryRunner.manager.save(ProductVariant, variantData);
      await queryRunner.commitTransaction();
      variant = variantExists;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      if (errorData) throw errorData;
      return variant;
    }
  }
}
