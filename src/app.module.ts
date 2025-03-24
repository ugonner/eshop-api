import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from "path";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "..", "public"),
    }),
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.NODE_ENV === "development" ? null : process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: ['dist/**/*.entity.js'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: false
      }),
      inject: [ConfigService]
    }),
    MailerModule.forRoot({
      transport: {
        host: `${process.env.NODEMAILER_HOST}`, // Replace with your SMTP server
        port: 587, // SMTP port
        secure: false, // Use TLS or not
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
        },
      },
      defaults: {
        from: `${process.env.NODEMAILER_USERNAME} <${process.env.NODEMAILER_USER}>`, // Default sender
      },
      template: {
        dir: path.join(__dirname, '../src/mail/templates'), // Path to email templates
        adapter: new HandlebarsAdapter(), // Template engine adapter
        options: {
          strict: true,
        },
      },
    }),
    
    AuthModule,
    MailModule,
    UserModule,
    ProductModule,
    OrderModule,
    CategoryModule,
    TransactionModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
