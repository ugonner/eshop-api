import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { categoryDTO } from '../shared/dtos/category.dto';
import { Category } from '../entities/category.entity';
import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { Product } from '../entities/product.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource
    ){}

    async createCategory(dto: categoryDTO): Promise<Category> {
        let newCategory: Category;
        let errorData: unknown;
        const queryRunner = this.dataSource.createQueryRunner();
        try{
            await queryRunner.startTransaction();
            const category = queryRunner.manager.create(Category, dto);
            const createdCategory = await queryRunner.manager.save(Category, category);
            await queryRunner.commitTransaction();
            newCategory = createdCategory
        }catch(error){
            errorData = error;
            await queryRunner.rollbackTransaction();
        }finally{
            await queryRunner.release();
            if(errorData) throw errorData;
            return newCategory;
        }
    }

    

    async updateCategory(categoryId: string, dto: categoryDTO): Promise<Category> {
        let newCategory: Category;
        let errorData: unknown;
        const queryRunner = this.dataSource.createQueryRunner();
        try{
            await queryRunner.startTransaction();
            const categoryExists = await queryRunner.manager.findOneBy(Category, {id: categoryId});
            if(!categoryExists) throw new NotFoundException("cATEGORY NOT FOUND");

            const category = queryRunner.manager.create(Category, dto);
            const createdCategory = await queryRunner.manager.save(Category, category);
            await queryRunner.commitTransaction();
            newCategory = createdCategory;
        }catch(error){
            errorData = error;
            await queryRunner.rollbackTransaction();
        }finally{
            await queryRunner.release();
            if(errorData) throw errorData;
            return newCategory;
        }
    }

    async getCategories(): Promise<IQueryResult<Category>> {
        const qB = this.dataSource.getRepository(Category).createQueryBuilder("category");
        const [data, total] = await qB.getManyAndCount();
        return {page: 1, limit: 0, total, data}; 
    }

    async getCategory(categoryId: string): Promise<Category> {
        const products = await this.dataSource.createQueryRunner().manager.find(Product, {
            where: {categories: {id: categoryId}},
            relations: ["variants"],
            skip: 0,
            take: 12,
            order: {createdAt: "DESC"}
        });
        const category = await this.dataSource.createQueryRunner().manager.findOneBy(Category, {id: categoryId});
        category.products = products;
        return category;
    }
    
}