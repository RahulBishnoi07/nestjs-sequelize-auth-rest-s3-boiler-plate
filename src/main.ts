import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { applicationConfig } from 'config';
import { AllExceptionsFilter } from './utils/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const res = await app.listen(applicationConfig.app.port, '0.0.0.0');
  const serverAddress = res.address();

  Logger.log(
    `⚡ Server is listening at http://${serverAddress.address}:${serverAddress.port}`,
  );
}

bootstrap();
