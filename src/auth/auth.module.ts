import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { Auth } from '../entities/auth.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notifiction/notification.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    JwtModule,
    NotificationModule,
    MailModule,
    TypeOrmModule.forFeature([Auth]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
