import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';
import * as bcrypt from 'bcryptjs';

import { validate } from 'class-validator';
import { UserProfileDTO } from '../shared/dtos/user.dto';
import { DBUtils } from '../shared/helpers/db';
import { NotificationService } from '../notifiction/notification.service';

import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { Profile } from '../entities/user.entity';
import { AuthDTO, OtpAuthDTO, QueryAuthDTO, RoleDTO } from '../shared/dtos/auth.dto';
import { Role } from '../entities/role.entity';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService,
    @InjectDataSource()
    private dataSource: DataSource,
    private notificationService: NotificationService,
  ) {}

  private logger: Logger = new Logger(AuthService.name);
  generateOTP(): number{
    return Number(`${Math.random()}`.substr(2, 6))
  }

  async createAccount(dto: UserProfileDTO): Promise<Auth> {
    let newAuth: Auth;
    let errorData: unknown;
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      await this.validateDto(dto);
      const { email, firstName, lastName, gender, ...rest } = dto;

      const userExist = await queryRunner.manager.findOneBy(Auth, [
        {email},
        {phoneNumber: dto.phoneNumber}
      ]);
      if (userExist) throw new BadRequestException('Email already / Phone number exists');

      const payload: Partial<Auth> = {
        email: email.toLowerCase(),
        ...rest,
        firstName,
        lastName,
        isVerified: true // TODO: Remove
      };
      payload.otpTime = new Date();
      payload.userId = await DBUtils.generateUniqueID(
        this.authRepository,
        'userId',
        8,
        firstName,
      );

      payload.otp = this.generateOTP();
      const auth = queryRunner.manager.create(Auth, payload);

      const newAuthUser = await queryRunner.manager.save(Auth, auth);
      
      const profile = queryRunner.manager.create(Profile, {
        userId: auth.userId,
        email: email.toLocaleUpperCase(),
        phoneNumber: auth.phoneNumber,
        firstName,
        lastName,
        gender,
        account: newAuthUser,
      });
      
      const newUserProfile = await queryRunner.manager.save(
        Profile,
        profile,
      );
      
      await this.notificationService.sendEmail([auth.email], {
        subject: 'Account Creation Activation',
        template: {
          templatePath: '',
          content: {
            otp: payload.otp,
            name: firstName,
          },
        },
      });
      
      await queryRunner.commitTransaction();
      newAuth = newAuthUser;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      if(errorData) throw errorData;
      return newAuth;
    }
  }

  private async validateDto(registerDto: UserProfileDTO): Promise<void> {
    const errors = await validate(registerDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  async login(dto: AuthDTO, values: { userAgent: string; ipAddress: string }) {
    const user = await this.authRepository.findOne({
      where: [
        { email: dto.email.toLowerCase() },
        { phoneNumber: dto.phoneNumber}
      ],
      relations: ["role","profile"]
    });
    if (!user) throw new NotFoundException('Invalid credentials');

    if (!user.isVerified) throw new BadRequestException('Account not verified');

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) throw new BadRequestException('Invalid credentials');

    const { accessToken, refreshToken } =
      await this.generateRefreshAndAccessToken(user.toAuthData(), values);

    const userData = {
      ...user,
      token: accessToken,
      refreshToken,
    };

    return userData;
  }

  async generateRefreshAndAccessToken(
    user: Partial<Auth>,
    refreshData: { userAgent: string; ipAddress: string },
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          user,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        },
      ),
      this.jwtService.signAsync(
        {
          userId: user.userId,
          ...refreshData,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  //verify account
  async verifyAccount(
    dto: OtpAuthDTO,
    values: { userAgent: string; ipAddress: string },
  ) {
    const auth = await this.authRepository.findOneBy({ email: dto.email });
    if (!auth)
      throw new NotFoundException(
        'No account found, you can re-register again',
      );
    if (auth.isVerified)
      throw new BadRequestException('aCCOUNT ALREADY verified, sign in');

    const otpExpireTime = new Date(auth.otpTime).getTime() + 10 * 60 * 1000;
    if (otpExpireTime < Date.now()) {
      throw new ForbiddenException('Verification code has expired');
    }
    await this.authRepository.update(
      { email: auth.email },
      { isVerified: true, otp: undefined },
    );
    this.notificationService.sendEmail([auth.email], {
      subject: 'Account Verified',
      message: 'Your Account has been verified succesfully, Go ahead and login',
    });
    const { accessToken, refreshToken } =
      await this.generateRefreshAndAccessToken(auth.toAuthData(), values);

    return { token: accessToken, refresh: refreshToken };
  }

  //resend verification token
  async resendOtp(payload: OtpAuthDTO): Promise<OtpAuthDTO> {
    try {
      const auth = await this.authRepository.findOne({
        where: { email: payload.email },
        relations: ['profile'],
      });
      if (!auth) {
        throw new NotFoundException('Account not found');
      }
      if (auth.isVerified) {
        throw new BadRequestException('Account has already been verified');
      }
      const otp = Number(Math.random().toString().substr(2, 6));
      await this.authRepository.update(
        { email: payload.email },
        { otp, otpTime: new Date() },
      );
      this.notificationService.sendEmail([auth.email], {
        subject: 'Verify Your Account',
        message: `${auth.profile.firstName} verify your account with ${otp}`,
      });
      return { email: payload.email, otp };
    } catch (error) {
      this.logger.error('Resend verification code failed', error.stack);
      throw new BadRequestException(
        error.message || 'Resend verification code failed',
      );
    }
  }

  //reset password link
  async requestResetPassword(payload: OtpAuthDTO): Promise<OtpAuthDTO> {
    const auth = await this.authRepository.findOne({
      where: { email: payload.email },
      relations: ['profile'],
    });
    if (!auth) {
      throw new NotFoundException('Account not found');
    }
    if (!auth.isVerified) {
      throw new BadRequestException(
        'Account is not verified, kindly verify your account to proceed',
      );
    }

    const otp = Number(Math.random().toString().substr(2, 6));
    await this.authRepository.update(
      { email: payload.email },
      { otp, otpTime: new Date() },
    );
    await this.notificationService.sendEmail([payload.email], {
      subject: 'Reset Password',
      message: `Use ${otp} to reset your password`,
    });
    return {
      email: payload.email,
      otp,
    };
  }

  //reset password
  async resetPassword(payload: OtpAuthDTO) {
    const auth = await this.authRepository.findOneBy({ email: payload.email });
    if (!auth) {
      throw new NotFoundException('Account not found or invalid token');
    }
    if (!auth.isVerified) {
      throw new BadRequestException('Verify your account to proceed');
    }

    if (payload.otp !== auth.otp) throw new BadRequestException('Invalid OTP');

    const otpExpireTime = new Date(auth.otpTime).getTime() + 10 * 60 * 1000;

    if (otpExpireTime < new Date().getTime()) {
      throw new UnauthorizedException('Verification code has expired');
    }
    const password = await bcrypt.hash(payload.password, 10);
    await this.authRepository.update(
      { otp: auth.otp },
      { password, otp: null },
    );
    this.notificationService.sendEmail([payload.email], {
      subject: 'Password reset successful',
      message: 'Your password was reset successfully',
    });
    return 'Password reset done';
  }

  
  async createRole(dto: RoleDTO): Promise<Role> {
    let errorData: unknown;
    let savedRole: Role;
    const queryRunner = this.dataSource.createQueryRunner();
    try{
      await queryRunner.startTransaction();
      const {name, description} = dto;
      const roleExists = await queryRunner.manager.findOneBy(Role, {name: name.toLowerCase()});
      if(roleExists) throw new BadRequestException("Role already exists");
      const roledata = queryRunner.manager.create(Role, {...dto, name: name.toLowerCase()});
      const role = await queryRunner.manager.save(Role, roledata);
      await queryRunner.commitTransaction();
      savedRole = role;
    }catch(error){
      errorData = error;
      await queryRunner.rollbackTransaction();
    }finally{
      await queryRunner.release();
      if(errorData) throw errorData;
      return savedRole;
    }
  }

  async updateRole(roleId: number, dto: RoleDTO): Promise<Role> {
    let errorData: unknown;
    let savedRole: Role;
    const queryRunner = this.dataSource.createQueryRunner();
    try{
      await queryRunner.startTransaction();
      const roleExists = await queryRunner.manager.findOneBy(Role, {id: roleId});
      if(!roleExists) throw new BadRequestException("Role not found");
      const roledata = queryRunner.manager.create(Role, {...roleExists, ...dto});
      if(dto.name) roledata.name = dto.name.toLowerCase();

      const role = await queryRunner.manager.save(Role, roledata);
      await queryRunner.commitTransaction();
      savedRole = role;
    }catch(error){
      errorData = error;
      await queryRunner.rollbackTransaction();
    }finally{
      await queryRunner.release();
      if(errorData) throw errorData;
      return savedRole;
    }
  }

  async assignRole(userId: string, roleId: number): Promise<Auth> {
    let errorData: unknown;
    let updatedAuthUser: Auth;
    const queryRunner = this.dataSource.createQueryRunner();
    try{
      await queryRunner.startTransaction();
      const user = await queryRunner.manager.findOneBy(Auth, {userId});
      if(!user) throw new NotFoundException("User not found");

      const role = await queryRunner.manager.findOneBy(Role, {id: roleId});
      if(!role) throw new NotFoundException("Role not found");

      user.role = role;
      await queryRunner.manager.save(Auth, user);
      await queryRunner.commitTransaction();
      updatedAuthUser = user;
    }catch(error){
      errorData = error;
      await queryRunner.rollbackTransaction();
    }finally{
      await queryRunner.release();
      if(errorData) throw errorData;
      return updatedAuthUser;
    }
  }
  
  async getAuthUsers(dto: QueryAuthDTO): Promise<IQueryResult<Auth>> {
    const {page, limit, searchTerm, order} = dto;
    const queryPage = page ? Number(page) : 1;
    const queryLimit = limit ? Number(limit) : 10;
    const querOrder = order ? order : "ASC";

    const queryBuilder = this.authRepository.createQueryBuilder("user")
    .leftJoinAndSelect(`user.aidServices`, `aidServices`);
    
    if(searchTerm){
      const searchTermLowercase = searchTerm.toLowerCase();
      let whereClause = `LOWER("user"."email") LIKE '%${searchTermLowercase}%' `;
      ["firstName", "lastName", "phoneNumber"].forEach((field) => {
        whereClause += `OR LOWER("user"."${field}") LIKE '%${searchTermLowercase}%' `;
      });
      queryBuilder.where(whereClause);
    }
    queryBuilder.orderBy(`"user"."firstName"`, querOrder)
    if(page) queryBuilder.skip((queryPage - 1) * queryLimit).limit(queryLimit);
   const [data, total] = await queryBuilder.getManyAndCount();
  return { page: queryPage, limit: queryLimit, total, data};
  }
  
  async getUserByEmail(email: string): Promise<Auth> {
    return await this.dataSource.createQueryRunner().manager.findOneBy(Auth, {email});
  }

  async getRoles(): Promise<Role[]> {
    return await this.dataSource.createQueryRunner().manager.findBy(Role, {})
  }
}