import { Body, Controller, Get, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../shared/guards/decorators/user.decorator';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { Auth } from '../entities/auth.entity';
import { QueryUserDTO, SendUserMessagesDTO, UpdateProfileDTO, UserProfileDTO } from '../shared/dtos/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionFilter } from '../shared/interceptors/all-exceptions.filter';

@ApiTags("user")
@UseFilters(AllExceptionFilter)
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ){}

    @Put()
    @UseGuards(JwtGuard)
    async updateUser(
        @Body() payload: UpdateProfileDTO,
        @User() user: Auth,
        @Query() queryPayload: {userId: string}
    ){
        const userId = queryPayload.userId || user?.userId;
        const res = await this.userService.updateUser(userId, payload);
        return ApiResponse.success("user updated successfully", res);
    }

    

    @Post("send")
    async sendMessageToUsers(
        @Body() payload: SendUserMessagesDTO
    ){
        const res = await this.userService.sendEmailToUsers(payload);
        return ApiResponse.success("Messages sent", res);
    }

    @Get("profile")
    @UseGuards(JwtGuard)
    async getUser(
        @User("userId") userId: string
    ){
        const res = await this.userService.getUser(userId);
        return ApiResponse.success("User profile fetched successfully", res);
    }
    @Get()
    async getUsers(
        @Query() payload: QueryUserDTO
    ){
        const res = await this.userService.getProfiles(payload)
        return ApiResponse.success("users fetched successfullly", res);
    }


}
