import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notifiction/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
