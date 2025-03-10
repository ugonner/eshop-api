import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { categoryDTO } from '../shared/dtos/category.dto';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Category")
@Controller('category')
export class CategoryController {
    constructor(
        private categoryService: CategoryService
    ){}

    @UseGuards(JwtGuard)
    @Post()
    async createCategory(
        @Body() payload: categoryDTO,
        @User("userId") userId: string
    ){
        const res = await this.categoryService.createCategory(payload);
        return ApiResponse.success("category created", res);

    }

    @UseGuards(JwtGuard)
    @Put(":categoryId")
    async updateateCategory(
        @Param("categoryId") categoryId: string,
        @Body() payload: categoryDTO,
        @User("userId") userId: string
    ){
        const res = await this.categoryService.updateCategory(categoryId, payload);
        return ApiResponse.success("category created", res);

    }
}
