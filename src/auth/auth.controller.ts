import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { QuickRegisterDTO, UserProfileDTO } from '../shared/dtos/user.dto';
import { ApiResponse } from '../shared/helpers/apiresponse';
import { AuthDTO, OtpAuthDTO, QueryAuthDTO, RoleDTO } from '../shared/dtos/auth.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionFilter } from '../shared/interceptors/all-exceptions.filter';
import { JwtGuard } from '../shared/guards/jwt.guards';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notifiction/notification.service';

@ApiTags("Auth")
@UseFilters(AllExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private notificationService: NotificationService) {}

  // TODO: add permission guard to this route
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async registerAdminAccount(@Body() payload: UserProfileDTO, @Req() req) {
    const resp = await this.authService.createAccount(payload);
    const tokenData = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    const res = await this.authService.login(payload, tokenData)
    return ApiResponse.success('User Account Created Successfully', res);
  }
  // TODO: add permission guard to this route
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post('/register/auto')
  async quickRegister(@Body() payload: QuickRegisterDTO, @Req() req) {
    const tokenData = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
    if(!payload) throw new BadRequestException("No data filled");
    
    payload.password = payload.password ? payload.password : payload.email.split("@")[0];
    
    await this.authService.createAccount(payload as AuthDTO);
    console.log("payload", payload);
    
    const res = await this.authService.login(payload as AuthDTO, tokenData)
    
    console.log("user res", res);
    
    this.notificationService.sendEmail([payload.email], {
      to: payload.email,
      subject: `New Account Detail`,
      template: "./generals/general.hbs",
      receiverName: payload.email,
        message: "Your account has been created successfully,",
        entries: {
          password: payload.password
        }
      
    }).catch((err) => console.log("Error sending new account email", err.message))
    
    return ApiResponse.success('User Account Created Successfully', res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Body() payload: AuthDTO,
    @Req() req,
    @Ip() ip: string,
  ): Promise<ApiResponse> {
    const refreshTokenData = {
      userAgent: req.headers['user-agent'],
      ipAddress: ip,
    };
    const user = await this.authService.login(payload, refreshTokenData);
    //TODO - Set Tokens Cookie

    // Return the API response
    return ApiResponse.success('Login successful', user);
  }

  @Post('/verify-account')
  @HttpCode(HttpStatus.OK)
  async verifyAccount(
    @Body() payload: OtpAuthDTO,
    @Req() req,
    @Ip() ip: string,
  ) {
    const refreshTokenData = {
      userAgent: req.headers['user-agent'],
      ipAddress: ip,
    };

    const user = await this.authService.verifyAccount(
      payload,
      refreshTokenData,
    );

    // TODO - Set Token Cookies
    return ApiResponse.success('Verification successsful', user);
  }

  @Post('/reset-password')
  async resetPassword(@Body() payload: OtpAuthDTO) {
    const user = await this.authService.resetPassword(payload);
    return ApiResponse.success('Password Reset Successfull', user);
  }

  @Post('/request-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() payload: OtpAuthDTO) {
    const user = await this.authService.sendOtp(payload);
    return ApiResponse.success('Successfully sent verification code', user);
  }

  @Post("role")
  @UseGuards(JwtGuard)
  async createRole(
    @Body() payload: RoleDTO
  ){
    const res = await this.authService.createRole(payload)
    return ApiResponse.success("role saved successfully", res);
  }
  
  @Put("role/:roleId")
  @UseGuards(JwtGuard)
  async updateRole(
    @Param("roleId", new ParseIntPipe()) roleId: number,
    @Body() payload: RoleDTO
  ){
    const res = await this.authService.updateRole(roleId, payload)
    return ApiResponse.success("role saved successfully", res);
  }


  @Post("assign-role/:roleId")
  @UseGuards(JwtGuard)
  async assignRole(
    @Body() payload: {id: string},
    @Param("roleId", new ParseIntPipe()) roleId: number
  ){
    const res = await this.authService.assignRole(payload.id, roleId);
    return ApiResponse.success("user updated", res);
  }

  
  @Get("role")
  async getRoles(){
    const res = await this.authService.getRoles()
    return ApiResponse.success("roles fetched successfully", res);
  }

  @Get()
  async getAuthUsers(
    @Query() payload: QueryAuthDTO,
  ){
    const res = await this.authService.getAuthUsers(payload);
    return ApiResponse.success("Users fetched successfully", res);
  }


}
