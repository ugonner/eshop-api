import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { OpenAPIConfiguration } from './documentation';
import { AllExceptionFilter } from './shared/interceptors/all-exceptions.filter';


async function bootstrap() {
 
  const app = await NestFactory.create(AppModule, {rawBody: true});
  
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());

  app.enableCors({ origin: '*' });
  //app.useGlobalFilters(new AllExceptionFilt
  
  //app.useGlobalFilters(new AllExceptionFilter())
  OpenAPIConfiguration.configureSwagger(app);
const port = process.env.PORT || 8000;
  await app.listen(port, "0.0.0.0", () => console.log("Server RUnning on port", port ));
}
bootstrap();
