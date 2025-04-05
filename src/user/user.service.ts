import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Auth } from '../entities/auth.entity';
import {
  QueryUserDTO,
  SendUserMessagesDTO,
  UpdateProfileDTO,
  UserProfileDTO,
} from '../shared/dtos/user.dto';
import { Profile } from '../entities/user.entity';
import { IQueryResult } from '../shared/interfaces/api-response.interface';
import { MailService } from '../mail/mail.service';
import { MailDTO } from '../shared/dtos/mail.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private mailerService: MailService,
  ) {}

  async updateUser(userId: string, dto: UpdateProfileDTO): Promise<Profile> {
    let newUser: Profile;
    let errorData: unknown;

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const { firstName, lastName, phoneNumber } = dto;
      const authUser = await queryRunner.manager.findOne(Auth, {
        where: { userId },
        relations: ['profile'],
      });
      if (!authUser) throw new NotFoundException('No user found');
      const profile = authUser.profile;

      if (firstName || lastName || phoneNumber) {
        const authData = { firstName, lastName, phoneNumber };
        await queryRunner.manager.save(Auth, { ...authUser, ...authData });
      }
      const userData = { ...profile, ...dto };
      const user = await queryRunner.manager.save(Profile, userData);
      await queryRunner.commitTransaction();
      newUser = user;
    } catch (error) {
      errorData = error;
      await queryRunner.rollbackTransaction();
    } finally {
      if (errorData) throw errorData;
      return newUser;
    }
  }

  getQueryBuilder(): SelectQueryBuilder<Profile> {
    const repository = this.dataSource.manager.getRepository(Profile);
    return repository.createQueryBuilder('users');
  }

  async getProfiles(
    dto: QueryUserDTO,
    userid?: string,
  ): Promise<IQueryResult<Profile>> {
    const { searchTerm, order, page, limit, ...queryFields } = dto;
    const queryPage = page ? Number(page) : 1;
    const queryLimit = limit ? Number(limit) : 10;
    const queryProfile = order ? order.toUpperCase() : 'DESC';
    const queryProfileBy = 'createdAt';

    const queryBuilder = this.getQueryBuilder();

    if (queryFields) {
      Object.keys(queryFields).forEach((field) => {
        queryBuilder.andWhere(`users.${field} = :value`, {
          value: queryFields[field],
        });
      });
    }

    if (userid) queryBuilder.andWhere(`users.userId = :userId`, { userid });

    if (searchTerm) {
      const searchFields = ['address'];
      let queryStr = `LOWER(users.firstName) LIKE :searchTerm OR LOWER(users.lastName) LIKE :searchTerm OR LOWER(users.email) LIKE :searchTerm OR LOWER(users.phoneNumber) LIKE :searchTerm`;
      searchFields.forEach((field) => {
        queryStr += ` OR LOWER(users.${field}) LIKE :searchTerm`;
      });
      queryBuilder.andWhere(queryStr, {
        searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy(`users.${queryProfileBy}`, queryProfile as 'ASC' | 'DESC')
      .skip((queryPage - 1) * queryLimit)
      .limit(queryLimit)
      .getManyAndCount();

    return { page: queryPage, limit: queryLimit, total, data };
  }

  async getAllUsersFiltered(
    dto: QueryUserDTO,
    userid?: string,
  ): Promise<Profile[]> {
    const { searchTerm, order, page, limit, ...queryFields } = dto;

    const queryBuilder = this.getQueryBuilder();

    if (queryFields) {
      Object.keys(queryFields).forEach((field) => {
        queryBuilder.andWhere(`users.${field} = :value`, {
          value: queryFields[field],
        });
      });
    }

    if (userid) queryBuilder.andWhere(`users.userId = :userId`, { userid });

    if (searchTerm) {
      const searchFields = ['address'];
      let queryStr = `LOWER(users.firstName) LIKE :searchTerm OR LOWER(users.lastName) LIKE :searchTerm OR LOWER(users.email) LIKE :searchTerm OR LOWER(users.phoneNumber) LIKE :searchTerm`;
      searchFields.forEach((field) => {
        queryStr += ` OR LOWER(users.${field}) LIKE :searchTerm`;
      });
      queryBuilder.andWhere(queryStr, {
        searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
      });
    }

    return await queryBuilder.getMany();
  }

  async sendEmailToUsers(
    dto: SendUserMessagesDTO,
    userId?: string,
  ) {
    const { subject, message, ...queryDto } = dto;

    const users = await this.getAllUsersFiltered(queryDto, userId);
    const mailDto: Partial<MailDTO> = {
      subject,
    };

    Promise.allSettled(
      users.map((user) =>
        this.mailerService.sendEmail({ to: user.email, subject }),
      ),
    );
    return true;
  }

  async getUser(userId: string): Promise<Profile>{
    return await this.dataSource.createQueryRunner().manager.findOneBy(Profile, {userId})
  }
}
